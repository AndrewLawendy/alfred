const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

const { isDue, describe, localParts } = require("./reminder");

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

// A device that's gone (app uninstalled, notifications revoked)
const isGone = (error) =>
  [
    "messaging/registration-token-not-registered",
    "messaging/invalid-registration-token",
    "messaging/invalid-argument",
  ].includes(error?.code);

const remind = async (reference, reminder, now) => {
  const uid = reference.id;
  const [outfitsSnapshot, itemsSnapshot] = await Promise.all([
    db.collection("outfits").where("user", "==", uid).get(),
    db.collection("wardrobe-items").where("user", "==", uid).get(),
  ]);
  const outfits = outfitsSnapshot.docs
    .map((doc) => doc.data())
    .sort((a, b) => a.order - b.order);
  if (outfits.length === 0) return;

  const index = Math.max(
    0,
    outfits.findIndex(({ active }) => active)
  );
  const jackets = itemsSnapshot.docs
    .map((doc) => doc.data())
    .filter(({ type }) => type === "jacket");
  const weather = await getWeather(reminder.coords || CAIRO).catch((error) => {
    logger.warn("No weather for the reminder", { uid, error: error.message });
    return undefined;
  });

  const { title, body } = describe({
    number: index + 1,
    weather,
    jackets,
    chosen: outfits[index].jacket,
  });
  const { responses } = await getMessaging().sendEachForMulticast({
    tokens: reminder.tokens,
    data: { title, body, url: "/" },
    webpush: { headers: { Urgency: "high", TTL: String(3 * 60 * 60) } },
  });

  const gone = reminder.tokens.filter((_, i) => isGone(responses[i].error));
  await reference.update({
    lastSentOn: localParts(now, reminder.timeZone || "UTC").date,
    ...(gone.length && { tokens: FieldValue.arrayRemove(...gone) }),
  });
  logger.info("Sent the morning reminder", {
    uid,
    sent: responses.filter(({ success }) => success).length,
    removed: gone.length,
  });
};

// Every 15 minutes, send the reminders that are due in their own timezones.
// ponytail: reads every reminder each run; fine for a few people, query by
// time slot if Alfred ever has many users.
exports.morningReminder = onSchedule("every 15 minutes", async () => {
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
