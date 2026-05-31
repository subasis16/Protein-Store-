import Colors from "@/constants/Colors";
import { Product } from "@/constants/products";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/services/api";

const ProductDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productData, wishlistData] = await Promise.all([
          api.getProductById(id as string),
          api.getWishlist().catch(() => []), // Catch if not logged in
        ]);
        setProduct(productData);
        if (productData && wishlistData) {
          const inWish = wishlistData.some((item: any) => item.id === productData.id);
          setIsInWishlist(inWish);
        }
      } catch (error) {
        console.error("Error fetching product details", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      await api.addToCart(product.id, 1);
      Alert.alert("Success", "Added to cart!");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data || "Failed to add to cart. Please login first.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      if (isInWishlist) {
        await api.removeFromWishlist(product.id);
        setIsInWishlist(false);
        Alert.alert("Success", "Removed from wishlist!");
      } else {
        await api.addToWishlist(product.id);
        setIsInWishlist(true);
        Alert.alert("Success", "Added to wishlist!");
      }
    } catch (error: any) {
      Alert.alert("Error", error.response?.data || "Failed to update wishlist. Please login first.");
    }
  };

  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text>Product not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        <View style={[styles.imageSection, { paddingTop: insets.top + 20 }]}>
          <View style={[styles.headerButtons, { top: Math.max(insets.top, 10) }]}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleToggleWishlist}>
              <Ionicons 
                name={isInWishlist ? "heart" : "heart-outline"} 
                size={24} 
                color={isInWishlist ? Colors.primary : Colors.textPrimary} 
              />
            </TouchableOpacity>
          </View>
          
          <Image source={product.image} style={styles.productImage} resizeMode="contain" />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.subtitle}>{product.subtitle}</Text>
            </View>
            <View style={styles.ratingBox}>
               <Ionicons name="star" size={16} color="#FFD700" />
               <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {product.description || `This high-quality ${product.category} supplement is designed to support your fitness goals. Formulated with premium ingredients to ensure maximum absorption and effectiveness.`}
            </Text>
          </View>

          {product.weights && product.weights.length > 0 && (
            <View style={styles.sizeContainer}>
              <Text style={styles.descriptionTitle}>Available Size</Text>
              <View style={styles.sizeRow}>
                {product.weights.map((size) => (
                  <TouchableOpacity key={size} style={[styles.sizeTab, styles.sizeTabActive]}>
                    <Text style={[styles.sizeText, styles.sizeTextActive]}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {product.flavors && product.flavors.length > 0 && (
            <View style={styles.sizeContainer}>
              <Text style={styles.descriptionTitle}>Flavors</Text>
              <View style={styles.sizeRow}>
                {product.flavors.map((flavor) => (
                  <TouchableOpacity key={flavor} style={[styles.sizeTab, styles.sizeTabActive]}>
                    <Text style={[styles.sizeText, styles.sizeTextActive]}>{flavor}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Section */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>₹{product.price}</Text>
        </View>
        <TouchableOpacity
          style={[styles.buyButton, addingToCart && { opacity: 0.7 }]}
          onPress={handleAddToCart}
          disabled={addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buyButtonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundBottom,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageSection: {
    backgroundColor: Colors.backgroundTop,
    height: 400,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: "center",
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 24,
    position: "absolute",
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: 250,
    height: 250,
    marginTop: 40,
  },
  infoSection: {
    padding: 24,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  sizeContainer: {
    marginBottom: 24,
  },
  sizeRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  sizeTab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  sizeTabActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.cardBackground,
  },
  sizeText: {
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  sizeTextActive: {
    color: Colors.primary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  buyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 16,
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
