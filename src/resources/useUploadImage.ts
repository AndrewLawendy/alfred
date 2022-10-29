import {
  ref,
  UploadResult,
  UploadTaskSnapshot,
  StorageError,
} from "firebase/storage";

import { useUploadFile } from "react-firebase-hooks/storage";

import { storage } from "utils/firebase";

const useUploadImage = (): [
  (file: File, imageUrl?: string) => Promise<UploadResult | undefined>,
  boolean,
  UploadTaskSnapshot | undefined,
  StorageError | undefined
] => {
  const [uploadFile, ...rest] = useUploadFile();
  const uploadImage = (file: File, imageUrl?: string) => {
    const path = imageUrl ?? `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    return uploadFile(storageRef, file, {
      contentType: "image/jpeg",
    });
  };

  return [uploadImage, ...rest];
};

export default useUploadImage;
