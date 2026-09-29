import { dropClosedLayers, putPageUnderLink } from "utils/history";

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

test("after a reload, Back isn't spent on layers that are no longer open", () => {
  const go = vi.spyOn(window.history, "go").mockImplementation(() => undefined);
  // An item screen (depth 1) in edit mode (depth 2), then a reload
  window.history.replaceState(
    { depth: 2, stack: [{ kind: "item", id: "a", depth: 1 }] },
    "",
    "/wardrobe?item=a"
  );
  dropClosedLayers();
  expect(go).toHaveBeenCalledWith(-1);

  // A sheet over a page, with no screens open
  go.mockClear();
  window.history.replaceState({ depth: 1, stack: [] }, "", "/");
  dropClosedLayers();
  expect(go).toHaveBeenCalledWith(-1);

  // Already on the screen's own entry, or on the Add chooser: nothing to do
  go.mockClear();
  window.history.replaceState(
    { depth: 1, stack: [{ kind: "item", id: "a", depth: 1 }] },
    "",
    "/wardrobe?item=a"
  );
  dropClosedLayers();
  window.history.replaceState({ depth: 1, stack: [] }, "", "/wardrobe?add=1");
  dropClosedLayers();
  expect(go).not.toHaveBeenCalled();
  go.mockRestore();
});
