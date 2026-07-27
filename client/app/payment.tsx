import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SavedCard {
  id: string;
  number: string;
  expiry: string;
  primary: boolean;
}

const PaymentScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    { id: "1", number: "•••• •••• •••• 4829", expiry: "12/28", primary: true },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");

  const handleAddCard = () => {
    if (!cardNumber.trim() || !expiry.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const cleaned = cardNumber.replace(/\s?/g, "");
    if (cleaned.length < 4) {
      Alert.alert("Error", "Invalid card number");
      return;
    }
    const last4 = cleaned.slice(-4);
    const maskedNumber = `•••• •••• •••• ${last4}`;

    const newCard: SavedCard = {
      id: Date.now().toString(),
      number: maskedNumber,
      expiry: expiry.trim(),
      primary: savedCards.length === 0,
    };

    setSavedCards([...savedCards, newCard]);
    setCardNumber("");
    setExpiry("");
    setModalVisible(false);
    Alert.alert("Success", "New card added successfully!");
  };

  const handleMakePrimary = (id: string) => {
    setSavedCards(prev =>
      prev.map(card => ({
        ...card,
        primary: card.id === id,
      }))
    );
  };

  const handleDeleteCard = (id: string) => {
    Alert.alert("Delete Card", "Are you sure you want to delete this payment method?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const filtered = savedCards.filter(card => card.id !== id);
          if (filtered.length > 0 && !filtered.some(c => c.primary)) {
            filtered[0].primary = true;
          }
          setSavedCards(filtered);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Saved Cards */}
        <Text style={styles.sectionTitle}>Saved Cards</Text>
        
        {savedCards.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="card-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No saved cards found</Text>
          </View>
        ) : (
          savedCards.map(card => (
            <TouchableOpacity 
              key={card.id} 
              style={[styles.card, card.primary && styles.cardActive]}
              onPress={() => handleMakePrimary(card.id)}
            >
              <View style={styles.cardRow}>
                <Ionicons name="card" size={32} color={card.primary ? Colors.primary : Colors.textSecondary} />
                <View style={styles.cardDetails}>
                  <Text style={styles.cardNumber}>{card.number}</Text>
                  <Text style={styles.cardExpiry}>Expires {card.expiry}</Text>
                </View>
                {card.primary ? (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Primary</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => handleDeleteCard(card.id)}>
                    <Ionicons name="trash-outline" size={20} color="#FF4444" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Other Options */}
        <Text style={styles.sectionTitle}>Other Methods</Text>
        
        <View style={styles.methodList}>
          {[
            { name: "Google Pay / PhonePe (UPI)", icon: "qr-code-outline" },
            { name: "Cash on Delivery", icon: "cash-outline" }
          ].map((item, index) => (
            <View key={index} style={styles.methodItem}>
              <View style={styles.methodLeft}>
                <View style={styles.iconWrapper}>
                  <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
                </View>
                <Text style={styles.methodName}>{item.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Payment Method</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Card Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="1234 5678 1234 5678"
                keyboardType="numeric"
                maxLength={19}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <Text style={styles.label}>Expiry Date</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={expiry}
                onChangeText={setExpiry}
                placeholder="MM/YY"
                maxLength={5}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleAddCard}>
              <Text style={styles.saveButtonText}>Save Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PaymentScreen;

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
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  cardActive: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDetails: {
    flex: 1,
    marginLeft: 16,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  cardExpiry: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  primaryBadge: {
    backgroundColor: Colors.primary + "1A", // 10% opacity
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  primaryBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "bold",
  },
  emptyCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 30,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  methodList: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 40,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  methodLeft: {
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
  methodName: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
    marginBottom: -8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundBottom,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
