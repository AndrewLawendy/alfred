import { Timestamp } from "firebase/firestore";

export interface Common {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Shirt extends Common {
  type: "shirt";
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Belt {
  type: "belt";
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface PantsPair {
  type: "pants";
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface ShoePair {
  type: "shoes";
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Jacket {
  type: "jacket";
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  maxTemperature: number;
}
