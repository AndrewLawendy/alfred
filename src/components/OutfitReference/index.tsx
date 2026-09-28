import OutfitItem from "components/OutfitItem";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { DocumentReference, DocumentData } from "firebase/firestore";

import { Item } from "utils/types";

type OutfitReferenceProps = {
  reference: DocumentReference<DocumentData>;
  aspectRatio?: number;
  radius?: string;
  isLabelled?: boolean;
};

const OutfitReference = ({
  reference,
  aspectRatio,
  radius,
  isLabelled,
}: OutfitReferenceProps) => {
  const [item, isItemLoading] = useDocumentData(reference);
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
