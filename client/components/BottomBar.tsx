import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

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
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => onTabChange(tab.name as TabName)}
          >
            <Ionicons
              name={(isActive ? tab.iconActive : tab.iconInactive) as any}
              size={24}
              color={isActive ? Colors.primary : Colors.textPrimary}
            />
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
});
