import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
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

  const slideAnim = useRef(new Animated.Value(-250)).current; // sidebar width

  const toggleStatus = () => setIsOnline(!isOnline);

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
      {/* TOP HEADER */}
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

      {/* MAIN SCROLL CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollArea}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>

        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardLeft}>
              <Ionicons name="location-sharp" size={22} color="#374151" />
              <View>
                <Text style={styles.cardTitle}>Ride #{i + 1}</Text>
                <Text style={styles.cardSubtitle}>Location: Kathmandu</Text>
              </View>
            </View>

            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={22} color="#d00000" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="home-outline" size={22} color="#16a34a" />
          <Text style={styles.navActive}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="heart-outline" size={22} color="#6b7280" />
          <Text style={styles.nav}>Favourite</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.centerIcon}>
          <Ionicons name="wallet-outline" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="pricetag-outline" size={22} color="#6b7280" />
          <Text style={styles.nav}>Offer</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="person-outline" size={22} color="#6b7280" />
          <Text style={styles.nav}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* DIM BACKDROP */}
      {sidebarOpen && (
        <Pressable style={styles.overlay} onPress={closeSidebar} />
      )}

      {/* SIDEBAR MENU */}
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

  /* HEADER */
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

  /* ONLINE OFFLINE BUTTON */
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

  /* SCROLL CONTENT */
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

  /* CARD STYLE */
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

  /* BOTTOM NAV */
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    width: "100%",
    elevation: 20,
  },
  nav: { fontSize: 12, color: "#6b7280", textAlign: "center" },
  navActive: {
    fontSize: 12,
    color: "#16a34a",
    textAlign: "center",
    fontWeight: "700",
  },
  centerIcon: {
    backgroundColor: "#10b981",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
    elevation: 6,
  },

  /* SIDEBAR */
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

  /* OVERLAY */
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
