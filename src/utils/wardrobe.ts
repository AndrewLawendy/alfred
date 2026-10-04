import type { Category } from "utils/types";

export type { Category };

// The categories, in the order an outfit is laid out and listed
export const CATEGORIES: {
  key: Category;
  label: string;
  plural: string;
  inOutfit: boolean;
  // Wears before washing; 0 means not counted
  defaultLimit: number;
  // Several of them in one outfit
  multi: boolean;
}[] = [
  {
    key: "top",
    label: "Top",
    plural: "Tops",
    inOutfit: true,
    defaultLimit: 1,
    multi: false,
  },
  {
    key: "dress",
    label: "Dress",
    plural: "Dresses",
    inOutfit: true,
    defaultLimit: 1,
    multi: false,
  },
  {
    key: "bottom",
    label: "Bottom",
    plural: "Bottoms",
    inOutfit: true,
    defaultLimit: 3,
    multi: false,
  },
  {
    key: "layer",
    label: "Layer",
    plural: "Layers",
    inOutfit: true,
    defaultLimit: 5,
    multi: false,
  },
  {
    key: "shoes",
    label: "Shoes",
    plural: "Shoes",
    inOutfit: true,
    defaultLimit: 0,
    multi: false,
  },
  {
    key: "accessory",
    label: "Accessory",
    plural: "Accessories",
    inOutfit: true,
    defaultLimit: 0,
    multi: true,
  },
  // Chosen each day by the weather (the jacket prompt), never part of an outfit
  {
    key: "outerwear",
    label: "Outerwear",
    plural: "Outerwear",
    inOutfit: false,
    defaultLimit: 0,
    multi: false,
  },
];

export const OUTFIT_CATEGORIES = CATEGORIES.filter(
  ({ inOutfit }) => inOutfit
).map(({ key }) => key);

export const MIN_PIECES = 2;
export const MAX_PIECES = 6;

// Before the flexible model, items had five fixed types
// ponytail: scripts/migration.mjs and functions/reminder.js repeat this
// mapping; change all three together
export const LEGACY: Record<string, Category> = {
  shirt: "top",
  pants: "bottom",
  belt: "accessory",
  shoes: "shoes",
  jacket: "outerwear",
};

const isCategory = (type: string): type is Category =>
  CATEGORIES.some(({ key }) => key === type);

// The Wardrobe tab for a URL segment: old type names open their category
export const tabFor = (param?: string): Category =>
  (param && (LEGACY[param] || (isCategory(param) && param))) || "top";

export const categoryOf = (type: string): Category =>
  LEGACY[type] ?? (isCategory(type) ? type : "accessory");

export const normalizeItem = <T extends { type: string }>(item: T) =>
  ({ ...item, type: categoryOf(item.type) }) as T & { type: Category };

type Ref = { id: string };
type MaybeOld = {
  pieces?: (Ref | null | undefined)[];
  shirt?: Ref | null;
  pants?: Ref | null;
  belt?: Ref | null;
  shoes?: Ref | null;
};

// The outfit's piece references: its pieces, or the old slots in shirt,
// pants, belt, shoes order. Missing references are dropped.
const refsOf = (outfit: MaybeOld) =>
  (
    outfit.pieces ?? [outfit.shirt, outfit.pants, outfit.belt, outfit.shoes]
  ).filter((piece): piece is Ref => !!piece);

export const pieceIdsOf = (outfit: MaybeOld): string[] =>
  refsOf(outfit).map(({ id }) => id);

export const normalizeOutfit = <T extends MaybeOld>(outfit: T) =>
  ({ ...outfit, pieces: refsOf(outfit) }) as T & { pieces: Ref[] };

export const rank = (type: string) =>
  CATEGORIES.findIndex(({ key }) => key === categoryOf(type));

// How an outfit is shown: what you wear on the body large, layers beside,
// shoes and accessories small. Within a category, the order the person picked
// (sort is stable).
export const layoutOf = <I extends { id: string; type: string }>(
  pieces: I[]
) => {
  const sorted = [...pieces].sort((a, b) => rank(a.type) - rank(b.type));
  const of =
    (...categories: Category[]) =>
    (piece: I) =>
      categories.includes(categoryOf(piece.type));
  return {
    main: sorted.filter(of("top", "dress", "bottom")),
    side: sorted.filter(of("layer")),
    small: sorted.filter(of("shoes", "accessory", "outerwear")),
  };
};

// Phase 2 adds "or a photo"
export const isOutfitValid = (pieceCount: number) =>
  pieceCount >= MIN_PIECES && pieceCount <= MAX_PIECES;

// Picking a piece for an outfit: accessories add up; in any other category
// it replaces that category's pick. Tapping a pick again takes it out. A
// piece that would make more than MAX_PIECES is refused (same array back).
export const togglePick = (
  picks: string[],
  id: string,
  typeOf: (id: string) => string | undefined
): string[] => {
  if (picks.includes(id)) return picks.filter((pick) => pick !== id);
  const category = categoryOf(typeOf(id) ?? "");
  const isMulti = CATEGORIES.find(({ key }) => key === category)?.multi;
  const kept = isMulti
    ? picks
    : picks.filter((pick) => categoryOf(typeOf(pick) ?? "") !== category);
  return kept.length >= MAX_PIECES ? picks : [...kept, id];
};

// What an outfit still needs: a top and a bottom, unless it has a dress
export const gapsFor = (types: string[]): Category[] => {
  const categories = types.map(categoryOf);
  if (categories.includes("dress")) return [];
  return (["top", "bottom"] as const).filter(
    (category) => !categories.includes(category)
  );
};
