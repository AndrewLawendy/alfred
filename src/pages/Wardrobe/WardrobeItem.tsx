import { Grid } from "@chakra-ui/react";

import Loading from "components/Loading";
import EmptyState from "components/EmptyState";

import useLimits from "resources/useLimits";
import useWardrobe from "resources/useWardrobe";
import { isInHamper, wearBadge } from "utils/laundry";
import { openNewItem } from "utils/history";
import { openItemFromPhoto } from "utils/photoTransition";
import { CATEGORIES } from "utils/wardrobe";
import { Item } from "utils/types";

import ItemTile from "./ItemTile";

// The grid for one wardrobe tab; items open in the app-wide ItemScreen
const WardrobeItem = ({ type }: Pick<Item, "type">) => {
  const [wardrobe, isItemsLoading] = useWardrobe();
  const limits = useLimits();
  const category = CATEGORIES.find(({ key }) => key === type);
  const plural = (category?.plural ?? type).toLowerCase();
  const label = (category?.label ?? type).toLowerCase();

  if (isItemsLoading || !wardrobe) {
    return <Loading message={`Loading your ${plural}`} />;
  }
  const items = wardrobe.filter((item) => item.type === type);

  return items.length > 0 ? (
    <Grid templateColumns="repeat(2, 1fr)" columnGap={3} rowGap={5}>
      {items.map((item) => (
        <ItemTile
          key={item.id}
          item={item}
          badge={wearBadge(item, limits)}
          isDimmed={isInHamper(item, limits)}
          onClick={(event) =>
            openItemFromPhoto(item.id, event.currentTarget.querySelector("img"))
          }
        />
      ))}
    </Grid>
  ) : (
    <EmptyState
      title={`No ${plural} yet`}
      description={
        type === "outerwear"
          ? "Add a coat or jacket and Alfred will suggest it when the temperature drops."
          : `Add your first ${label} with a photo and a title.`
      }
      actionLabel={`Add ${label}`}
      onAction={() => openNewItem(type)}
    />
  );
};

export default WardrobeItem;
