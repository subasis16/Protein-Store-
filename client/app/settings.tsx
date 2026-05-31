import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, Switch, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SettingsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [darkMode, setDarkMode] = useState(false);
  const [pushNoti, setPushNoti] = useState(true);
  const [emailNoti, setEmailNoti] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          {[
            { label: "Edit Profile", icon: "person-outline" },
            { label: "Change Password", icon: "key-outline" },
            { label: "Language", icon: "globe-outline", value: "English" }
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <View style={styles.iconWrapper}>
                  <Ionicons name={item.icon as any} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>
              <View style={styles.itemRight}>
                {item.value && <Text style={styles.valueText}>{item.value}</Text>}
                <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons name="moon-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.itemLabel}>Dark Mode</Text>
            </View>
            <Switch 
              value={darkMode} 
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.itemLabel}>Push Notifications</Text>
            </View>
            <Switch 
              value={pushNoti} 
              onValueChange={setPushNoti}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons name="mail-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.itemLabel}>Email Notifications</Text>
            </View>
            <Switch 
              value={emailNoti} 
              onValueChange={setEmailNoti}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 16,
    marginTop: 10,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 30,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.backgroundBottom,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  valueText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
