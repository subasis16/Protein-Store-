import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const PromoBanner = () => {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Promo Offer</Text>
      </View>
      <Text style={styles.title}>BUY ONE GET ONE FREE</Text>
      <Text style={styles.subtitle}>Exclusive deal on all premium proteins & supplements</Text>
    </View>
  );
};

export default PromoBanner;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryLight,
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
    borderWidth: 1,
    borderColor: "rgba(154, 23, 32, 0.08)",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 10,
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.primary,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 6,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.85,
  },
});
