import { putPageUnderLink } from "utils/history";

const openFromOutside = (url: string) =>
  window.history.replaceState(null, "", url);

test("a screen opened from outside gets its page underneath", () => {
  openFromOutside("/outfits?outfit=new");
  const before = window.history.length;
  putPageUnderLink();
  expect(window.history.length).toBe(before + 1);
  expect(window.location.search).toBe("?outfit=new");
  expect(window.history.state).toEqual({
    depth: 1,
    stack: [{ kind: "outfit", id: "new", depth: 1 }],
  });
});

test("the Add chooser opened from outside gets its own entry", () => {
  openFromOutside("/wardrobe?add=1&shared=1");
  putPageUnderLink();
  expect(window.location.search).toBe("?add=1&shared=1");
  expect(window.history.state).toEqual({ depth: 1, stack: [] });
});

test("pages, and anything opened inside the app, are left alone", () => {
  openFromOutside("/wardrobe");
  const before = window.history.length;
  putPageUnderLink();
  window.history.replaceState({ depth: 2, stack: [] }, "", "/?item=a");
  putPageUnderLink();
  expect(window.history.length).toBe(before);
});
