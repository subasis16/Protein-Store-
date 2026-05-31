export type CategoryOptions = "All Products" | "Proteins" | "Creatine" | "Pre-Workout" | "Vitamins";

export const CATEGORIES: CategoryOptions[] = [
  "All Products",
  "Proteins",
  "Creatine",
  "Pre-Workout",
  "Vitamins",
];

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews?: number;
  category: CategoryOptions | string;
  image: any;
  flavors?: string[];
  weights?: string[];
  description?: string;
}

