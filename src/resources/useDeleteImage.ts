import { useState } from "react";
import { ref, deleteObject } from "firebase/storage";

import { storage } from "utils/firebase";

const useDeleteImage = (): [(imageUrl: string) => Promise<void>, boolean] => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteImage = (imageUrl: string) => {
    setIsLoading(true);
    return deleteObject(ref(storage, imageUrl)).finally(() =>
      setIsLoading(false)
    );
  };

  return [deleteImage, isLoading];
};

export default useDeleteImage;
