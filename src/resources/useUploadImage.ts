import {
  ref,
  UploadResult,
  UploadTaskSnapshot,
  StorageError,
} from "firebase/storage";

import { useUploadFile } from "react-firebase-hooks/storage";

import { storage } from "utils/firebase";

const useUploadImage = (): [
  (file: File) => Promise<UploadResult | undefined>,
  boolean,
  UploadTaskSnapshot | undefined,
  StorageError | undefined
] => {
  const [uploadFile, ...rest] = useUploadFile();
  const uploadImage = (file: File) => {
    const storageRef = ref(storage, `${Date.now()}-${file.name}`);
    return uploadFile(storageRef, file, {
      contentType: "image/jpeg",
    });
  };

  return [uploadImage, ...rest];
};

export default useUploadImage;
