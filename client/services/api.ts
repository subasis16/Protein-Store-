import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Product } from "@/constants/products";
import { Platform } from 'react-native';

// ============================================================
// IMPORTANT: For physical device (Expo Go via QR code), use your
// computer's local WiFi IP address. Find it with: ipconfig
// Replace the IP below with yours if 10.12.208.71 doesn't work.
// ============================================================
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Physical Android device — use your computer's WiFi IP
    return "http://10.12.208.71:8080/api";
  }
  // iOS simulator or web
  return "http://localhost:8080/api";
};

const API_BASE_URL = getBaseUrl();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request automatically
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Helper: map backend ProductResponseDTO → frontend Product
// ============================================================
const imageMap: Record<string, any> = {
  "protein 1.jpg": require('@/assets/images/protein 1.jpg'),
  "protein 2.jpg": require('@/assets/images/protein 2.jpg'),
  "protein 3.jpg": require('@/assets/images/protein 3.jpg'),
  "protein 4.jpg": require('@/assets/images/protein 4.jpg'),
  "creatine 1.jpg": require('@/assets/images/creatine 1.jpg'),
  "creatine 2.jpg": require('@/assets/images/creatine 2.jpg'),
  "preworkout 1.jpg": require('@/assets/images/preworkout 1.jpg'),
  "vitamins.jpg": require('@/assets/images/vitamins.jpg'),
};

const mapProduct = (p: any): Product => {
  let imageSource = require('@/assets/images/icon.png');
  if (p.imageUrls && p.imageUrls.length > 0) {
    const url = p.imageUrls[0];
    if (imageMap[url]) {
      imageSource = imageMap[url];
    } else {
      imageSource = { uri: url };
    }
  }

  return {
    id: p.id,
    name: p.name,
    subtitle: p.brand || "",
    price: p.price,
    originalPrice: p.originalPrice,
    image: imageSource,
    rating: p.rating || 0,
    reviews: p.reviewCount || 0,
    category: p.category || "",
    flavors: p.flavors || [],
    weights: p.weight ? [p.weight] : [],
    description: p.description || "",
  };
};

