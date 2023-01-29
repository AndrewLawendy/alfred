import OutfitItem from "components/OutfitItem";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { DocumentReference, DocumentData } from "firebase/firestore";

import { Item } from "utils/types";

type OutfitReferenceProps = {
  reference: DocumentReference<DocumentData>;
};

const OutfitReference = ({ reference }: OutfitReferenceProps) => {
  const [item, isItemLoading] = useDocumentData(reference);
  const { imageUrl = "" } = (item as Item) || {};
  return <OutfitItem imageUrl={imageUrl} isLoaded={!isItemLoading} />;
};

export default OutfitReference;
