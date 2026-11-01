import { IconType } from "react-icons";
import {
  GiBelt,
  GiLargeDress,
  GiPoloShirt,
  GiRunningShoe,
  GiShirt,
  GiSleevelessJacket,
  GiTrousers,
} from "react-icons/gi";

import { Category } from "utils/types";

// One icon per category, for gaps and empty slots
export const categoryIcons: Record<Category, IconType> = {
  top: GiShirt,
  dress: GiLargeDress,
  bottom: GiTrousers,
  layer: GiPoloShirt,
  shoes: GiRunningShoe,
  accessory: GiBelt,
  outerwear: GiSleevelessJacket,
};
