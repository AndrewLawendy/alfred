import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";

import resizeImage from "./resizeImage";

type ResizeImage = typeof resizeImage;

// Bundled the way the app is: Vite wraps a CommonJS package like the resizer
// differently from these tests, so the source alone passed while every photo
// failed in the app. The bundle runs in the same tests as the source.
const bundle = async (): Promise<ResizeImage> => {
  const [{ output }] = (await build({
    configFile: false,
    logLevel: "silent",
    build: {
      write: false,
      lib: {
        entry: "src/utils/resizeImage.ts",
        formats: ["es"],
        fileName: "resizeImage",
      },
    },
  })) as { output: { code: string }[] }[];
  // Inside the project, where the test runner imports from
  mkdirSync(join("node_modules", ".cache"), { recursive: true });
  const dir = mkdtempSync(join("node_modules", ".cache", "resize-image-"));
  const file = join(dir, "resizeImage.mjs");
  writeFileSync(file, output[0].code);
  try {
    const built = (await import(
      /* @vite-ignore */ pathToFileURL(resolve(file)).href
    )) as { default: ResizeImage };
    return built.default;
  } finally {
    rmSync(dir, { recursive: true });
  }
};

// jsdom can't decode or draw an image: load every image as 1536×1024 and
// draw onto a canvas that returns a fixed JPEG
const drawn: { width: number; height: number }[] = [];
const fakeImages = () => {
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockResolvedValue({ close: vi.fn() })
  );
  vi.stubGlobal(
    "Image",
    class {
      width = 1536;
      height = 1024;
      onload?: () => void;
      set src(_: string) {
        setTimeout(() => this.onload?.());
      }
    }
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    function (this: HTMLCanvasElement) {
      drawn.push({ width: this.width, height: this.height });
      return {
        fillRect: vi.fn(),
        drawImage: vi.fn(),
        rotate: vi.fn(),
        translate: vi.fn(),
      } as unknown as CanvasRenderingContext2D;
    }
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    `data:image/jpeg;base64,${btoa("resized")}`
  );
};

const photo = new File(["photo"], "shirt.png", { type: "image/png" });

beforeEach(() => {
  drawn.length = 0;
  fakeImages();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe.each([
  ["source", () => Promise.resolve(resizeImage)],
  ["Vite bundle", bundle],
])("resizeImage, from its %s", (_, load) => {
  let resize: ResizeImage;
  beforeAll(async () => {
    resize = await load();
  }, 30_000);

  test("a picked photo comes back as a JPEG, 768 on its long side", async () => {
    const file = await resize(photo);

    expect(file).toBeInstanceOf(File);
    expect(file.type).toBe("image/jpeg");
    expect(file.name).toBe("shirt.JPEG");
    expect(await file.text()).toBe("resized");
    expect(drawn).toEqual([{ width: 768, height: 512 }]);
  });

  test("a photo this browser can't read fails fast, without resizing", async () => {
    vi.mocked(createImageBitmap).mockRejectedValue(
      new DOMException("The source image could not be decoded.")
    );

    await expect(resize(photo)).rejects.toThrow("could not be decoded");
    expect(drawn).toEqual([]);
  });
});
