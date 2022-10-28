import { useMemo } from "react";
import {
  collection,
  query,
  where,
  QueryConstraint,
  PartialWithFieldValue,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";

import useAuth from "hooks/useAuth";
import { db } from "utils/firebase";

const useData = <T extends DocumentData>(
  collectionName: string,
  ...queryConstraints: QueryConstraint[]
) => {
  const [user] = useAuth();
  const q = useMemo(
    () =>
      query(
        collection(db, collectionName).withConverter({
          toFirestore({ id, ...data }: PartialWithFieldValue<T>): DocumentData {
            return data;
          },
          fromFirestore(
            snapshot: QueryDocumentSnapshot<T>,
            options: SnapshotOptions
          ): T {
            const data = snapshot.data(options);
            return {
              id: snapshot.id,
              ...data,
            };
          },
        }),
        where("user", "==", user?.uid),
        ...queryConstraints
      ),
    []
  );
  return useCollectionData(q, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
};

export default useData;
