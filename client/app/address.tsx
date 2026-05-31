import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { 
  ActivityIndicator, 
  Alert, 
  FlatList, 
  KeyboardAvoidingView, 
  Modal, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/services/api";

const AddressScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAddresses();
      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSetDefault = async (id: number) => {
    try {
      await api.setDefaultAddress(id);
      fetchAddresses();
      Alert.alert("Success", "Default address updated.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to set default address.");
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteAddress(id);
              fetchAddresses();
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to delete address.");
            }
          }
        }
      ]
    );
  };

  const handleSaveAddress = async () => {
    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      await api.addAddress({
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country
      });
      setModalVisible(false);
      // Reset form
      setFullName("");
      setPhone("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setPostalCode("");
      setCountry("India");
      fetchAddresses();
      Alert.alert("Success", "Address added successfully!");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.response?.data || "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  const renderAddressCard = ({ item }: { item: any }) => (
    <View style={[styles.addressCard, item.isDefault && styles.defaultCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText}>{item.fullName}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>

      <Text style={styles.addressText}>
        {item.addressLine1}
        {item.addressLine2 ? `, ${item.addressLine2}` : ""}
        {`\n${item.city}, ${item.state} - ${item.postalCode}`}
        {`\n${item.country}`}
      </Text>

      <Text style={styles.phoneText}>Phone: {item.phone}</Text>

      {!item.isDefault && (
        <TouchableOpacity 
          style={styles.setDefaultButton}
          onPress={() => handleSetDefault(item.id)}
        >
          <Text style={styles.setDefaultText}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAddressCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={80} color={Colors.border} />
              <Text style={styles.emptyText}>No shipping addresses saved yet.</Text>
              <TouchableOpacity style={styles.emptyAddButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.emptyAddButtonText}>Add New Address</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Add Address Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Address</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput 
                style={styles.input} 
                value={fullName} 
                onChangeText={setFullName}
                placeholder="Enter full name"
                placeholderTextColor={Colors.textSecondary}
              />

              <Text style={styles.label}>Phone Number *</Text>
              <TextInput 
                style={styles.input} 
                value={phone} 
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Enter 10-digit number"
                placeholderTextColor={Colors.textSecondary}
              />

              <Text style={styles.label}>Address Line 1 *</Text>
              <TextInput 
                style={styles.input} 
                value={addressLine1} 
                onChangeText={setAddressLine1}
                placeholder="Flat / House no, Building, Street"
                placeholderTextColor={Colors.textSecondary}
              />

              <Text style={styles.label}>Address Line 2</Text>
              <TextInput 
                style={styles.input} 
                value={addressLine2} 
                onChangeText={setAddressLine2}
                placeholder="Colony, Area, Landmark (optional)"
                placeholderTextColor={Colors.textSecondary}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput 
                    style={styles.input} 
                    value={city} 
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>State *</Text>
                  <TextInput 
                    style={styles.input} 
                    value={state} 
                    onChangeText={setState}
                    placeholder="State"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Pincode *</Text>
                  <TextInput 
                    style={styles.input} 
                    value={postalCode} 
                    onChangeText={setPostalCode}
                    keyboardType="number-pad"
                    placeholder="Pincode"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Country *</Text>
                  <TextInput 
                    style={styles.input} 
                    value={country} 
                    onChangeText={setCountry}
                    placeholder="Country"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, saving && { opacity: 0.7 }]}
                onPress={handleSaveAddress}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default AddressScreen;

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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  addressCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  defaultCard: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  defaultBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  addressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  phoneText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  setDefaultButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  setDefaultText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyAddButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.backgroundBottom,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 50,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
