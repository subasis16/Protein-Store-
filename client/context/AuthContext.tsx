import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import storage from '../services/storage';
import { useRouter } from 'expo-router';

export interface User {
  id?: string;
  name?: string;
  email: string;
  role?: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getItemAsync('authToken');
      const storedUser = await storage.getItemAsync('authUser');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth state', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData: User, newToken: string) => {
    try {
      await storage.setItemAsync('authToken', newToken);
      await storage.setItemAsync('authUser', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      router.replace('/');
    } catch (error) {
      console.error('Error saving auth state', error);
    }
  };

  const logout = async () => {
    try {
      await storage.deleteItemAsync('authToken');
      await storage.deleteItemAsync('authUser');
      setToken(null);
      setUser(null);
      router.replace('/auth');
    } catch (error) {
      console.error('Error clearing auth state', error);
    }
  };

  const updateUser = async (userData: User) => {
    try {
      await storage.setItemAsync('authUser', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error updating user state', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
