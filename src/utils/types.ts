import { DocumentReference, DocumentData, Timestamp } from "firebase/firestore";

export interface Common {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  user: string;
}

export type Category =
  "top" | "bottom" | "dress" | "layer" | "shoes" | "accessory" | "outerwear";

export interface Item extends Common {
  type: Category;
  title: string;
  description: string;
  imageUrl: string;
  // Wears since the last wash; missing means clean. In the hamper once it
  // reaches its limit (see utils/laundry)
  wears?: number | null;
  lastWornOn?: string | null; // local "YYYY-MM-DD"
  // Overrides the category's wear limit; 0 means not counted
  wearLimit?: number | null;
  // Outerwear only: suggested at this temperature or cooler
  maxTemperature?: number;
}

export type Jacket = Item & { type: "outerwear"; maxTemperature: number };

export interface Outfit extends Common {
  // The outfit's pieces, in the order the person picked them
  pieces: DocumentReference<DocumentData>[];
  // The outfit's own photo, its cover
  photoUrl?: string;
  // Optional, e.g. "Office Monday"
  name?: string;
  // Before the flexible model; read by normalizeOutfit, never written
  shirt?: DocumentReference<DocumentData>;
  belt?: DocumentReference<DocumentData>;
  pants?: DocumentReference<DocumentData>;
  shoes?: DocumentReference<DocumentData>;
  // Today's jacket: missing or null until decided, false for "no jacket today"
  jacket?: Jacket | null | false;
  order: number;
  active: boolean;
  // Local "YYYY-MM-DD" it came on screen (Next outfit, Wear today)
  pickedOn?: string | null;
  // First outfit skipped since the last pick: it keeps its turn
  heldTurn?: boolean | null;
}
