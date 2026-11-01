import { useMemo } from "react";

import useData from "resources/useData";
import { normalizeItem } from "utils/wardrobe";
import { Item } from "utils/types";

// The whole wardrobe, every item read as a category, whatever shape it was
// stored in. Screens filter by type after this: a query by type can't match
// pieces still stored under their old type.
const useWardrobe = (): [Item[] | undefined, boolean] => {
  const [items, isLoading] = useData<Item>("wardrobe-items");
  const normalized = useMemo(() => items?.map(normalizeItem), [items]);
  return [normalized, isLoading];
};

export default useWardrobe;
