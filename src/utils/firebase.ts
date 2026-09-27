import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  getFirestore,
  enableMultiTabIndexedDbPersistence,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const app = initializeApp({
  apiKey: "AIzaSyAFoM2G10dDnHLicuJZX_gGtSLrlMVztVk",
  authDomain: "alfred-wardrobe-stylist.firebaseapp.com",
  projectId: "alfred-wardrobe-stylist",
  storageBucket: "alfred-wardrobe-stylist.appspot.com",
  messagingSenderId: "632962587616",
  appId: "1:632962587616:web:d42c253b2da7231118e985",
  measurementId: "G-7LLKR3THE4",
});

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence);
// Serve Firestore data from IndexedDB first so screens open instantly.
// Rejects on browsers without IndexedDB; the app then stays online-only.
enableMultiTabIndexedDbPersistence(db).catch(() => undefined);

export { auth, db, storage };
