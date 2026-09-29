import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

import { useState } from "react";

import { db } from "utils/firebase";
import settle from "resources/settle";

import { Common } from "utils/types";

const useUpdateDocument = <T>(
  collectionName: string
): [
  (documentId: string, data: Partial<Omit<T, keyof Common>>) => Promise<void>,
  boolean
] => {
  const [isLoading, setLoading] = useState(false);
  const updateDocument = (
    documentId: string,
    data: Partial<Omit<T, keyof Common>>
  ) => {
    setLoading(navigator.onLine);
    const documentRef = doc(db, collectionName, documentId);
    const write = updateDoc(documentRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    return settle(write, undefined).finally(() => setLoading(false));
  };
  return [updateDocument, isLoading];
};

export default useUpdateDocument;
