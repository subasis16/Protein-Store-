import { PRODUCTS, Product } from "@/constants/products";

// Base API configuration
const API_BASE_URL = "https://api.proteinstore.com/v1";

/**
 * Mock API Service
 * In a real app, you would use axios or fetch here.
 */
export const api = {
  // Products
  getProducts: async (category?: string): Promise<Product[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    if (!category || category === "All Products") return PRODUCTS;
    return PRODUCTS.filter(p => p.category === category);
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return PRODUCTS.find(p => p.id === id);
  },

  // Categories
  getCategories: async (): Promise<string[]> => {
    return ["All Products", "Proteins", "Creatine", "Pre-Workout", "Vitamins"];
  },

  // Authentication
  login: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      user: { id: "u1", name: "Subasis Sahoo", email },
      token: "mock-jwt-token"
    };
  },

  // Cart
  getCart: async (userId: string) => {
    return [
      { productId: "1", quantity: 1, size: "1kg" },
      { productId: "2", quantity: 2, size: "500g" },
    ];
  },

  addToCart: async (userId: string, productId: string, quantity: number, size: string) => {
    // POST /cart
    return { success: true };
  },

  // Orders
  placeOrder: async (orderData: any) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { id: "ORD-" + Math.random().toString(36).substr(2, 9), status: "success" };
  }
};

export default api;
