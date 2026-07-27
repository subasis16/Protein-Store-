import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  Dimensions,
  ActivityIndicator,
  Alert
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

const { width } = Dimensions.get("window");

const AuthScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    setErrorMessage("");
    if (!email || !password || (!isLogin && !name)) {
      const msg = "Please fill in all required fields.";
      setErrorMessage(msg);
      Alert.alert("Required Fields", msg);
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        const data = await api.login(email, password);
        await login(data.user, data.token);
      } else {
        const data = await api.register(name, email, password);
        await login(data.user, data.token);
      }
    } catch (error: any) {
      console.error(error);
      const userMsg = isLogin 
        ? "Invalid email or password. Please check your credentials and try again."
        : api.getErrorMessage(error, "Registration failed. Please try again.");
      setErrorMessage(userMsg);
      Alert.alert("Authentication Failed", userMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + 40 }]}>
          <Text style={styles.title}>{isLogin ? "Welcome Back!" : "Create Account"}</Text>
          <Text style={styles.subtitle}>
            {isLogin 
              ? "Login to continue your fitness journey" 
              : "Sign up to start shopping for the best supplements"}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {!!errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
              <Text style={styles.errorBoxText}>{errorMessage}</Text>
            </View>
          )}

          {!isLogin && (
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput 
                placeholder="Full Name" 
                placeholderTextColor={Colors.textSecondary}
                style={styles.input}
                value={name}
                onChangeText={(text) => { setName(text); setErrorMessage(""); }}
              />
            </View>
          )}

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput 
              placeholder="Email Address" 
              placeholderTextColor={Colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              value={email}
              onChangeText={(text) => { setEmail(text); setErrorMessage(""); }}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput 
              placeholder="Password" 
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={(text) => { setPassword(text); setErrorMessage(""); }}
            />
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword} onPress={() => Alert.alert("Coming Soon", "Password reset will be available in a future update.")}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>{isLogin ? "Login" : "Sign Up"}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setErrorMessage(""); }}>
              <Text style={styles.toggleLink}>{isLogin ? "Sign Up" : "Login"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundBottom,
  },
  header: {
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 22,
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorBoxText: {
    flex: 1,
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
  },
  toggleText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  toggleLink: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
});
