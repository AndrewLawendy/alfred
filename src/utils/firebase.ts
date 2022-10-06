import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

setPersistence(auth, browserLocalPersistence);

export { auth, db };
