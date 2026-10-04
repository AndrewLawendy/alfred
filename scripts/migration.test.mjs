import test from "node:test";
import assert from "node:assert/strict";
import { migrateItem, migrateOutfit, migrateSettings } from "./migration.mjs";

const ref = (id) => ({
  referenceValue: `projects/p/databases/(default)/documents/wardrobe-items/${id}`,
});

test("items get their category; new ones are left alone", () => {
  assert.deepEqual(migrateItem({ type: { stringValue: "pants" } }), {
    set: { type: { stringValue: "bottom" } },
    remove: [],
  });
  assert.equal(migrateItem({ type: { stringValue: "dress" } }), null);
});

test("outfits move their slots into pieces, shirt, pants, belt, shoes", () => {
  const result = migrateOutfit({
    shirt: ref("s"),
    belt: ref("b"),
    pants: ref("p"),
    shoes: ref("f"),
  });
  assert.deepEqual(
    result.set.pieces.arrayValue.values.map((v) =>
      v.referenceValue.split("/").pop()
    ),
    ["s", "p", "b", "f"]
  );
  assert.deepEqual(result.remove, ["shirt", "pants", "belt", "shoes"]);
  assert.equal(
    migrateOutfit({ pieces: { arrayValue: { values: [ref("s"), ref("p")] } } }),
    null
  );
});

test("settings rename shirt and pants limits", () => {
  const result = migrateSettings({
    limits: {
      mapValue: {
        fields: { shirt: { integerValue: "2" }, pants: { integerValue: "5" } },
      },
    },
  });
  assert.deepEqual(result.set.limits.mapValue.fields, {
    top: { integerValue: "2" },
    bottom: { integerValue: "5" },
  });
  assert.equal(
    migrateSettings({
      limits: { mapValue: { fields: { top: { integerValue: "2" } } } },
    }),
    null
  );
});

test("an outfit an old app edited after it got pieces is migrated again", () => {
  const result = migrateOutfit({
    pieces: { arrayValue: { values: [ref("stale")] } },
    shirt: ref("s"),
    pants: ref("p"),
  });
  assert.deepEqual(
    result.set.pieces.arrayValue.values.map((v) =>
      v.referenceValue.split("/").pop()
    ),
    ["s", "p"]
  );
  assert.deepEqual(result.remove, ["shirt", "pants"]);
});
