import {
  collection,
  query,
  where,
  QueryConstraint,
  CollectionReference,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";

import useAuth from "hooks/useAuth";
import { db } from "utils/firebase";

const useData = <T extends Record<string, unknown>>(
  collectionName: string,
  ...queryConstraints: QueryConstraint[]
) => {
  const [user] = useAuth();
  const q = query(
    collection(db, collectionName) as CollectionReference<T>,
    where("user", "==", user?.uid),
    ...queryConstraints
  );
  return useCollectionData(q, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
};

export default useData;
