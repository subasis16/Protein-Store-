import Colors from "@/constants/Colors";
import { CATEGORIES, CategoryOptions } from "@/constants/products";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CategoryTabsProps {
  selected: CategoryOptions;
  onSelect: (category: CategoryOptions) => void;
}

const CategoryTabs = ({ selected, onSelect }: CategoryTabsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((item) => {
        const isSelected = item === selected;

        return (
          <TouchableOpacity
            key={item}
            style={[styles.tab, isSelected && styles.tabSelected]}
            onPress={() => onSelect(item)}
          >
            <Text
              style={[styles.tabText, isSelected && styles.tabTextSelected]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default CategoryTabs;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 10,
    paddingTop: 20,
    paddingBottom: 16,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: "transparent",
  },
  tabSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextSelected: {
    color: "#FFFFFF",
  },
});
