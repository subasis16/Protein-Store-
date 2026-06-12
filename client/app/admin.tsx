import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, TextInput, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

const { width } = Dimensions.get("window");

const AdminDashboard = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Notification Form State
  const [notiTitle, setNotiTitle] = useState("");
  const [notiMessage, setNotiMessage] = useState("");

  // Product Form State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [pName, setPName] = useState("");
  const [pBrand, setPBrand] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pOrigPrice, setPOrigPrice] = useState("");
  const [pCategory, setPCategory] = useState("Proteins");
  const [pWeight, setPWeight] = useState("2kg");
  const [pImageUrls, setPImageUrls] = useState("");
  const [pStock, setPStock] = useState("100");

  // Role-Based Access Control Check
  if (user?.role !== "ADMIN") {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <Ionicons name="shield-half-outline" size={80} color={Colors.primary} />
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorText}>You must be an administrator to view this page.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data || []);
    } catch (e) { console.log("Error fetching users"); }
    finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data || []);
    } catch (e) { console.log("Error fetching products"); }
    finally { setLoading(false); }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminOrders();
      setOrders(data || []);
    } catch (e) { console.log("Error fetching orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "products") fetchProducts();
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  const handleDeleteUser = async (id: number) => {
    Alert.alert("Confirm", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await api.deleteAdminUser(id);
            Alert.alert("Success", "User deleted successfully");
            fetchUsers();
          } catch (e: any) { Alert.alert("Error", api.getErrorMessage(e, "Failed to delete")); }
        }
      }
    ]);
  };

  const handleDeleteProduct = async (id: string) => {
    Alert.alert("Confirm", "Are you sure you want to delete this product?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await api.deleteAdminProduct(id);
            Alert.alert("Success", "Product deleted successfully");
            fetchProducts();
          } catch (e: any) { Alert.alert("Error", api.getErrorMessage(e, "Failed to delete")); }
        }
      }
    ]);
  };

  const handleAddProduct = async () => {
    if (!pName || !pPrice) {
      Alert.alert("Error", "Name and Price are required.");
      return;
    }
    setLoading(true);
    try {
      const productData = {
        name: pName, brand: pBrand, description: pDesc, category: pCategory, weight: pWeight,
        price: parseFloat(pPrice), originalPrice: parseFloat(pOrigPrice || pPrice),
        stockQuantity: parseInt(pStock || "0"), inStock: parseInt(pStock || "0") > 0,
        flavors: ["Chocolate", "Vanilla"],
        imageUrls: pImageUrls ? pImageUrls.split(',').map(s => s.trim()) : []
      };
      await api.addAdminProduct(productData);
      Alert.alert("Success", "Product added successfully!");
      setShowAddProduct(false);
      fetchProducts();
      setPName(""); setPBrand(""); setPDesc(""); setPPrice(""); setPOrigPrice(""); setPImageUrls("");
    } catch (e: any) {
      Alert.alert("Error", api.getErrorMessage(e, "Failed to add product"));
    } finally {
      setLoading(false);
    }
  };

  const handleReseedProducts = async () => {
    Alert.alert("Warning", "This will delete all current products and replace them with the 8 default products. Continue?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Yes, Replace All", style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await api.reseedProducts();
            Alert.alert("Success", "Products reseeded successfully");
            fetchProducts();
          } catch (e: any) { Alert.alert("Error", api.getErrorMessage(e, "Failed to reseed")); }
          finally { setLoading(false); }
        }
      }
    ]);
  };

  const handleSendNotification = async () => {
    if (!notiTitle.trim() || !notiMessage.trim()) {
      Alert.alert("Error", "Please enter both title and message");
      return;
    }
    setLoading(true);
    try {
      await api.sendNotification(notiTitle, notiMessage, "notifications-outline", "#3B82F6");
      Alert.alert("Success", "Notification sent to all users!");
      setNotiTitle(""); setNotiMessage("");
    } catch (e: any) { Alert.alert("Error", api.getErrorMessage(e, "Failed to send")); } 
    finally { setLoading(false); }
  };

  const adminMenu = [
    { id: "products", icon: "cube-outline", label: "Manage Products", color: "#3B82F6" },
    { id: "users", icon: "people-outline", label: "Manage Users", color: "#10B981" },
    { id: "orders", icon: "cart-outline", label: "All Orders", color: "#F59E0B" },
    { id: "notify", icon: "megaphone-outline", label: "Send Notification", color: "#8B5CF6" },
  ];

  const renderHome = () => (
    <>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Welcome Admin!</Text>
        <Text style={styles.welcomeText}>
          You have full access to manage the store, add products, and handle users.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.gridContainer}>
        {adminMenu.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.gridItem}
            onPress={() => setActiveTab(item.id)}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon as any} size={32} color={item.color} />
            </View>
            <Text style={styles.gridItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderUsers = () => (
    <View style={styles.panelContainer}>
      <Text style={styles.sectionTitle}>Registered Users</Text>
      {loading && !users.length ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        users.map(u => (
          <View key={u.id} style={styles.listCard}>
            <View style={styles.listInfo}>
              <Text style={styles.listTitle}>{u.fullName}</Text>
              <Text style={styles.listSubtitle}>{u.email}</Text>
              <Text style={styles.listBadge}>Role: {u.role}</Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteUser(u.id)}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  const renderProducts = () => (
    <View style={styles.panelContainer}>
      <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginHorizontal: 24, marginBottom: 16}}>
        <Text style={[styles.sectionTitle, {marginHorizontal:0, marginBottom:0}]}>Products</Text>
        <View style={{flexDirection: 'row', gap: 10}}>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddProduct(!showAddProduct)}>
            <Ionicons name={showAddProduct ? "close" : "add"} size={20} color="white" />
            <Text style={{color:'white', fontWeight:'bold'}}>{showAddProduct ? "Cancel" : "Add New"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showAddProduct ? (
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Product Name *</Text>
          <TextInput style={styles.input} value={pName} onChangeText={setPName} placeholder="e.g. Whey Protein" />
          
          <Text style={styles.inputLabel}>Brand</Text>
          <TextInput style={styles.input} value={pBrand} onChangeText={setPBrand} placeholder="e.g. Optimum Nutrition" />

          <View style={{flexDirection:'row', gap:10}}>
            <View style={{flex:1}}>
              <Text style={styles.inputLabel}>Price *</Text>
              <TextInput style={styles.input} value={pPrice} onChangeText={setPPrice} keyboardType="numeric" placeholder="99.99" />
            </View>
            <View style={{flex:1}}>
              <Text style={styles.inputLabel}>Original Price</Text>
              <TextInput style={styles.input} value={pOrigPrice} onChangeText={setPOrigPrice} keyboardType="numeric" placeholder="129.99" />
            </View>
          </View>

          <Text style={styles.inputLabel}>Image URLs (Comma separated)</Text>
          <TextInput style={styles.input} value={pImageUrls} onChangeText={setPImageUrls} placeholder="https://..." />
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleAddProduct} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Save Product</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {loading && !products.length ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            products.map((p, i) => (
              <View key={i} style={styles.listCard}>
                <View style={styles.listInfo}>
                  <Text style={styles.listTitle}>{p.name}</Text>
                  <Text style={styles.listSubtitle}>{p.category} • ${p.price}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteProduct(p.id)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </>
      )}
    </View>
  );

  const renderOrders = () => (
    <View style={styles.panelContainer}>
      <Text style={styles.sectionTitle}>All Orders</Text>
      {loading && !orders.length ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
      ) : orders.length === 0 ? (
        <Text style={{textAlign:'center', marginTop: 20, color: Colors.textSecondary}}>No orders yet.</Text>
      ) : (
        orders.map((o, i) => (
          <View key={i} style={styles.listCard}>
            <View style={styles.listInfo}>
              <Text style={styles.listTitle}>Order #{o.id || o.orderId || Math.floor(Math.random()*1000)}</Text>
              <Text style={styles.listSubtitle}>Total: ${o.totalAmount} • Status: {o.status || 'Pending'}</Text>
              <Text style={{fontSize: 12, color: Colors.textSecondary, marginTop:4}}>{new Date(o.createdAt).toLocaleString()}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderNotify = () => (
    <View style={styles.panelContainer}>
      <Text style={styles.sectionTitle}>Send Push Notification</Text>
      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Notification Title</Text>
        <TextInput style={styles.input} placeholder="e.g. Flash Sale Alert! ⚡" value={notiTitle} onChangeText={setNotiTitle} />
        
        <Text style={styles.inputLabel}>Message</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Enter message..." multiline numberOfLines={4} value={notiMessage} onChangeText={setNotiMessage} />
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleSendNotification} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Broadcast Notification</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => activeTab === "home" ? router.back() : setActiveTab("home")} style={styles.headerBackButton}>
          <Ionicons name={activeTab === "home" ? "arrow-back" : "close"} size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {activeTab === "home" ? "Admin Dashboard" : activeTab === "users" ? "Users" : activeTab === "notify" ? "Notify" : activeTab === "products" ? "Products" : "Orders"}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === "home" && renderHome()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "notify" && renderNotify()}
        {activeTab === "products" && renderProducts()}
        {activeTab === "orders" && renderOrders()}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundBottom },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 20 },
  headerBackButton: { marginRight: 16, padding: 8, backgroundColor: Colors.cardBackground, borderRadius: 12 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: Colors.textPrimary },
  welcomeCard: { backgroundColor: Colors.primary, marginHorizontal: 24, padding: 24, borderRadius: 20, marginBottom: 30 },
  welcomeTitle: { fontSize: 22, fontWeight: "bold", color: "white", marginBottom: 8 },
  welcomeText: { fontSize: 14, color: "rgba(255, 255, 255, 0.8)", lineHeight: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: Colors.textPrimary, marginHorizontal: 24, marginBottom: 16 },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16 },
  gridItem: { width: (width - 48) / 2 - 8, backgroundColor: Colors.cardBackground, margin: 8, padding: 20, borderRadius: 20, alignItems: "center" },
  iconContainer: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  gridItemText: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, textAlign: "center" },
  errorTitle: { fontSize: 24, fontWeight: "bold", color: Colors.textPrimary, marginTop: 20, marginBottom: 8 },
  errorText: { fontSize: 16, color: Colors.textSecondary, textAlign: "center", marginHorizontal: 40, marginBottom: 30 },
  backButton: { backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16 },
  backButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  
  // Panel Styles
  panelContainer: { paddingBottom: 20 },
  listCard: { flexDirection: "row", backgroundColor: Colors.cardBackground, marginHorizontal: 24, marginBottom: 12, padding: 16, borderRadius: 16, alignItems: "center" },
  listInfo: { flex: 1 },
  listTitle: { fontSize: 16, fontWeight: "bold", color: Colors.textPrimary, marginBottom: 4 },
  listSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 4 },
  listBadge: { fontSize: 12, color: Colors.primary, fontWeight: "600" },
  deleteBtn: { padding: 10, backgroundColor: "#EF444420", borderRadius: 10 },
  
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
  formCard: { backgroundColor: Colors.cardBackground, marginHorizontal: 24, padding: 20, borderRadius: 20 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: Colors.textPrimary, marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: Colors.backgroundBottom, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: Colors.textPrimary, marginBottom: 16 },
  textArea: { height: 100, textAlignVertical: "top" },
  primaryButton: { backgroundColor: Colors.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 16, borderRadius: 12, gap: 8, marginTop: 10 },
  primaryButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
