import { doc, deleteDoc } from "firebase/firestore";

import { useState } from "react";

import { db } from "utils/firebase";

const useDeleteDocument = (
  collectionName: string
): [(documentId: string) => Promise<void>, boolean] => {
  const [isLoading, setLoading] = useState(false);

  const deleteDocument = (documentId: string) => {
    setLoading(true);
    const documentRef = doc(db, collectionName, documentId);

    return deleteDoc(documentRef).finally(() => setLoading(false));
  };
  return [deleteDocument, isLoading];
};

export default useDeleteDocument;
