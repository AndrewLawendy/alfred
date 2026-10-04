import { ReactNode } from "react";
import { Flex, Icon, Text } from "@chakra-ui/react";
import OutfitItem from "components/OutfitItem";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { DocumentReference, DocumentData } from "firebase/firestore";

import { categoryIcons } from "utils/categoryIcons";
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

// A piece whose item was deleted: a gap that says what to pick
export const MissingPiece = ({
  category = "top",
  aspectRatio,
  radius,
  isLabelled,
  onMissing,
}: Omit<OutfitReferenceProps, "reference">) => (
  <Flex
    {...(onMissing && {
      as: "button",
      onClick: onMissing,
      "aria-label": "Pick a piece",
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
      as={categoryIcons[category]}
      sx={{ w: isLabelled ? 8 : 5, h: isLabelled ? 8 : 5 }}
    />
    {isLabelled && <Text sx={{ fontSize: "sm" }}>Pick a piece</Text>}
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
