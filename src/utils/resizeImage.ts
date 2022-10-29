import Resizer from "react-image-file-resizer";

const resizeImage = (file: File) =>
  new Promise<Blob>((resolve) => {
    Resizer.imageFileResizer(file, 768, 768, "JPEG", 100, 0, (uri) => {
      resolve(fetch(uri as string).then((res) => res.blob()));
    });
  });

export default resizeImage;
