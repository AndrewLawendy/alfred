import { useState } from "react";
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  CollectionReference,
  DocumentReference,
} from "firebase/firestore";
import { db } from "utils/firebase";
import settle from "resources/settle";

import useAuth from "hooks/useAuth";

import { Common } from "utils/types";

const useAddDocument = <T>(
  collectionName: string
): [
  (
    data: Omit<T, keyof Common>
  ) => Promise<DocumentReference<Omit<T, keyof Common>>>,
  boolean,
] => {
  const [user] = useAuth();
  const [isLoading, setLoading] = useState(false);

  const addDocument = (data: Omit<T, keyof Common>) => {
    // A reference made up front, so it's known even before the write lands
    const reference = doc(
      collection(db, collectionName) as CollectionReference<
        Omit<T, keyof Common>
      >
    );
    setLoading(navigator.onLine);
    const write = setDoc(reference, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      user: user?.uid,
    }).then(() => reference);
    return settle(write, reference).finally(() => setLoading(false));
  };

  return [addDocument, isLoading];
};

export default useAddDocument;
