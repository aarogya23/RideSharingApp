import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import { router, Stack } from "expo-router";


import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const [emergencyVisible, setEmergencyVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const slideAnim = useRef(new Animated.Value(-250)).current;

  const toggleStatus = () => setIsOnline(!isOnline);

  useEffect(() => {
    if (isOnline) fetchRides();
  }, [isOnline]);

  const fetchRides = async () => {
    try {
      const response = await axios.get("http://localhost:8084/api/ride/all");
      setRides(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Error fetching rides:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sidebar
  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };
  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -250,
      duration: 250,
      useNativeDriver: false,
    }).start(() => setSidebarOpen(false));
  };

  // Emergency options
  const emergencyOptions = [
    { name: "Nearest Hospital", keyword: "hospital", icon: "medkit-outline" },
    { name: "Nearest Bike/Car Repair", keyword: "mechanic", icon: "car-outline" },
    { name: "Call Police (100)", type: "phone", phone: "100", icon: "call-outline" },
    { name: "Call Ambulance (102)", type: "phone", phone: "102", icon: "medical-outline" },
  ];

  const openEmergencyScreen = async () => {
    setEmergencyVisible(true);
    setLoadingLocation(true);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission required to access location");
      setLoadingLocation(false);
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
    setLoadingLocation(false);
  };

  const openMaps = (keyword) => {
    if (!location) {
      alert("Location not available yet!");
      return;
    }

    const url = `https://www.google.com/maps/search/${keyword}/@${location.latitude},${location.longitude},14z`;
    Linking.openURL(url);
  };

  const callNumber = (phone) => Linking.openURL(`tel:${phone}`);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={openSidebar}>
          <Ionicons name="menu" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerText}>Dashboard</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* ONLINE/OFFLINE STATUS */}
      <Pressable
        onPress={toggleStatus}
        style={[
          styles.statusBtn,
          { backgroundColor: isOnline ? "#16a34a" : "#dc2626" },
        ]}
      >
        <Text style={styles.statusBtnText}>{isOnline ? "ONLINE" : "OFFLINE"}</Text>
      </Pressable>
  {/* RIDES */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {isOnline ? (
          loading ? (
            <Text>Loading rides...</Text>
          ) : rides.length === 0 ? (
            <Text>No rides found</Text>
          ) : (
            rides.map((ride, i) => (
              <View key={i} style={styles.card}>
                <View>
                  <Text style={styles.title}>{ride.userName}</Text>
                  <Text>Destination: {ride.destinationName}</Text>
                  <Text>Distance: {ride.distanceKm} km</Text>
                  <Text>Price: Rs {ride.price}</Text>
                </View>

                {/* 👉 GO TO MAP */}
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/DriverRideMap",
                      params: {
                        userLat: ride.userLat,
                        userLon: ride.userLon,
                        destLat: ride.destLat,
                        destLon: ride.destLon,
                        userName: ride.userName,
                        destinationName: ride.destinationName,
                        distanceKm: ride.distanceKm,
                        price: ride.price,
                      },
                    })
                  }
                >
                  <Ionicons name="chevron-forward" size={24} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ))
          )
        ) : (
          <Text style={styles.offlineText}>
            Go online to see ride requests
          </Text>
        )}
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={22} color="#16a34a" />
          <Text style={styles.navActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="heart-outline" size={22} color="#6b7280" />
          <Text style={styles.nav}>Favourite</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.centerIcon}>
          <Ionicons name="wallet-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={openEmergencyScreen}>
          <Ionicons name="alert-circle-outline" size={24} color="red" />
          <Text style={[styles.nav, { color: "red", fontWeight: "700" }]}>
            Emergency
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={22} color="#6b7280" />
          <Text style={styles.nav}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* OVERLAY */}
      {sidebarOpen && <Pressable style={styles.overlay} onPress={closeSidebar} />}

      {/* SIDEBAR */}
      <Animated.View style={[styles.sidebar, { left: slideAnim }]}>
        <Text style={styles.sidebarTitle}>Menu</Text>
        <TouchableOpacity style={styles.sidebarItem}>
          <Ionicons name="home-outline" size={22} />
          <Text style={styles.sidebarText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem}>
          <Ionicons name="car-outline" size={22} />
          <Text style={styles.sidebarText}>My Rides</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem}>
          <Ionicons name="wallet-outline" size={22} />
          <Text style={styles.sidebarText}>Earnings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem}>
          <Ionicons name="person-outline" size={22} />
          <TouchableOpacity
  style={styles.sidebarItem}
  onPress={() => {
    closeSidebar();
    router.push("/Profilepage");
  }}
