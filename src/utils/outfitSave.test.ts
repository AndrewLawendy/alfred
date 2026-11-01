import { deleteOutfit, saveOutfit, watchPhoto } from "utils/outfitSave";

const file = new File(["x"], "look.jpg");
const noDelete = () => Promise.resolve();

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
      deletePhoto: noDelete,
    }
  );
  expect(calls).toEqual(["upload", "write https://new"]);
});

test("a failed upload writes nothing", async () => {
  const write = vi.fn();
  await expect(
    saveOutfit(
      { picks: [], name: "", photo: Promise.resolve(file) },
      {
        upload: () => Promise.reject(new Error("offline")),
        write,
        deletePhoto: noDelete,
      }
    )
  ).rejects.toThrow("offline");
  expect(write).not.toHaveBeenCalled();
});

test("a replaced photo gets its own file; the old one goes after the write", async () => {
  const calls: string[] = [];
  await saveOutfit(
    {
      picks: ["a", "b"],
      name: "",
      photo: Promise.resolve(file),
      photoUrl: "https://old",
    },
    {
      upload: (picked) => {
        calls.push(`upload ${picked.name}`);
        return Promise.resolve("https://new");
      },
      write: (fields) => {
        calls.push(`write ${fields.photoUrl}`);
        return Promise.resolve();
      },
      deletePhoto: (url) => {
        calls.push(`delete ${url}`);
        return Promise.resolve();
      },
    }
  );
  expect(calls).toEqual([
    "upload look.jpg",
    "write https://new",
    "delete https://old",
  ]);
});

test("a failed write keeps the saved photo", async () => {
  const deletePhoto = vi.fn(noDelete);
  await expect(
    saveOutfit(
      {
        picks: ["a", "b"],
        name: "",
        photo: Promise.resolve(file),
        photoUrl: "https://old",
      },
      {
        upload: () => Promise.resolve("https://new"),
        write: () => Promise.reject(new Error("denied")),
        deletePhoto,
      }
    )
  ).rejects.toThrow("denied");
  expect(deletePhoto).not.toHaveBeenCalled();
});

test("a kept photo isn't uploaded or deleted", async () => {
  const upload = vi.fn(() => Promise.resolve("https://new"));
  const deletePhoto = vi.fn(noDelete);
  await saveOutfit(
    { picks: ["a", "b"], name: "", photoUrl: "https://old" },
    { upload, write: () => Promise.resolve(), deletePhoto }
  );
  expect(upload).not.toHaveBeenCalled();
  expect(deletePhoto).not.toHaveBeenCalled();
});

test("a removed photo is written as removed, then its file goes", async () => {
  const write = vi.fn(() => Promise.resolve());
  const deletePhoto = vi.fn(noDelete);
  await saveOutfit(
    {
      picks: ["a", "b"],
      name: "",
      photoUrl: "https://old",
      isPhotoRemoved: true,
    },
    { upload: vi.fn(), write, deletePhoto }
  );
  expect(write).toHaveBeenCalledWith(
    expect.objectContaining({
      remove: ["photoUrl", "name", "shirt", "belt", "pants", "shoes"],
    })
  );
  expect(deletePhoto).toHaveBeenCalledWith("https://old");
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
