// One-time move to categories and pieces, as pure functions over Firestore
// REST documents' fields. Each returns { set, remove } for an update, or
// null when the document is already in the new shape. The app reads both
// shapes (normalizeItem, normalizeOutfit), so this can run at any time.

// Old item types and the category each became
const LEGACY = {
  shirt: "top",
  pants: "bottom",
  belt: "accessory",
  shoes: "shoes",
  jacket: "outerwear",
};

// The old outfit slots, in the order they become pieces
const SLOTS = ["shirt", "pants", "belt", "shoes"];

export const migrateItem = (fields) => {
  const type = fields.type?.stringValue;
  const category = LEGACY[type];
  if (!category || category === type) return null;
  return { set: { type: { stringValue: category } }, remove: [] };
};

export const migrateOutfit = (fields) => {
  if (fields.pieces) return null;
  const present = SLOTS.filter((slot) => fields[slot]?.referenceValue);
  if (!present.length) return null;
  return {
    set: {
      pieces: { arrayValue: { values: present.map((slot) => fields[slot]) } },
    },
    remove: present,
  };
};

export const migrateSettings = (fields) => {
  const limits = fields.limits?.mapValue?.fields;
  if (!limits || !("shirt" in limits || "pants" in limits)) return null;
  const { shirt, pants, ...rest } = limits;
  return {
    set: {
      limits: {
        mapValue: {
          fields: {
            ...(shirt && { top: shirt }),
            ...(pants && { bottom: pants }),
            ...rest,
          },
        },
      },
    },
    remove: [],
  };
};
