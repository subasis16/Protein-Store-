import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useCallback, useRef } from "react";
import { StyleSheet, TextInput, View, TouchableOpacity, FlatList, Text, Image, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import api from "@/services/api";
import { Product } from "@/constants/products";

const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setShowResults(true);
    setSearching(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.searchProducts(text.trim());
        setResults(data);
      } catch (error) {
        console.log("Search error", error);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const handleSelectProduct = (product: Product) => {
    Keyboard.dismiss();
    setShowResults(false);
    setQuery("");
    setResults([]);
    router.push(`/details/${product.id}` as any);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Search supplements"
            placeholderTextColor={Colors.textSecondary}
            value={query}
            onChangeText={handleSearch}
            onFocus={() => query.trim() && setShowResults(true)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showResults && (
        <View style={styles.resultsContainer}>
          {searching ? (
            <Text style={styles.statusText}>Searching...</Text>
          ) : results.length === 0 && query.trim() ? (
            <Text style={styles.statusText}>No results found for "{query}"</Text>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              style={styles.resultsList}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectProduct(item)}>
                  <Image source={item.image} style={styles.resultImage} resizeMode="contain" />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.resultPrice}>₹{item.price}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 100,
  },
  container: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  resultsContainer: {
    position: "absolute",
    top: 52,
    left: 24,
    right: 24,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  resultImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.backgroundTop,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  resultPrice: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "bold",
    marginTop: 2,
  },
  statusText: {
    padding: 20,
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
