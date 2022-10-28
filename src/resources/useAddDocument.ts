import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  CollectionReference,
  DocumentReference,
} from "firebase/firestore";
import { db } from "utils/firebase";

import useAuth from "hooks/useAuth";

import { Common } from "utils/types";

const useAddDocument = <T>(
  collectionName: string
): [
  (
    data: Omit<T, keyof Common>
  ) => Promise<DocumentReference<Omit<T, keyof Common>>>,
  boolean
] => {
  const [user] = useAuth();
  const [isLoading, setLoading] = useState(false);

  const addDocument = (data: Omit<T, keyof Common>) => {
    setLoading(true);
    return addDoc(
      collection(db, collectionName) as CollectionReference<
        Omit<T, keyof Common>
      >,
      {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        user: user?.uid,
      }
    ).finally(() => setLoading(false));
  };

  return [addDocument, isLoading];
};

export default useAddDocument;
