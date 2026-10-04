import { useMemo } from "react";
import { orderBy } from "firebase/firestore";

import useData from "resources/useData";
import { normalizeOutfit } from "utils/wardrobe";
import { Outfit } from "utils/types";

// The rotation in order, every outfit read as a list of pieces, whatever shape
// it was stored in
const useOutfits = (): [Outfit[] | undefined, boolean] => {
  const [outfits, isLoading] = useData<Outfit>("outfits", orderBy("order"));
  const normalized = useMemo(
    () => outfits?.map((outfit) => normalizeOutfit(outfit)),
    [outfits]
  );
  return [normalized, isLoading];
};

export default useOutfits;
