import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "@/context/CartContext";

export type TabName = "index" | "favorites" | "cart" | "profile";

interface BottomBarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const tabs = [
  { name: "index", iconActive: "home", iconInactive: "home-outline" },
  { name: "favorites", iconActive: "heart", iconInactive: "heart-outline" },
  { name: "cart", iconActive: "bag-handle", iconInactive: "bag-handle-outline" },
  { name: "profile", iconActive: "person", iconInactive: "person-outline" },
] as const;

const BottomBar = ({ activeTab, onTabChange }: BottomBarProps) => {
  const insets = useSafeAreaInsets();
  const { cartCount } = useCart();
  
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        const isCart = tab.name === "cart";
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => onTabChange(tab.name as TabName)}
          >
            <View style={{ position: "relative" }}>
              <Ionicons
                name={(isActive ? tab.iconActive : tab.iconInactive) as any}
                size={24}
                color={isActive ? Colors.primary : Colors.textPrimary}
              />
              {isCart && cartCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingBottom: 8,
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  tab: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  badgeContainer: {
    position: "absolute",
    right: -8,
    top: -6,
    backgroundColor: Colors.primary,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});
