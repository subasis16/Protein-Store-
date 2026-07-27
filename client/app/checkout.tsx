import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/services/api";
import { useAuth } from "../context/AuthContext";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web') {
      resolve(true);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.getElementById('razorpay-checkout-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
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
      if (Platform.OS === 'web') {
        loadRazorpayScript();
      }
    }, [fetchData])
  );

  const shipping = 99;
  const total = cart.totalAmount + shipping;

  const handlePlaceOrder = async () => {
    if (!cart.items || cart.items.length === 0) {
      Alert.alert("Cart Empty", "Your cart is empty. Redirecting to home page.");
      router.replace("/(tabs)");
      return;
    }

    let activeAddress = selectedAddress;

    // If no address exists, automatically create a default shipping address
    if (!activeAddress) {
      try {
        setPlacing(true);
        await api.addAddress({
          fullName: user?.name || "Customer User",
          phone: "9876543210",
          addressLine1: "123 Fitness Street, Suite 4B",
          addressLine2: "Main City",
          city: "Bhubaneswar",
          state: "Odisha",
          postalCode: "751024",
          isDefault: true
        });
        const updatedAddresses = await api.getAddresses();
        if (updatedAddresses && updatedAddresses.length > 0) {
          activeAddress = updatedAddresses[0];
          setSelectedAddress(activeAddress);
        }
      } catch (err) {
        console.error("Auto address creation error", err);
      } finally {
        setPlacing(false);
      }
    }

    if (!activeAddress) {
      Alert.alert("Shipping Address Required", "Please tap 'Add Address' to set your delivery address.");
      router.push("/address");
      return;
    }

    setPlacing(true);
    try {
      const responseStr = await api.placeOrder(activeAddress.id, paymentMethod);
      console.log("placeOrder response raw:", responseStr);

      let status = "";
      let orderId: number | null = null;

      if (typeof responseStr === 'string' && responseStr.includes(':')) {
        const parts = responseStr.split(':');
        status = parts[0];
        orderId = parseInt(parts[1], 10);
      } else if (typeof responseStr === 'object' && responseStr !== null) {
        status = responseStr.status || "ONLINE_PENDING";
        orderId = responseStr.orderId || responseStr.id;
      }

      if (!orderId || isNaN(orderId)) {
        setPlacing(false);
        Alert.alert("Order Failed", "Could not retrieve order ID from backend response: " + JSON.stringify(responseStr));
        return;
      }

      if (status === "COD_SUCCESS") {
        setPlacing(false);
        Alert.alert("Success 🎉", "Order placed successfully!");
        router.replace("/(tabs)");
        return;
      }

      // Online payment (Razorpay)
      if (Platform.OS === 'web') {
        let RazorpaySDK = (window as any).Razorpay;
        if (!RazorpaySDK) {
          await loadRazorpayScript();
          RazorpaySDK = (window as any).Razorpay;
        }

        if (!RazorpaySDK) {
          setPlacing(false);
          Alert.alert("Razorpay Error", "Could not load Razorpay SDK. Please check your internet connection.");
          return;
        }

        console.log("Calling createPaymentOrder for orderId:", orderId);
        const paymentOrderStr = await api.createPaymentOrder(orderId);
        console.log("createPaymentOrder raw response:", paymentOrderStr);

        let paymentOrder: any = paymentOrderStr;
        if (typeof paymentOrderStr === 'string') {
          try {
            paymentOrder = JSON.parse(paymentOrderStr);
          } catch (e) {
            console.error("JSON parse error on paymentOrderStr", e);
          }
        }

        const razorpayOrderId = paymentOrder?.id || paymentOrder?.razorpayOrderId;
        const razorpayAmount = paymentOrder?.amount || (total * 100);

        if (!razorpayOrderId) {
          setPlacing(false);
          Alert.alert("Payment Error", "Failed to get Razorpay order ID from server.");
          return;
        }

        const options: any = {
          key: "rzp_test_StulYe4XAI4yPr",
          amount: Number(razorpayAmount),
          currency: String(paymentOrder?.currency || "INR"),
          name: "The Protein Store",
          description: "Payment for order #" + orderId,
          order_id: razorpayOrderId,
          handler: async function (response: any) {
            try {
              setPlacing(true);
              await api.verifyPayment({
                razorpayOrderId: razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              setPlacing(false);
              Alert.alert("Success 🎉", "Payment successful! Order placed.");
              router.replace("/(tabs)");
            } catch (err: any) {
              setPlacing(false);
              Alert.alert("Error", api.getErrorMessage(err, "Payment verification failed."));
            }
          },
          prefill: {
            email: user?.email || "",
            name: user?.name || "",
          },
          theme: {
            color: Colors.primary,
          },
          modal: {
            ondismiss: function () {
              setPlacing(false);
            }
          }
        };

        try {
          console.log("Opening Razorpay popup with options:", options);
          const rzp = new RazorpaySDK(options);
          rzp.on('payment.failed', function (resp: any) {
            setPlacing(false);
            Alert.alert("Payment Failed", resp.error?.description || "Payment failed. Please try again.");
          });
          setPlacing(false);
          rzp.open();
        } catch (openErr: any) {
          setPlacing(false);
          console.error("Razorpay open error", openErr);
          Alert.alert("Payment Error", openErr?.message || "Could not open Razorpay checkout modal.");
        }
      } else {
        // Mobile / Expo Go simulation
        setPlacing(false);
        Alert.alert(
          "Razorpay Payment Gateway",
          "Simulating Razorpay payment flow on mobile...",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setPlacing(false)
            },
            {
              text: "Pay & Complete",
              onPress: async () => {
                try {
                  setPlacing(true);
                  const paymentOrderStr = await api.createPaymentOrder(orderId);
                  let paymentOrder: any = paymentOrderStr;
                  if (typeof paymentOrderStr === 'string') {
                    try { paymentOrder = JSON.parse(paymentOrderStr); } catch (e) {}
                  }

                  await api.verifyPayment({
                    razorpayOrderId: paymentOrder?.id || ("order_mock_" + Date.now()),
                    razorpayPaymentId: "pay_mock_" + Date.now(),
                    razorpaySignature: "mock_signature",
                  });
                  setPlacing(false);
                  Alert.alert("Success 🎉", "Payment successful! Order placed.");
                  router.replace("/(tabs)");
                } catch (err: any) {
                  setPlacing(false);
                  Alert.alert("Error", api.getErrorMessage(err, "Mock payment verification failed."));
                }
              }
            }
          ]
        );
      }
    } catch (error: any) {
      setPlacing(false);
      Alert.alert("Order Error", api.getErrorMessage(error, "Failed to place order."));
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
            <TouchableOpacity style={styles.addressCard} onPress={() => router.push("/address")}>
              <View style={styles.addressIcon}>
                <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>+ Add Shipping Address</Text>
                <Text style={styles.addressText}>Tap here to set your delivery address.</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            {[
              { id: "razorpay", label: "Razorpay (Card / UPI / Netbanking)", icon: "card-outline" },
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
    flex: 1,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
    flex: 1,
    flexShrink: 1,
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
