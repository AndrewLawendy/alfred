const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

const { isDue, describe, sentKey } = require("./reminder");

initializeApp();
const db = getFirestore();

// Cairo until the app sends each person's location
const CAIRO = { lat: 30.0444, lon: 31.2357 };

const getWeather = async ({ lat, lon }) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_ID}`;
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Weather request failed: ${response.status}`);
  const json = await response.json();
  return { temp: json.main.temp, description: json.weather[0].description };
};

// A device that's gone (app uninstalled, notifications revoked). Not
// "invalid-argument": a bad message returns it too, for every device.
const isGone = (error) =>
  [
    "messaging/registration-token-not-registered",
    "messaging/invalid-registration-token",
  ].includes(error?.code);

// Title and body for this person's reminder right now, or null without outfits
const compose = async (uid, reminder) => {
  const [outfitsSnapshot, itemsSnapshot] = await Promise.all([
    db.collection("outfits").where("user", "==", uid).get(),
    db.collection("wardrobe-items").where("user", "==", uid).get(),
  ]);
  const outfits = outfitsSnapshot.docs
    .map((doc) => doc.data())
    .sort((a, b) => a.order - b.order);
  if (outfits.length === 0) return null;

  const index = Math.max(
    0,
    outfits.findIndex(({ active }) => active)
  );
  // Nudge towards the next outfit, unless there's only one
  const isNudge = outfits.length > 1;
  const outfit = outfits[isNudge ? (index + 1) % outfits.length : index];
  const titles = Object.fromEntries(
    itemsSnapshot.docs.map((doc) => [doc.id, doc.data().title])
  );
  const pieces = ["shirt", "belt", "pants", "shoes"]
    .map((slot) => titles[outfit[slot]?.id])
    .filter(Boolean);
  const jackets = itemsSnapshot.docs
    .map((doc) => doc.data())
    .filter(({ type }) => type === "jacket");
  const weather = await getWeather(reminder.coords || CAIRO).catch((error) => {
    logger.warn("No weather for the reminder", { uid, error: error.message });
    return undefined;
  });

  return {
    ...describe({ isNudge, pieces, weather, jackets, chosen: outfit.jacket }),
    // "Wear it" moves the rotation on, like the Next outfit shortcut
    ...(isNudge && { action: "/?action=next" }),
  };
};

// Send to every device of a reminder and drop the ones that are gone
const send = async (reference, reminder, { title, body, action }) => {
  const { responses } = await getMessaging().sendEachForMulticast({
    tokens: reminder.tokens,
    data: { title, body, url: "/", ...(action && { action }) },
    webpush: { headers: { Urgency: "high", TTL: String(3 * 60 * 60) } },
  });

  const gone = reminder.tokens.filter((_, i) => isGone(responses[i].error));
  if (gone.length) {
    await reference.update({ tokens: FieldValue.arrayRemove(...gone) });
  }
  const sent = responses.filter(({ success }) => success).length;
  logger.info(`Sent a reminder to ${sent} device(s)`, {
    uid: reference.id,
    removed: gone.length,
  });
  return sent;
};

const remind = async (reference, reminder, now) => {
  const message = await compose(reference.id, reminder);
  if (!message) return;
  await send(reference, reminder, message);
  await reference.update({
    lastSentFor: sentKey(reminder, now),
    lastSentAt: FieldValue.serverTimestamp(),
  });
};

// Every 5 minutes on the clock (:00, :05, …) so a 08:55 reminder goes out at
// 08:55; "every 5 minutes" would count from when the job was created.
// Sends the reminders that are due in their own timezones.
// ponytail: reads every reminder each run; fine for a few people, query by
// time slot if Alfred ever has many users.
exports.morningReminder = onSchedule("*/5 * * * *", async () => {
  const now = new Date();
  const snapshot = await db.collection("reminders").get();
  await Promise.all(
    snapshot.docs
      .filter((doc) => isDue(doc.data(), now))
      .map((doc) =>
        remind(doc.ref, doc.data(), now).catch((error) =>
          logger.error("Reminder failed", { uid: doc.id, error: error.message })
        )
      )
  );
});

// "Send a test" in Account: this person's reminder now, whatever the schedule
exports.sendTestReminder = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in first.");
  const reference = db.collection("reminders").doc(uid);
  const reminder = (await reference.get()).data();
  if (!reminder?.tokens?.length) {
    throw new HttpsError(
      "failed-precondition",
      "Switch the reminder on on this device first."
    );
  }
  const message = (await compose(uid, reminder)) || {
    title: "Alfred",
    body: "Your reminders work. Add an outfit to see it here each morning.",
  };
  return { sent: await send(reference, reminder, message) };
});
