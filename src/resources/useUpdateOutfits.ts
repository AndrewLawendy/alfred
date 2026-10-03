import { doc, serverTimestamp, writeBatch } from "firebase/firestore";

import { useState } from "react";

import { db } from "utils/firebase";
import settle from "resources/settle";

import type { ItemUpdate } from "utils/laundry";
import { Outfit } from "utils/types";

export type OutfitUpdate = {
  id: string;
  changes: Partial<
    Pick<Outfit, "order" | "active" | "jacket" | "pickedOn" | "heldTurn">
  >;
};

// Changes to several outfits and wardrobe items (and a delete) as one write,
// so they land together or not at all: never two outfits marked "today", never
// a wear counted without the rotation moving
const useUpdateOutfits = (): [
  (
    updates: OutfitUpdate[],
    deletedId?: string,
    items?: ItemUpdate[]
  ) => Promise<void>,
  boolean,
] => {
  const [isLoading, setLoading] = useState(false);

  const updateOutfits = (
    updates: OutfitUpdate[],
    deletedId?: string,
    items: ItemUpdate[] = []
  ) => {
    if (!updates.length && !deletedId && !items.length)
      return Promise.resolve();
    setLoading(navigator.onLine);
    const batch = writeBatch(db);
    updates.forEach(({ id, changes }) =>
      batch.update(doc(db, "outfits", id), {
        ...changes,
        updatedAt: serverTimestamp(),
      })
    );
    items.forEach(({ id, changes }) =>
      batch.update(doc(db, "wardrobe-items", id), {
        ...changes,
        updatedAt: serverTimestamp(),
      })
    );
    if (deletedId) batch.delete(doc(db, "outfits", deletedId));

    return settle(batch.commit(), undefined).finally(() => setLoading(false));
  };
  return [updateOutfits, isLoading];
};

export default useUpdateOutfits;
