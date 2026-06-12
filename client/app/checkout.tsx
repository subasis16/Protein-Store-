import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/services/api";

const CheckoutScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [cart, setCart] = useState<{ items: any[], totalAmount: number }>({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cartData, addressData] = await Promise.all([
        api.getCart(),
        api.getAddresses(),
      ]);
      setCart(cartData);
      setAddresses(addressData);
      // Auto-select default address or first address
      const defaultAddr = addressData.find((a: any) => a.isDefault || a.default);
      setSelectedAddress(defaultAddr || addressData[0] || null);
    } catch (error) {
      console.error("Error loading checkout data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const shipping = 99;
  const total = cart.totalAmount + shipping;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please add a shipping address first.");
      return;
    }
    setPlacing(true);
    try {
      await api.placeOrder(selectedAddress.id, paymentMethod);
      Alert.alert("Success", "Order placed successfully!", [
        { text: "OK", onPress: () => router.replace("/") }
      ]);
    } catch (error: any) {
      Alert.alert("Error", api.getErrorMessage(error, "Failed to place order."));
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Shipping Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <TouchableOpacity onPress={() => router.push("/address")}>
              <Text style={styles.editLink}>Change</Text>
            </TouchableOpacity>
          </View>
          {selectedAddress ? (
            <View style={styles.addressCard}>
              <View style={styles.addressIcon}>
                <Ionicons name="location" size={24} color={Colors.primary} />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>{selectedAddress.fullName}</Text>
                <Text style={styles.addressText}>
                  {selectedAddress.addressLine1}
                  {selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ""}
                  {`, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.postalCode}`}
                </Text>
                <Text style={styles.addressPhone}>{selectedAddress.phone}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.addressCard}>
              <View style={styles.addressIcon}>
                <Ionicons name="location-outline" size={24} color={Colors.textSecondary} />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>No address saved</Text>
                <Text style={styles.addressText}>Please add a shipping address from your profile.</Text>
              </View>
            </View>
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            {[
              { id: "card", label: "Credit / Debit Card", icon: "card-outline" },
              { id: "upi", label: "UPI (Google Pay/PhonePe)", icon: "qr-code-outline" },
              { id: "cod", label: "Cash on Delivery", icon: "cash-outline" },
            ].map((option) => (
              <TouchableOpacity 
                key={option.id}
                style={[styles.paymentOption, paymentMethod === option.id && styles.paymentOptionSelected]}
                onPress={() => setPaymentMethod(option.id)}
              >
                <View style={styles.optionLeft}>
                  <Ionicons 
                    name={option.icon as any} 
                    size={24} 
                    color={paymentMethod === option.id ? Colors.primary : Colors.textSecondary} 
                  />
                  <Text style={[styles.optionLabel, paymentMethod === option.id && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                </View>
                <View style={[styles.radio, paymentMethod === option.id && styles.radioSelected]}>
                  {paymentMethod === option.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({cart.items.length})</Text>
              <Text style={styles.summaryValue}>₹{cart.totalAmount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping Fee</Text>
              <Text style={styles.summaryValue}>₹{shipping}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={[styles.placeOrderButton, placing && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          disabled={placing}
        >
          {placing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.placeOrderText}>Place Order • ₹{total}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CheckoutScreen;

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
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  editLink: {
    color: Colors.primary,
    fontWeight: "600",
  },
  addressCard: {
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.backgroundBottom,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  addressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 8,
    fontWeight: "500",
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundBottom,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  optionLabelSelected: {
    color: Colors.textPrimary,
    fontWeight: "bold",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  summaryCard: {
    backgroundColor: Colors.cardBackground,
    padding: 20,
    borderRadius: 24,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  placeOrderButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  placeOrderText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
