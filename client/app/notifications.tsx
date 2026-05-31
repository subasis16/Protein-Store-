import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NotificationsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const notifications = [
    {
      title: "Order Delivered! 🥳",
      body: "Your order of Premium Whey Protein Has Been Delivered to your shipping address.",
      time: "2 hours ago",
      icon: "checkmark-circle-outline",
      iconColor: "#4ADE80"
    },
    {
      title: "Flash Sale Alert! ⚡",
      body: "Flat 20% off on all pre-workouts only for the next 3 hours. Hurry!",
      time: "1 day ago",
      icon: "flash-outline",
      iconColor: "#FBBF24"
    },
    {
      title: "Back in stock! 📦",
      body: "Micronized Creatine Monohydrate is back in stock. Order now before it runs out!",
      time: "2 days ago",
      icon: "cube-outline",
      iconColor: Colors.primary
    }
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {notifications.map((item, index) => (
          <View key={index} style={styles.notificationCard}>
            <View style={[styles.iconWrapper, { backgroundColor: `${item.iconColor}20` }]}>
              <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.notiTitle}>{item.title}</Text>
              <Text style={styles.notiBody}>{item.body}</Text>
              <Text style={styles.notiTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundBottom,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 24,
    gap: 16,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  notiTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  notiBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  notiTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});
