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
  rating: number;
  category: CategoryOptions;
  image: any;
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Protrition Whey",
    subtitle: "Divine Chocolate",
    price: 2499,
    rating: 4.8,
    category: "Proteins",
    image: require("../assets/images/protrition-whey-new.png"),
  },
  {
    id: "2",
    name: "Wellcore Creatine",
    subtitle: "Micronised Monohydrate",
    price: 899,
    rating: 4.9,
    category: "Creatine",
    image: require("../assets/images/wellcore-creatine-new.png"),
  },
  {
    id: "3",
    name: "MuscleTech NitroTech",
    subtitle: "Whey Protein",
    price: 3599,
    rating: 4.7,
    category: "Proteins",
    image: require("../assets/images/muscletech-whey-new.png"),
  },
  {
    id: "4",
    name: "Essential Labs",
    subtitle: "Pure Creatine",
    price: 799,
    rating: 4.6,
    category: "Creatine",
    image: require("../assets/images/essential-creatine-new.png"),
  },
  {
    id: "5",
    name: "Edge Nutrition",
    subtitle: "100% Whey Protein",
    price: 2899,
    rating: 4.8,
    category: "Proteins",
    image: require("../assets/images/edge-whey-new.png"),
  },
  {
    id: "6",
    name: "Integralmedica Nutri Whey",
    subtitle: "Premium Whey Protein",
    price: 1999,
    rating: 4.7,
    category: "Proteins",
    image: require("../assets/images/integralmedica-whey.png"),
  },
];
