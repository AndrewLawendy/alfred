import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

import { useState } from "react";

import { db } from "utils/firebase";

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
    setLoading(true);
    const documentRef = doc(db, collectionName, documentId);

    return updateDoc(documentRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }).finally(() => setLoading(false));
  };
  return [updateDocument, isLoading];
};

export default useUpdateDocument;
