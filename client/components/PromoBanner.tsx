import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const PromoBanner = () => {
  return (
    <View style={styles.container}>
      {/* Left Content */}
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Promo</Text>
        </View>
        <Text style={styles.title}>Buy one get</Text>
        <Text style={styles.title}>one FREE</Text>
      </View>

      {/* Right Visual Elements — simulates product imagery */}
      <View style={styles.visualArea}>
        <View style={styles.circle1}>
          <Ionicons name="flask" size={32} color={Colors.primary} />
        </View>
        <View style={styles.circle2}>
          <Ionicons name="nutrition" size={24} color={Colors.primary} />
        </View>
      </View>
    </View>
  );
};

export default PromoBanner;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryLight,
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    minHeight: 150,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  badge: {
    backgroundColor: Colors.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  visualArea: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  circle1: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(154, 23, 32, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  circle2: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "rgba(154, 23, 32, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
});
