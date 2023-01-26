import { Timestamp } from "firebase/firestore";

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
