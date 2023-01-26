import Resizer from "react-image-file-resizer";

const resizeImage = (file: File) =>
  new Promise<File>((resolve) => {
    Resizer.imageFileResizer(
      file,
      768,
      768,
      "JPEG",
      100,
      0,
      (uri) => resolve(uri as File),
      "file"
    );
  });

export default resizeImage;
