import { where } from "firebase/firestore";
import { Grid } from "@chakra-ui/react";
import { MdCheckroom } from "react-icons/md";

import Loading from "components/Loading";
import EmptyState from "components/EmptyState";

import useData from "resources/useData";
import { openItem, openNewItem } from "utils/history";
import { Item } from "utils/types";

import ItemTile from "./ItemTile";

// The grid for one wardrobe tab; items open in the app-wide ItemScreen
const WardrobeItem = ({ type }: Pick<Item, "type">) => {
  const [items, isItemsLoading] = useData<Item>(
    "wardrobe-items",
    where("type", "==", type)
  );

  if (isItemsLoading || !items) {
    return <Loading message={`Loading your ${type}s`} />;
  }

  return items.length > 0 ? (
    <Grid templateColumns="repeat(2, 1fr)" columnGap={3} rowGap={4}>
      {items.map((item) => (
        <ItemTile key={item.id} item={item} onClick={() => openItem(item.id)} />
      ))}
    </Grid>
  ) : (
    <EmptyState
      icon={MdCheckroom}
      title={`No ${type}s yet`}
      description={`Add your first ${type} with a photo and a title.`}
      actionLabel={`Add ${type}`}
      onAction={() => openNewItem(type)}
    />
  );
};

export default WardrobeItem;
