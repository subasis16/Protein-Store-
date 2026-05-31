import Colors from "@/constants/Colors";
import ProductCard from "@/components/ProductCard";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/services/api";

const FavoritesScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getWishlist();
      setFavorites(data);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, [fetchWishlist])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      <FlatList
        data={favorites}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={80} color={Colors.border} />
              <Text style={styles.emptyText}>No favorites yet</Text>
              <TouchableOpacity style={styles.shopButton} onPress={() => router.push("/")}>
                <Text style={styles.shopButtonText}>Explore Products</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundBottom,
  },
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  list: {
    padding: 10,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  }
});
