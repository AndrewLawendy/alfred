import { useMemo } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";

import useAuth from "hooks/useAuth";
import { auth, db } from "utils/firebase";
import { DEFAULT_LIMITS, Limits } from "utils/laundry";
import settle from "resources/settle";

// Wears before washing, per type; the defaults until the person changes one.
// isLoading until their settings arrive, so nothing counts with the defaults
export const useLimitsState = (): { limits: Limits; isLoading: boolean } => {
  const [user] = useAuth();
  const ref = useMemo(
    () => (user ? doc(db, "settings", user.uid) : undefined),
    [user?.uid]
  );
  const [data, isLoading] = useDocumentData(ref);
  const saved =
    (data as { limits?: Record<string, number> } | undefined)?.limits ?? {};
  // Before categories, limits were saved as shirt and pants
  const { shirt, pants, ...rest } = saved;
  const limits: Limits = {
    ...DEFAULT_LIMITS,
    ...(shirt !== undefined && { top: shirt }),
    ...(pants !== undefined && { bottom: pants }),
    ...rest,
  };
  return { limits, isLoading };
};

const useLimits = () => useLimitsState().limits;

// Writes only the types given: the merge keeps the others as saved, even if
// the screen still shows the defaults
export const saveLimits = (limits: Partial<Limits>) => {
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
