import { resizer } from "utils/resizeImage";

// The library is CommonJS: depending on the bundler it arrives wrapped once
// or twice; either way the resizer must be found
test("the image resizer is found whatever way the library is bundled", () => {
  expect(typeof resizer.imageFileResizer).toBe("function");
});
