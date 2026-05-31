import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HelpScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const faqs = [
    {
      q: "How long does shipping take?",
      a: "Standard shipping takes 3-5 business days across India. Express shipping options are available at checkout."
    },
    {
      q: "Are the supplements authentic?",
      a: "Yes, 100%! All our protein, creatine, and pre-workouts are directly sourced from authorized brand importers with verified holograms and batch certificates."
    },
    {
      q: "What is your return policy?",
      a: "We offer a 7-day return policy on unopened, sealed products if you receive a damaged or incorrect package."
    }
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Contact Info */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactCard}>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={24} color={Colors.primary} />
            <View>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>support@theproteinstore.com</Text>
            </View>
          </View>
          <View style={styles.contactDivider} />
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={24} color={Colors.primary} />
            <View>
              <Text style={styles.contactLabel}>Toll Free Number</Text>
              <Text style={styles.contactValue}>1800-123-FITNESS</Text>
            </View>
          </View>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HelpScreen;

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
  contactCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 30,
    gap: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  contactLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  contactDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  faqList: {
    gap: 16,
  },
  faqItem: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
});
