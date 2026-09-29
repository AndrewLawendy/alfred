import {
  ref,
  UploadResult,
  UploadTaskSnapshot,
  StorageError,
} from "firebase/storage";

import { useUploadFile } from "react-firebase-hooks/storage";

import { auth, storage } from "utils/firebase";

const useUploadImage = (): [
  (file: File, imageUrl?: string) => Promise<UploadResult | undefined>,
  boolean,
  UploadTaskSnapshot | undefined,
  StorageError | undefined,
] => {
  const [uploadFile, ...rest] = useUploadFile();
  const uploadImage = (file: File, imageUrl?: string) => {
    const path = imageUrl ?? `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    return uploadFile(storageRef, file, {
      contentType: "image/jpeg",
      // Storage rules let only the owner replace or delete it
      customMetadata: { owner: auth.currentUser?.uid ?? "" },
    });
  };

  return [uploadImage, ...rest];
};

export default useUploadImage;
