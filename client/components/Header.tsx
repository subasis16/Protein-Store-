import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

const Header = () => {
  const router = useRouter();
  const [locationText, setLocationText] = useState("Fetching location...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationText("Location access denied");
        setLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (address) {
        const city = address.city || address.subregion || "";
        const region = address.region || address.country || "";
        setLocationText(city && region ? `${city}, ${region}` : city || region || "Unknown location");
      } else {
        setLocationText("Unknown location");
      }
    } catch (error) {
      console.log("Location error:", error);
      setLocationText("Location unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.label}>Location</Text>
        <TouchableOpacity style={styles.locationRow} onPress={getLocation}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <Ionicons name="location" size={14} color={Colors.primary} />
              <Text style={styles.locationText}>{locationText}</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.primary} />
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.notificationButton} 
        onPress={() => router.push("/notifications")}
      >
        <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
        <View style={styles.notificationBadge} />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1,
    borderColor: Colors.cardBackground,
  },
});

