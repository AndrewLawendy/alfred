import { useMemo } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";

import useAuth from "hooks/useAuth";
import { auth, db } from "utils/firebase";
import { DEFAULT_LIMITS, Limits } from "utils/laundry";
import settle from "resources/settle";

// Wears before washing, per type; the defaults until the person changes one
const useLimits = (): Limits => {
  const [user] = useAuth();
  const ref = useMemo(
    () => (user ? doc(db, "settings", user.uid) : undefined),
    [user?.uid]
  );
  const [data] = useDocumentData(ref);
  const saved = (data as { limits?: Partial<Limits> } | undefined)?.limits;
  return { ...DEFAULT_LIMITS, ...saved };
};

export const saveLimits = (limits: Limits) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return Promise.resolve();
  const write = setDoc(
    doc(db, "settings", uid),
    { user: uid, limits, updatedAt: serverTimestamp() },
    { merge: true }
  );
  return settle(write, undefined);
};

export default useLimits;
