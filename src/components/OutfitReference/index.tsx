import { ReactNode } from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import OutfitItem from "components/OutfitItem";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { DocumentReference, DocumentData } from "firebase/firestore";
import { MdAdd } from "react-icons/md";

import { categoryIcons } from "utils/categoryIcons";
import { CATEGORIES } from "utils/wardrobe";
import { Category, Item } from "utils/types";

type OutfitReferenceProps = {
  reference: DocumentReference<DocumentData>;
  // For a deleted piece's gap; unknown once the item is gone
  category?: Category;
  aspectRatio?: number;
  radius?: string;
  isLabelled?: boolean;
  // Where a missing piece leads, to pick another (the outfit)
  onMissing?: () => void;
  badge?: ReactNode;
};

// What a gap asks for: its category when known, else any piece
const pickLabel = (category?: Category) =>
  category
    ? `Pick ${category === "shoes" ? "" : category === "accessory" ? "an " : "a "}${
        CATEGORIES.find(({ key }) => key === category)?.label.toLowerCase() ??
        "piece"
      }`
    : "Pick a piece";

// A piece whose item was deleted: a gap that says what to pick. Once deleted,
// its category is gone, unless the outfit's other pieces tell it.
export const MissingPiece = ({
  category,
  aspectRatio,
  radius,
  isLabelled,
  onMissing,
}: Omit<OutfitReferenceProps, "reference">) => (
  <Flex
    {...(onMissing && {
      as: "button",
      onClick: onMissing,
      "aria-label": pickLabel(category),
    })}
    sx={{
      w: "100%",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      borderRadius: radius,
      border: "1.5px dashed",
      borderColor: "line",
      color: "muted",
      ...(aspectRatio
        ? { aspectRatio: `${aspectRatio}` }
        : { height: "var(--outfit-photo-height, 162px)" }),
    }}
  >
    <Icon
      as={category ? categoryIcons[category] : MdAdd}
      sx={{ w: isLabelled ? 8 : 5, h: isLabelled ? 8 : 5 }}
    />
    {isLabelled && <Text sx={{ fontSize: "sm" }}>{pickLabel(category)}</Text>}
  </Flex>
);

const OutfitReference = ({
  reference,
  category,
  aspectRatio,
  radius = "card",
  isLabelled,
  onMissing,
  badge,
}: OutfitReferenceProps) => {
  const [item, isItemLoading] = useDocumentData(reference);
  if (!isItemLoading && !item) {
    return (
      <MissingPiece
        category={category}
        aspectRatio={aspectRatio}
        radius={radius}
        isLabelled={isLabelled}
        onMissing={onMissing}
      />
    );
  }

  const { imageUrl = "", type, title } = (item as Item) || {};
  return (
    <OutfitItem
      id={reference.id}
      type={type}
      imageUrl={imageUrl}
      title={title}
      isLabelled={isLabelled}
      isLoaded={!isItemLoading}
      aspectRatio={aspectRatio}
      radius={radius}
      badge={badge}
    />
  );
};

export default OutfitReference;
