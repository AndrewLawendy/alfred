import { where } from "firebase/firestore";
import { Grid } from "@chakra-ui/react";

import Loading from "components/Loading";
import EmptyState from "components/EmptyState";

import useData from "resources/useData";
import { openItem, openNewItem } from "utils/history";
import { Item } from "utils/types";

import ItemTile from "./ItemTile";

// Pants and shoes are already plural ("No pants yet", not "No pantss yet")
const plurals: Record<Item["type"], string> = {
  shirt: "shirts",
  jacket: "jackets",
  belt: "belts",
  pants: "pants",
  shoes: "shoes",
};

// The grid for one wardrobe tab; items open in the app-wide ItemScreen
const WardrobeItem = ({ type }: Pick<Item, "type">) => {
  const [items, isItemsLoading] = useData<Item>(
    "wardrobe-items",
    where("type", "==", type)
  );

  if (isItemsLoading || !items) {
    return <Loading message={`Loading your ${plurals[type]}`} />;
  }

  return items.length > 0 ? (
    <Grid templateColumns="repeat(2, 1fr)" columnGap={3} rowGap={5}>
      {items.map((item) => (
        <ItemTile key={item.id} item={item} onClick={() => openItem(item.id)} />
      ))}
    </Grid>
  ) : (
    <EmptyState
      title={`No ${plurals[type]} yet`}
      description={
        type === "jacket"
          ? "Add a jacket and Alfred will suggest it when the temperature drops."
          : `Add your first ${type} with a photo and a title.`
      }
      actionLabel={`Add ${type}`}
      onAction={() => openNewItem(type)}
    />
  );
};

export default WardrobeItem;
