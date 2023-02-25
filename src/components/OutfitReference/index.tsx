import OutfitItem from "components/OutfitItem";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { DocumentReference, DocumentData } from "firebase/firestore";

import { Item } from "utils/types";

type OutfitReferenceProps = {
  reference: DocumentReference<DocumentData>;
};

const OutfitReference = ({ reference }: OutfitReferenceProps) => {
  const [item, isItemLoading] = useDocumentData(reference);
  const { imageUrl = "", type } = (item as Item) || {};
  return (
    <OutfitItem
      id={reference.id}
      type={type}
      imageUrl={imageUrl}
      isLoaded={!isItemLoading}
    />
  );
};

export default OutfitReference;
