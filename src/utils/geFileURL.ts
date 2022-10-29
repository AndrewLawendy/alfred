import { ref, getDownloadURL } from "firebase/storage";

import { storage } from "utils/firebase";

const geFileURL = (fileName: string) => getDownloadURL(ref(storage, fileName));

export default geFileURL;
