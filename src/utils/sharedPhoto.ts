// A photo shared into Alfred from another app (the manifest's share_target).
// The service worker stores it here, then opens /wardrobe?add=1&shared=1.
const CACHE = "shared";
const KEY = "/shared-photo";

export const readSharedPhoto = async (): Promise<File | undefined> => {
  if (!("caches" in window)) return undefined;
  const response = await (await caches.open(CACHE)).match(KEY);
  if (!response) return undefined;
  const blob = await response.blob();
  return new File([blob], "shared-photo", { type: blob.type || "image/jpeg" });
};

export const clearSharedPhoto = async () => {
  if ("caches" in window) await (await caches.open(CACHE)).delete(KEY);
};
