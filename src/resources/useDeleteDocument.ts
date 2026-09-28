import { doc, deleteDoc } from "firebase/firestore";

import { useState } from "react";

import { db } from "utils/firebase";
import settle from "resources/settle";

const useDeleteDocument = (
  collectionName: string
): [(documentId: string) => Promise<void>, boolean] => {
  const [isLoading, setLoading] = useState(false);

  const deleteDocument = (documentId: string) => {
    setLoading(navigator.onLine);
    const documentRef = doc(db, collectionName, documentId);

    return settle(deleteDoc(documentRef), undefined).finally(() =>
      setLoading(false)
    );
  };
  return [deleteDocument, isLoading];
};

export default useDeleteDocument;