>

  <Text style={styles.sidebarText}>Profile</Text>
</TouchableOpacity>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={async () => {
            try {
              await AsyncStorage.removeItem("driver"); // Clear saved login
              router.replace("/login"); // Navigate to login page
            } catch (err) {
              console.log("Logout error:", err);
            }
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="red" />
          <Text style={[styles.sidebarText, { color: "red" }]}>Logout</Text>
        </TouchableOpacity>

      </Animated.View>

      {/* EMERGENCY MODAL */}
      <Modal visible={emergencyVisible} transparent animationType="slide">
        <View style={styles.emergencyContainer}>
          <View style={styles.emergencyBox}>
            <Text style={styles.emergencyTitle}>🚨 Emergency Help</Text>

            {loadingLocation ? (
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                Getting your location...
              </Text>
            ) : (
              emergencyOptions.map((option, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.emergencyItem}
                  onPress={() =>
                    option.type === "phone"
                      ? callNumber(option.phone)
                      : openMaps(option.keyword)
                  }
                >
                  <Ionicons name={option.icon} size={24} color="#dc2626" />
                  <Text style={styles.emergencyText}>{option.name}</Text>
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setEmergencyVisible(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    elevation: 3,
  },
  menuBtn: { width: 35, height: 35, backgroundColor: "#d1fae5", justifyContent: "center", alignItems: "center", borderRadius: 6 },
  headerText: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "600" },
  statusBtn: { alignSelf: "center", marginTop: 15, paddingVertical: 10, paddingHorizontal: 40, borderRadius: 30, elevation: 2 },
  statusBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  scrollArea: { padding: 20, paddingBottom: 120 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12, color: "#111827" },
  offlineText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#6b7280" },
  card: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  cardSubtitle: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 8, backgroundColor: "#ffffff", position: "absolute", bottom: 0, width: "100%", elevation: 15, borderTopWidth: 0.3, borderColor: "#e5e7eb" },
  navItem: { alignItems: "center" },
  nav: { fontSize: 11, color: "#6b7280", textAlign: "center", marginTop: 2 },
  navActive: { fontSize: 11, color: "#16a34a", fontWeight: "bold", textAlign: "center", marginTop: 2 },
  centerIcon: { backgroundColor: "#10b981", width: 55, height: 55, borderRadius: 27.5, justifyContent: "center", alignItems: "center", marginTop: -25, elevation: 10 },
  sidebar: { position: "absolute", top: 0, bottom: 0, width: 250, backgroundColor: "#fff", paddingTop: 60, paddingHorizontal: 20, elevation: 30, zIndex: 999 },
  sidebarTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  sidebarItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  sidebarText: { fontSize: 16, color: "#111" },
  overlay: { position: "absolute", top: 0, bottom: 0, right: 0, left: 0, backgroundColor: "#00000060", zIndex: 998 },
  emergencyContainer: { flex: 1, backgroundColor: "#00000080", justifyContent: "center", alignItems: "center" },
  emergencyBox: { width: "85%", backgroundColor: "#fff", padding: 25, borderRadius: 16 },
  emergencyTitle: { fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  emergencyItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 15, borderBottomWidth: 0.4, borderColor: "#ccc" },
  emergencyText: { fontSize: 16, fontWeight: "600" },
  closeBtn: { marginTop: 20, backgroundColor: "#dc2626", paddingVertical: 10, borderRadius: 8 },
  closeBtnText: { color: "#fff", textAlign: "center", fontWeight: "700", fontSize: 15 },
});
