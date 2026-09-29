import { Flex, Icon, Text } from "@chakra-ui/react";
import { GiBelt, GiRunningShoe, GiShirt, GiTrousers } from "react-icons/gi";
import OutfitItem from "components/OutfitItem";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { DocumentReference, DocumentData } from "firebase/firestore";

import { Item } from "utils/types";

type Slot = "shirt" | "belt" | "pants" | "shoes";

const slotIcons = {
  shirt: GiShirt,
  belt: GiBelt,
  pants: GiTrousers,
  shoes: GiRunningShoe,
};

type OutfitReferenceProps = {
  reference: DocumentReference<DocumentData>;
  slot: Slot;
  aspectRatio?: number;
  radius?: string;
  isLabelled?: boolean;
  // Where a missing piece leads, to pick another (the outfit)
  onMissing?: () => void;
};

// A piece whose item was deleted: a gap that says what to pick
const MissingPiece = ({
  slot,
  aspectRatio,
  radius,
  isLabelled,
  onMissing,
}: Omit<OutfitReferenceProps, "reference">) => (
  <Flex
    {...(onMissing && { as: "button", onClick: onMissing })}
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
      as={slotIcons[slot]}
      sx={{ w: isLabelled ? 8 : 5, h: isLabelled ? 8 : 5 }}
    />
    {isLabelled && (
      <Text sx={{ fontSize: "sm" }}>
        {slot === "pants" || slot === "shoes"
          ? `Pick ${slot}`
          : `Pick a ${slot}`}
      </Text>
    )}
  </Flex>
);

const OutfitReference = ({
  reference,
  slot,
  aspectRatio,
  radius = "card",
  isLabelled,
  onMissing,
}: OutfitReferenceProps) => {
  const [item, isItemLoading] = useDocumentData(reference);
  if (!isItemLoading && !item) {
    return (
      <MissingPiece
        slot={slot}
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
    />
  );
};

export default OutfitReference;
