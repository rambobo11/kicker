export const CATEGORIES = ["Engie", "ESGI", "BBX", "Basket", "Base Camp"] as const;

export type Category = (typeof CATEGORIES)[number];

export const INTERVALS = [1, 3, 7, 14, 30] as const;

export type IntervalDays = (typeof INTERVALS)[number];

export function isCategory(value: string): value is Category {
  return CATEGORIES.some((category) => category === value);
}

export function isInterval(value: number): value is IntervalDays {
  return INTERVALS.some((interval) => interval === value);
}

export const categoryClass: Record<Category, string> = {
  Engie: "text-[#3d6f9a] dark:text-[#9ec4e4]",
  ESGI: "text-[#6d5b96] dark:text-[#cbbce6]",
  BBX: "text-[#9a7040] dark:text-[#e4c4a0]",
  Basket: "text-[#c2613a] dark:text-[#f0b098]",
  "Base Camp": "text-[#6e6a64] dark:text-[#c4bfb8]",
};
