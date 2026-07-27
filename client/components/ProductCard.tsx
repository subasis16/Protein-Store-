import Colors from "@/constants/Colors";
import { Product } from "@/constants/products";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert } from "react-native";
import { useCart } from "@/context/CartContext";
import api from "@/services/api";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();
  const { addToCart } = useCart();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/details/${product.id}` as any)}
      activeOpacity={0.85}
    >
      {/* Image Area */}
      <View style={styles.imageContainer}>
        <Image source={product.image} style={styles.productImage} resizeMode="contain" />
        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color="#FFFFFF" />
          <Text style={styles.ratingText}>{product.rating}</Text>
        </View>
      </View>

      {/* Info */}
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.subtitle} numberOfLines={1}>
        {product.subtitle}
      </Text>

      {/* Price Row */}
      <View style={styles.priceRow}>
        <Text style={styles.price}>₹ {product.price}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={async (e) => {
            e.stopPropagation();
            try {
              await addToCart(product.id, 1);
              Alert.alert("Success", "Added to cart!");
            } catch (error: any) {
              Alert.alert("Error", api.getErrorMessage(error, "Failed to add to cart. Please login first."));
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 10,
    width: "47%",
    marginBottom: 16,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: Colors.backgroundTop,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 10,
  },
  productImage: {
    width: "85%",
    height: "85%",
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
