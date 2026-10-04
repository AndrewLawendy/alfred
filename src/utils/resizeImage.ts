import Resizer from "react-image-file-resizer";

// The library is CommonJS: the Vite dev server hands it over wrapped twice
// (default.default), the production build once; take whichever holds it
export const resizer: typeof Resizer =
  (Resizer as unknown as { default?: typeof Resizer }).default ?? Resizer;

const resizeImage = async (file: File) => {
  // The resizer never calls back on a photo this browser can't read (HEIC
  // outside Safari), which left Save waiting forever; this fails fast instead
  (await createImageBitmap(file)).close();
  return new Promise<File>((resolve) => {
    resizer.imageFileResizer(
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
};

export default resizeImage;
