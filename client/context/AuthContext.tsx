import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
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
      const storedToken = await SecureStore.getItemAsync('authToken');
      const storedUser = await SecureStore.getItemAsync('authUser');
      
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
      await SecureStore.setItemAsync('authToken', newToken);
      await SecureStore.setItemAsync('authUser', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      router.replace('/');
    } catch (error) {
      console.error('Error saving auth state', error);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('authUser');
      setToken(null);
      setUser(null);
      router.replace('/auth');
    } catch (error) {
      console.error('Error clearing auth state', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
