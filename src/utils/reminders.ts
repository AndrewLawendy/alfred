import { getFunctions, httpsCallable } from "firebase/functions";
import {
  arrayRemove,
  arrayUnion,
  doc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
} from "firebase/messaging";

import { auth, db } from "utils/firebase";
import settle from "resources/settle";

// Each person's morning reminder: when (their time, their days, in their
// timezone) and which devices get it. The scheduled function reads these.
export type Reminder = {
  time: string; // "07:30"
  days: number[]; // 0 = Sunday … 6 = Saturday
  timeZone: string;
  tokens?: string[];
  lastSentAt?: Timestamp;
};

// The Egyptian work week
export const defaultReminder = { time: "07:30", days: [0, 1, 2, 3, 4] };

const TOKEN_KEY = "alfred-reminder-token";

export const reminderRef = (uid: string) => doc(db, "reminders", uid);

const save = (changes: Partial<Record<keyof Reminder, unknown>>) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return Promise.resolve();
  const write = setDoc(
    reminderRef(uid),
    {
      user: uid,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      updatedAt: serverTimestamp(),
      ...changes,
    },
    { merge: true }
  );
  return settle(write, undefined);
};

export const saveSchedule = (schedule: Pick<Reminder, "time" | "days">) =>
  save(schedule);

// This device's notification address, if it's switched on here
export const deviceToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

// "unsupported": no web push here (an iPhone browser tab, older browsers)
export const pushSupport = async () =>
  (await isSupported()) ? Notification.permission : "unsupported";

export const turnOn = async (schedule: Pick<Reminder, "time" | "days">) => {
  if ((await Notification.requestPermission()) !== "granted") return false;
  const token = await getToken(getMessaging(), {
    serviceWorkerRegistration: await navigator.serviceWorker.ready,
  });
  await save({ ...schedule, tokens: arrayUnion(token) });
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // The switch will look off after a reload, but reminders still arrive
  }
  return true;
};

// Checked on every app open: Firebase can hand this phone a new notification
// address, and the server drops ones that stop working. Re-adding it keeps the
// reminder arriving while the switch says it's on.
export const refreshDevice = async () => {
  const stored = deviceToken();
  if (!stored || !(await isSupported())) return;
  if (Notification.permission !== "granted") return turnOff();
  const token = await getToken(getMessaging(), {
    serviceWorkerRegistration: await navigator.serviceWorker.ready,
  });
  await save({ tokens: arrayUnion(token) });
  if (token === stored) return;
  await save({ tokens: arrayRemove(stored) });
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // The next open will try again
  }
};

export const turnOff = async () => {
  const token = deviceToken();
  if (token) await save({ tokens: arrayRemove(token) });
  await deleteToken(getMessaging()).catch(() => undefined);
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing stored to clear
  }
};

// Today's reminder, sent now to this person's devices (the scheduled function
// shares the same message)
export const sendTest = () =>
  httpsCallable<void, { sent: number }>(
    getFunctions(auth.app),
    "sendTestReminder"
  )();
