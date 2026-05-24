import CategoryTabs from "@/components/CategoryTabs";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import PromoBanner from "@/components/PromoBanner";
import SearchBar from "@/components/SearchBar";
import Colors from "@/constants/Colors";
import { CategoryOptions, Product } from "@/constants/products";
import api from "@/services/api";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryOptions>("All Products");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await api.getProducts(selectedCategory);
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, [selectedCategory]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
          ) : null
        }
        ListHeaderComponent={
          <View>
            <View style={[styles.darkSection, { paddingTop: insets.top }]}>
              <Header />
              <SearchBar />
            </View>

            <View style={styles.bannerWrapper}>
              <PromoBanner />
            </View>

            <View style={styles.lightSection}>
              <CategoryTabs
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </View>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundBottom,
  },
  flatList: {
    flex: 1,
  },
  darkSection: {
    backgroundColor: Colors.backgroundTop,
    paddingBottom: 80,
  },
  bannerWrapper: {
    marginTop: -70,
    zIndex: 10,
  },
  lightSection: {
    paddingTop: 10,
  },
  list: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
});
