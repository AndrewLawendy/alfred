import { DocumentReference, DocumentData, Timestamp } from "firebase/firestore";

export interface Common {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  user: string;
}

export interface Shirt extends Common {
  type: "shirt";
  title: string;
  description: string;
  imageUrl: string;
  // Wears since the last wash; missing means clean. In the hamper once it
  // reaches the type's limit (see utils/laundry)
  wears?: number | null;
  lastWornOn?: string | null; // local "YYYY-MM-DD"
}

export interface Belt extends Common {
  type: "belt";
  title: string;
  description: string;
  imageUrl: string;
}

export interface PantsPair extends Common {
  type: "pants";
  title: string;
  description: string;
  imageUrl: string;
  // Wears since the last wash; missing means clean. In the hamper once it
  // reaches the type's limit (see utils/laundry)
  wears?: number | null;
  lastWornOn?: string | null; // local "YYYY-MM-DD"
}

export interface ShoePair extends Common {
  type: "shoes";
  title: string;
  description: string;
  imageUrl: string;
}

export interface Jacket extends Common {
  type: "jacket";
  title: string;
  description: string;
  imageUrl: string;
  maxTemperature: number;
}

export type Item = Shirt | Belt | PantsPair | ShoePair | Jacket;

export interface Outfit extends Common {
  shirt: DocumentReference<DocumentData>;
  belt: DocumentReference<DocumentData>;
  pants: DocumentReference<DocumentData>;
  shoes: DocumentReference<DocumentData>;
  // Today's jacket: missing or null until decided, false for "no jacket today"
  jacket?: Jacket | null | false;
  order: number;
  active: boolean;
  // Local "YYYY-MM-DD" it came on screen (Pick today's, Not today, Wear today)
  pickedOn?: string | null;
  // First outfit skipped since the last pick: it keeps its turn
  heldTurn?: boolean | null;
}