// ============================================================
// API Methods — match backend controllers exactly
// ============================================================
export const api = {

  // -----------------------------------------------------------
  // AUTH — AuthController: /api/auth
  // POST /api/auth/login  → ApiResponse<AuthResponseDTO>
  // POST /api/auth/signup  → ApiResponse<AuthResponseDTO>
  // POST /api/auth/logout  → ApiResponse<String>
  // AuthResponseDTO has: accessToken, tokenType, email
  // -----------------------------------------------------------
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    // response.data = { success, message, data: { accessToken, tokenType, email, role, fullName } }
    const authData = response.data.data;
    return {
      token: authData.accessToken,
      user: { email: authData.email, name: authData.fullName, role: authData.role }
    };
  },

  register: async (name: string, email: string, password: string) => {
    const response = await axiosInstance.post('/auth/signup', {
      fullName: name,  // backend field is "fullName" in SignupRequestDTO
      email,
      password
    });
    const authData = response.data.data;
    return {
      token: authData.accessToken,
      user: { email: authData.email, name: authData.fullName, role: authData.role }
    };
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (e) {
      // Even if logout fails on server, we clear local token
    }
  },

  // -----------------------------------------------------------
  // PRODUCTS — ProductController: /api/products
  // GET /api/products         → ApiResponse<List<ProductResponseDTO>>
  // GET /api/products/{id}    → ApiResponse<ProductResponseDTO>
  // GET /api/products/category/{cat} → ApiResponse<List<ProductResponseDTO>>
  // GET /api/products/search?query=  → ApiResponse<List<ProductResponseDTO>>
  // -----------------------------------------------------------
  getProducts: async (category?: string): Promise<Product[]> => {
    try {
      let url = '/products';
      if (category && category !== "All Products") {
        url = `/products/category/${category}`;
      }
      const response = await axiosInstance.get(url);
      // response.data = { success, message, data: [ ProductResponseDTO, ... ] }
      const products = response.data.data;
      return (products || []).map(mapProduct);
    } catch (error: any) {
      console.log('Error fetching products', error.message);
      return [];
    }
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      // response.data = { success, message, data: ProductResponseDTO }
      return mapProduct(response.data.data);
    } catch (error) {
      console.error('Error fetching product', error);
      return undefined;
    }
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      const response = await axiosInstance.get(`/products/search?query=${query}`);
      const products = response.data.data;
      return (products || []).map(mapProduct);
    } catch (error) {
      console.error('Error searching products', error);
      return [];
    }
  },

  // Categories — hardcoded since backend doesn't have a separate endpoint
  getCategories: async (): Promise<string[]> => {
    return ["All Products", "Proteins", "Creatine", "Pre-Workout", "Vitamins"];
  },

  // -----------------------------------------------------------
  // CART — CartController: /api/cart
  // POST /api/cart/add          → String (body: AddCartItemRequestDTO)
  // GET  /api/cart               → CartResponseDTO (NOT wrapped in ApiResponse)
  // PUT  /api/cart/update        → String (body: UpdateCartItemRequestDTO)
  // DELETE /api/cart/remove?productId=  → String (@RequestParam, NOT path var)
  // DELETE /api/cart/clear       → String
  // -----------------------------------------------------------
  getCart: async () => {
    try {
      const response = await axiosInstance.get('/cart');
      // CartController returns CartResponseDTO directly (no ApiResponse wrapper)
      const cartData = response.data;
      if (!cartData || !cartData.items) return { items: [], totalAmount: 0 };
      return {
        items: cartData.items.map((item: any) => {
          let imageSource = require('@/assets/images/icon.png');
          if (item.imageUrl) {
            if (imageMap[item.imageUrl]) {
              imageSource = imageMap[item.imageUrl];
            } else {
              imageSource = { uri: item.imageUrl };
            }
          }
          return {
            id: item.productId,
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
            image: imageSource,
          };
        }),
        totalAmount: cartData.totalAmount || 0,
      };
    } catch (error: any) {
      // Cart might not exist yet for new users
      console.log('Error fetching cart', error.message);
      return { items: [], totalAmount: 0 };
    }
  },

  addToCart: async (productId: string, quantity: number) => {
    const response = await axiosInstance.post('/cart/add', {
      productId,
      quantity,
    });
    return response.data;
  },

  updateCartItem: async (productId: string, quantity: number) => {
    const response = await axiosInstance.put('/cart/update', {
      productId,
      quantity,
    });
    return response.data;
  },

  removeFromCart: async (productId: string) => {
    // Backend uses @RequestParam, not path variable
    const response = await axiosInstance.delete(`/cart/remove?productId=${productId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await axiosInstance.delete('/cart/clear');
    return response.data;
  },

  // -----------------------------------------------------------
  // WISHLIST — WishlistController: /api/wishlist
  // POST   /api/wishlist/add?productId=   → String
  // GET    /api/wishlist                  → List<WishlistResponseDTO> (NOT ApiResponse)
  // DELETE /api/wishlist/remove?productId= → String
  // WishlistResponseDTO: { id, productId, productName, price, imageUrl }
  // -----------------------------------------------------------
  getWishlist: async (): Promise<any[]> => {
    try {
      const response = await axiosInstance.get('/wishlist');
      // Returns List<WishlistResponseDTO> directly (no ApiResponse wrapper)
      const items = response.data;
      if (!items) return [];
      return items.map((item: any) => {
        let imageSource = require('@/assets/images/icon.png');
        if (item.imageUrl) {
          if (imageMap[item.imageUrl]) {
            imageSource = imageMap[item.imageUrl];
          } else {
            imageSource = { uri: item.imageUrl };
          }
        }
        return {
          id: item.productId,
          name: item.productName,
          subtitle: "",
          price: item.price || 0,
          image: imageSource,
          rating: 0,
          reviews: 0,
          category: "",
        };
      });
    } catch (error: any) {
      console.log('Error fetching wishlist', error.message);
      return [];
    }
  },

  addToWishlist: async (productId: string) => {
    const response = await axiosInstance.post(`/wishlist/add?productId=${productId}`);
    return response.data;
  },

  removeFromWishlist: async (productId: string) => {
    const response = await axiosInstance.delete(`/wishlist/remove?productId=${productId}`);
    return response.data;
  },

  // -----------------------------------------------------------
  // ORDERS — OrderController: /api/orders
  // POST /api/orders/place?addressId=  → String
  // GET  /api/orders                   → List<OrderResponseDTO> (NOT ApiResponse)
  // GET  /api/orders/{orderId}         → OrderResponseDTO
  // PUT  /api/orders/cancel/{orderId}  → String
  // -----------------------------------------------------------
  getOrders: async () => {
    try {
      const response = await axiosInstance.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders', error);
      return [];
    }
  },

  getOrderById: async (orderId: number) => {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  },

  placeOrder: async (addressId: number, paymentMethod: string = "cod") => {
    const response = await axiosInstance.post(`/orders/place?addressId=${addressId}&paymentMethod=${paymentMethod}`);
    return response.data;
  },

  cancelOrder: async (orderId: number) => {
    const response = await axiosInstance.put(`/orders/cancel/${orderId}`);
    return response.data;
  },

  // -----------------------------------------------------------
  // ADDRESS — AddressController: /api/address
  // POST /api/address/add                → String
  // GET  /api/address                    → List<AddressResponseDTO>
  // PUT  /api/address/update/{addressId} → String
  // DELETE /api/address/delete/{addressId}→ String
  // PUT  /api/address/default/{addressId}→ String
  // -----------------------------------------------------------
  getAddresses: async () => {
    try {
      const response = await axiosInstance.get('/address');
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses', error);
      return [];
    }
  },

  addAddress: async (address: any) => {
    const response = await axiosInstance.post('/address/add', address);
    return response.data;
  },

  updateAddress: async (addressId: number, address: any) => {
    const response = await axiosInstance.put(`/address/update/${addressId}`, address);
    return response.data;
  },

  deleteAddress: async (addressId: number) => {
    const response = await axiosInstance.delete(`/address/delete/${addressId}`);
    return response.data;
  },

  setDefaultAddress: async (addressId: number) => {
    const response = await axiosInstance.put(`/address/default/${addressId}`);
    return response.data;
  },

  // -----------------------------------------------------------
  // ADMIN — AdminController: /api/admin
  // -----------------------------------------------------------
  getAdminUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },
  
  deleteAdminUser: async (userId: number) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  },

  addAdminProduct: async (productData: any) => {
    const response = await axiosInstance.post('/admin/products', productData);
    return response.data;
  },

  deleteAdminProduct: async (productId: string) => {
    const response = await axiosInstance.delete(`/admin/products/${productId}`);
    return response.data;
  },

  reseedProducts: async () => {
    const response = await axiosInstance.post('/admin/products/reseed');
    return response.data;
  },

  getAdminOrders: async () => {
    const response = await axiosInstance.get('/admin/orders');
    return response.data;
  },

  sendNotification: async (title: string, message: string, icon: string, iconColor: string) => {
    const response = await axiosInstance.post('/admin/notifications', {
      title,
      message,
      icon,
      iconColor,
    });
    return response.data;
  },

  // -----------------------------------------------------------
  // NOTIFICATIONS — NotificationController: /api/notifications
  // -----------------------------------------------------------
  getNotifications: async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
  },

  getErrorMessage: (error: any, defaultMessage: string): string => {
    if (error?.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') return data;
      if (typeof data === 'object') {
        if (data.message) return data.message;
        if (data.error) return data.error;
      }
    }
    if (error?.message) return error.message;
    return defaultMessage;
  },
};

export default api;
