import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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

  const slideAnim = useRef(new Animated.Value(-250)).current;

  const toggleStatus = () => setIsOnline(!isOnline);

  // 🔥 FETCH DATA FROM BACKEND
  useEffect(() => {
    if (isOnline) {
      fetchRides();
    }
  }, [isOnline]);

  const fetchRides = async () => {
    try {
      const response = await axios.get("http://localhost:8084/api/ride/all");
      if (Array.isArray(response.data)) {
        setRides(response.data);
      } else {
        setRides([]);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // OPEN SIDEBAR
  const openSidebar = () => {
    setSidebarOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  // CLOSE SIDEBAR
  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: -250,
      duration: 250,
      useNativeDriver: false,
    }).start(() => setSidebarOpen(false));
  };

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

      {/* ONLINE / OFFLINE BUTTON */}
      <Pressable
        onPress={toggleStatus}
        android_ripple={{ color: "#ffffff40" }}
        style={[
          styles.statusBtn,
          { backgroundColor: isOnline ? "#16a34a" : "#dc2626" },
        ]}
      >
        <Text style={styles.statusBtnText}>
          {isOnline ? "ONLINE" : "OFFLINE"}
        </Text>
      </Pressable>

      {/* RIDE LIST */}
      <ScrollView contentContainerStyle={styles.scrollArea}>
        {isOnline ? (
          <>
            <Text style={styles.sectionTitle}>Recent Rides</Text>

            {loading ? (
              <Text>Loading rides...</Text>
            ) : rides.length === 0 ? (
              <Text>No rides found</Text>
            ) : (
              rides.map((ride, i) => (
                <View key={i} style={styles.card}>
                  <View style={styles.cardLeft}>
                    <Ionicons name="location-sharp" size={22} color="#374151" />
                    <View>
                      <Text style={styles.cardTitle}>
                        Destination: {ride.destinationName}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        Vehicle: {ride.vehicleType}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        Distance: {ride.distanceKm} km
                      </Text>
                      <Text style={styles.cardSubtitle}>Price: Rs {ride.price}</Text>
                    </View>
                  </View>

                  <TouchableOpacity>
                    <Ionicons name="chevron-forward" size={22} color="#d00000" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        ) : (
          <Text style={styles.offlineText}>
            You are offline. Switch online to see ride requests.
          </Text>
        )}
      </ScrollView>

      {/* BOTTOM NAV */}
<View style={styles.bottomNav}>
  {/* Home */}
  <TouchableOpacity style={styles.navItem}>
    <Ionicons name="home-outline" size={22} color="#16a34a" />
    <Text style={styles.navActive}>Home</Text>
  </TouchableOpacity>

  {/* Favourite */}
  <TouchableOpacity style={styles.navItem}>
    <Ionicons name="heart-outline" size={22} color="#6b7280" />
    <Text style={styles.nav}>Favourite</Text>
  </TouchableOpacity>

  {/* Center wallet button */}
  <TouchableOpacity style={styles.centerIcon}>
    <Ionicons name="wallet-outline" size={28} color="#fff" />
  </TouchableOpacity>

  {/* Offer */}
  <TouchableOpacity style={styles.navItem}>
    <Ionicons name="pricetag-outline" size={22} color="#6b7280" />
    <Text style={styles.nav}>Offer</Text>
  </TouchableOpacity>

  {/* Profile */}
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
          <Text style={styles.sidebarText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem}>
          <Ionicons name="log-out-outline" size={22} />
          <Text style={[styles.sidebarText, { color: "red" }]}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
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
  menuBtn: {
    width: 35,
    height: 35,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },

  statusBtn: {
    alignSelf: "center",
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 2,
  },
  statusBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  scrollArea: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  offlineText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#6b7280",
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
bottomNav: {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  paddingVertical: 8,
  backgroundColor: "#ffffff",
  position: "absolute",
  bottom: 0,
  width: "100%",
  elevation: 15,
  borderTopWidth: 0.3,
  borderColor: "#e5e7eb",
},

navItem: {
  alignItems: "center",
},

nav: {
  fontSize: 11,
  color: "#6b7280",
  textAlign: "center",
  marginTop: 2,
},

navActive: {
  fontSize: 11,
  color: "#16a34a",
  fontWeight: "bold",
  textAlign: "center",
  marginTop: 2,
},

centerIcon: {
  backgroundColor: "#10b981",
  width: 55,
  height: 55,
  borderRadius: 27.5,
  justifyContent: "center",
  alignItems: "center",
  marginTop: -25,
  elevation: 10,
},

  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
    elevation: 30,
    zIndex: 999,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  sidebarText: {
    fontSize: 16,
    color: "#111",
  },

  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "#00000060",
    zIndex: 998,
  },
});
