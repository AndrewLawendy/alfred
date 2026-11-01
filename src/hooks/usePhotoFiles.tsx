import { useRef } from "react";

// Hidden file inputs for a photo: one opens the camera, one the library.
// Render `inputs` once; `take` and `choose` open them.
const usePhotoFiles = (onPick: (file: File) => void) => {
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // The same photo can be picked again after a removal
    event.target.value = "";
    if (file) onPick(file);
  };
  const input = (ref: React.RefObject<HTMLInputElement>, camera: boolean) => (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      {...(camera && { capture: "environment" })}
      onChange={onChange}
      hidden
    />
  );
  return {
    take: () => cameraRef.current?.click(),
    choose: () => libraryRef.current?.click(),
    inputs: (
      <>
        {input(cameraRef, true)}
        {input(libraryRef, false)}
      </>
    ),
  };
};

export default usePhotoFiles;
