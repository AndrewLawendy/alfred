import { outfitFields } from "utils/wardrobe";

type Draft = {
  picks: string[];
  name: string;
  // The saved photo, kept unless a new one or a removal replaces it
  photoUrl?: string;
  // A newly picked photo, still resizing
  photo?: Promise<File>;
  isPhotoRemoved?: boolean;
};

// Upload first, then write: a failed upload leaves the outfit as it was.
// A replacement goes to the saved photo's path, so no file is left behind.
export const saveOutfit = async (
  draft: Draft,
  io: {
    upload: (file: File, path?: string) => Promise<string>;
    write: (fields: ReturnType<typeof outfitFields>) => Promise<void>;
  }
) => {
  const photoUrl = draft.photo
    ? await io.upload(await draft.photo, draft.photoUrl)
    : draft.isPhotoRemoved
      ? undefined
      : draft.photoUrl;
  await io.write(
    outfitFields({ picks: draft.picks, photoUrl, name: draft.name })
  );
  return photoUrl;
};

// The outfit goes first; its photo after, and a failed photo delete only
// leaves an unused file
export const deleteOutfit = async (
  outfit: { photoUrl?: string },
  io: {
    remove: () => Promise<void>;
    deletePhoto: (url: string) => Promise<void>;
  }
) => {
  await io.remove();
  if (outfit.photoUrl) {
    await io.deletePhoto(outfit.photoUrl).catch(() => undefined);
  }
};

// A picked photo, still resizing: if the browser can't read it (HEIC
// outside Safari), say so at once instead of failing every Save later
export const watchPhoto = (
  resized: Promise<File>,
  onUnreadable: () => void
) => {
  resized.catch(onUnreadable);
  return resized;
};
