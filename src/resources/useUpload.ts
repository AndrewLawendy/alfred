import {
  ref,
  UploadResult,
  UploadTaskSnapshot,
  StorageError,
} from "firebase/storage";

import { useUploadFile } from "react-firebase-hooks/storage";

import { storage } from "utils/firebase";

const useUpload = (): [
  (file: File) => Promise<UploadResult | undefined>,
  boolean,
  UploadTaskSnapshot | undefined,
  StorageError | undefined
] => {
  const [uploadFile, ...rest] = useUploadFile();
  const upload = (file: File) => {
    const storageRef = ref(storage, `${file.name}-${Date.now()}`);
    return uploadFile(storageRef, file, {
      contentType: "image/jpeg",
    });
  };

  return [upload, ...rest];
};

export default useUpload;
