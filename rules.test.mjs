// Firestore and Storage rules, checked against the emulators:
// yarn test:rules
import { readFileSync } from "node:fs";
import { after, before, beforeEach, test } from "node:test";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, getMetadata, ref, uploadBytes } from "firebase/storage";

let env;
const as = (uid) => env.authenticatedContext(uid);
const photo = new Uint8Array([0xff, 0xd8, 0xff]);
const image = (owner) => ({
  contentType: "image/jpeg",
  customMetadata: { owner },
});

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "alfred-rules-test",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
    storage: { rules: readFileSync("storage.rules", "utf8") },
  });
});
after(() => env.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await env.clearStorage();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "wardrobe-items/shirt"), { user: "alice" });
    await setDoc(doc(db, "outfits/monday"), { user: "alice", order: 0 });
    await setDoc(doc(db, "reminders/alice"), { user: "alice" });
    await setDoc(doc(db, "settings/alice"), { user: "alice" });
    await uploadBytes(
      ref(context.storage(), "shirt.jpg"),
      photo,
      image("alice")
    );
  });
});

test("people read their own things, and only theirs", async () => {
  const alice = as("alice").firestore();
  const bob = as("bob").firestore();
  await assertSucceeds(getDoc(doc(alice, "wardrobe-items/shirt")));
  await assertSucceeds(getDoc(doc(alice, "outfits/monday")));
  await assertFails(getDoc(doc(bob, "wardrobe-items/shirt")));
  await assertFails(getDoc(doc(bob, "outfits/monday")));
  await assertFails(
    getDoc(doc(env.unauthenticatedContext().firestore(), "outfits/monday"))
  );
});

test("lists must ask for the person's own things", async () => {
  const alice = as("alice").firestore();
  await assertSucceeds(
    getDocs(query(collection(alice, "outfits"), where("user", "==", "alice")))
  );
  await assertFails(getDocs(collection(alice, "outfits")));
  await assertFails(
    getDocs(query(collection(alice, "outfits"), where("user", "==", "bob")))
  );
});

test("a missing document reads as missing, not as an error", async () => {
  await assertSucceeds(
    getDoc(doc(as("bob").firestore(), "wardrobe-items/gone"))
  );
});

test("new things belong to whoever adds them", async () => {
  const alice = as("alice").firestore();
  await assertSucceeds(
    setDoc(doc(alice, "outfits/tuesday"), { user: "alice" })
  );
  await assertFails(setDoc(doc(alice, "outfits/wednesday"), { user: "bob" }));
});

test("only the owner changes or deletes, and can't give it away", async () => {
  const alice = as("alice").firestore();
  const bob = as("bob").firestore();
  await assertSucceeds(updateDoc(doc(alice, "outfits/monday"), { order: 1 }));
  await assertFails(updateDoc(doc(alice, "outfits/monday"), { user: "bob" }));
  await assertFails(updateDoc(doc(bob, "outfits/monday"), { order: 2 }));
  await assertFails(deleteDoc(doc(bob, "wardrobe-items/shirt")));
  await assertSucceeds(deleteDoc(doc(alice, "wardrobe-items/shirt")));
});

test("a reminder is its owner's alone", async () => {
  const alice = as("alice").firestore();
  const bob = as("bob").firestore();
  await assertSucceeds(getDoc(doc(alice, "reminders/alice")));
  await assertSucceeds(
    setDoc(doc(alice, "reminders/alice"), { time: "08:00" }, { merge: true })
  );
  await assertFails(getDoc(doc(bob, "reminders/alice")));
  await assertFails(
    setDoc(
      doc(bob, "reminders/alice"),
      { tokens: ["bob-phone"] },
      { merge: true }
    )
  );
});

test("laundry limits are their owner's only", async () => {
  const alice = as("alice").firestore();
  const bob = as("bob").firestore();
  await assertSucceeds(getDoc(doc(alice, "settings/alice")));
  await assertSucceeds(
    setDoc(doc(alice, "settings/alice"), { limits: { pants: 2 } }, { merge: true })
  );
  await assertFails(getDoc(doc(bob, "settings/alice")));
  await assertFails(
    setDoc(doc(bob, "settings/alice"), { limits: { pants: 9 } }, { merge: true })
  );
});

test("nothing outside the app's collections", async () => {
  await assertFails(
    setDoc(doc(as("alice").firestore(), "anything/else"), { user: "alice" })
  );
});

test("photos go in tagged with their owner, as images", async () => {
  const alice = as("alice").storage();
  await assertSucceeds(
    uploadBytes(ref(alice, "new.jpg"), photo, image("alice"))
  );
  await assertFails(uploadBytes(ref(alice, "bobs.jpg"), photo, image("bob")));
  await assertFails(
    uploadBytes(ref(alice, "untagged.jpg"), photo, {
      contentType: "image/jpeg",
    })
  );
  await assertFails(
    uploadBytes(ref(alice, "notes.txt"), photo, {
      contentType: "text/plain",
      customMetadata: { owner: "alice" },
    })
  );
});

test("only the owner replaces, reads or deletes a photo", async () => {
  const alice = as("alice").storage();
  const bob = as("bob").storage();
  await assertFails(uploadBytes(ref(bob, "shirt.jpg"), photo, image("bob")));
  await assertFails(getMetadata(ref(bob, "shirt.jpg")));
  await assertFails(deleteObject(ref(bob, "shirt.jpg")));
  await assertSucceeds(getMetadata(ref(alice, "shirt.jpg")));
  await assertSucceeds(
    uploadBytes(ref(alice, "shirt.jpg"), photo, image("alice"))
  );
  await assertSucceeds(deleteObject(ref(alice, "shirt.jpg")));
});
