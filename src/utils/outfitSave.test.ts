import { deleteOutfit, saveOutfit, watchPhoto } from "utils/outfitSave";

const file = new File(["x"], "look.jpg");

test("a new photo is uploaded before the outfit is written", async () => {
  const calls: string[] = [];
  await saveOutfit(
    { picks: [], name: "Gym", photo: Promise.resolve(file) },
    {
      upload: () => {
        calls.push("upload");
        return Promise.resolve("https://new");
      },
      write: (fields) => {
        calls.push(`write ${fields.photoUrl}`);
        return Promise.resolve();
      },
    }
  );
  expect(calls).toEqual(["upload", "write https://new"]);
});

test("a failed upload writes nothing", async () => {
  const write = vi.fn();
  await expect(
    saveOutfit(
      { picks: [], name: "", photo: Promise.resolve(file) },
      { upload: () => Promise.reject(new Error("offline")), write }
    )
  ).rejects.toThrow("offline");
  expect(write).not.toHaveBeenCalled();
});

test("a replaced photo goes to the same path; a kept one isn't uploaded", async () => {
  const upload = vi.fn(() => Promise.resolve("https://same"));
  await saveOutfit(
    {
      picks: ["a", "b"],
      name: "",
      photo: Promise.resolve(file),
      photoUrl: "https://old",
    },
    { upload, write: () => Promise.resolve() }
  );
  expect(upload).toHaveBeenCalledWith(file, "https://old");
  upload.mockClear();
  await saveOutfit(
    { picks: ["a", "b"], name: "", photoUrl: "https://old" },
    { upload, write: () => Promise.resolve() }
  );
  expect(upload).not.toHaveBeenCalled();
});

test("a removed photo is written as removed", async () => {
  const write = vi.fn(() => Promise.resolve());
  await saveOutfit(
    {
      picks: ["a", "b"],
      name: "",
      photoUrl: "https://old",
      isPhotoRemoved: true,
    },
    { upload: vi.fn(), write }
  );
  expect(write).toHaveBeenCalledWith(
    expect.objectContaining({ remove: ["photoUrl", "name"] })
  );
});

test("deleting removes the outfit first; a stuck photo doesn't block it", async () => {
  const calls: string[] = [];
  await deleteOutfit(
    { photoUrl: "https://p" },
    {
      remove: () => {
        calls.push("outfit");
        return Promise.resolve();
      },
      deletePhoto: () => {
        calls.push("photo");
        return Promise.reject(new Error("gone"));
      },
    }
  );
  expect(calls).toEqual(["outfit", "photo"]);
});

test("a photo that can't be read is dropped at once, with word why", async () => {
  const onUnreadable = vi.fn();
  const photo = watchPhoto(Promise.reject(new Error("HEIC")), onUnreadable);
  await expect(photo).rejects.toThrow("HEIC");
  expect(onUnreadable).toHaveBeenCalled();
});
