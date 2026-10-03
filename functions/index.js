const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

const {
  isDue,
  describe,
  sentKey,
  localParts,
  upNext,
  cleanCount,
  isInHamper,
} = require("./reminder");

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
const compose = async (uid, reminder, now) => {
  const [outfitsSnapshot, itemsSnapshot, settingsSnapshot] = await Promise.all([
    db.collection("outfits").where("user", "==", uid).get(),
    db.collection("wardrobe-items").where("user", "==", uid).get(),
    db.collection("settings").doc(uid).get(),
  ]);
  const outfits = outfitsSnapshot.docs
    .map((doc) => doc.data())
    .sort((a, b) => a.order - b.order);
  if (outfits.length === 0) return null;

  const limits = { shirt: 1, pants: 3, ...settingsSnapshot.data()?.limits };
  const items = Object.fromEntries(
    itemsSnapshot.docs.map((doc) => [doc.id, doc.data()])
  );
  const current =
    outfits[
      Math.max(
        0,
        outfits.findIndex(({ active }) => active)
      )
    ];
  const today = localParts(now, reminder.timeZone || "UTC").date;
  // Nudge towards picking today's, unless it's picked or there's only one
  const isNudge = outfits.length > 1 && current.pickedOn !== today;
  const outfit = isNudge ? upNext(outfits, items, limits) : current;
  const pieces = ["shirt", "belt", "pants", "shoes"]
    .map((slot) => items[outfit[slot]?.id]?.title)
    .filter(Boolean);
  const jackets = itemsSnapshot.docs
    .map((doc) => ({ ...doc.data(), id: doc.id }))
    .filter(({ type }) => type === "jacket");
  // The outfit keeps a copy of its jacket: use the jacket as it is now, and
  // treat a deleted one as not decided yet
  const chosen = outfit.jacket
    ? (jackets.find(({ id }) => id === outfit.jacket.id) ?? null)
    : outfit.jacket;
  const weather = await getWeather(reminder.coords || CAIRO).catch((error) => {
    logger.warn("No weather for the reminder", { uid, error: error.message });
    return undefined;
  });

  return {
    ...describe({
      isNudge,
      pieces,
      weather,
      jackets,
      chosen,
      clean: cleanCount(outfits, items, limits),
      hasHamper: Object.values(items).some((item) => isInHamper(item, limits)),
    }),
    // "Pick today's" counts the outfit on screen and moves on, like the shortcut
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
  const message = await compose(reference.id, reminder, now);
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
      // A reminder with unreadable settings (a bad time zone or time) is
      // skipped and logged, never allowed to stop everyone else's
      .filter((doc) => {
        try {
          return isDue(doc.data(), now);
        } catch (error) {
          logger.error("Unreadable reminder", {
            uid: doc.id,
            error: error.message,
          });
          return false;
        }
      })
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
  const message = (await compose(uid, reminder, new Date())) || {
    title: "Alfred",
    body: "Your reminders work. Add an outfit to see it here each morning.",
  };
  return { sent: await send(reference, reminder, message) };
});
