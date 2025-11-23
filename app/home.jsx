import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Stack } from "expo-router";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("Transport");
  const [rentalInput, setRentalInput] = useState("");

  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  const isWeb = Platform.OS === "web";

  // ================== GET USER GPS LOCATION (WEB) ==================
  useEffect(() => {
    if (!isWeb) return;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Location permission denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync();
      setUserLocation([loc.coords.latitude, loc.coords.longitude]);
    })();
  }, []);

  // =========== SEARCH DESTINATION & DRAW ROUTE (WEB) ===========
  const handleSearchDestination = async () => {
    if (!rentalInput || !userLocation) return;

    try {
      // Geocoding API → convert text to lat/lon
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${rentalInput}`
      );
      const geoData = await geoRes.json();
      if (geoData.length === 0) {
        alert("Destination not found");
        return;
      }

      const destLat = geoData[0].lat;
      const destLon = geoData[0].lon;

      // OSRM Route API
      const routeRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${destLon},${destLat}?overview=full&geometries=geojson`
      );
      const routeData = await routeRes.json();

      const coords = routeData.routes[0].geometry.coordinates.map((c) => [
        c[1],
        c[0],
      ]);

      setRouteCoords(coords);
    } catch (error) {
      console.log(error);
      alert("Something went wrong.");
    }
  };

  // ====================== LEAFLET MAP FOR WEB ======================
  let WebMap = null;

  if (isWeb) {
    const {
      MapContainer,
      TileLayer,
      Marker,
      Popup,
      Polyline,
    } = require("react-leaflet");

    WebMap = (
      <View style={styles.webMap}>
        <MapContainer
          center={userLocation || [27.7172, 85.324]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* User Location Marker */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Route Polyline */}
          {routeCoords.length > 0 && <Polyline positions={routeCoords} />}
        </MapContainer>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* FULL SCREEN MAP (WEB) */}
      {isWeb && WebMap}

      {/* FULL SCREEN BACKGROUND IMAGE FOR MOBILE */}
      {!isWeb && (
        <ImageBackground
          source={require("@/assets/images/map.png")}
          style={styles.nativeMap}
          resizeMode="cover"
        />
      )}

      {/* =================== UI OVERLAY =================== */}

      {/* Top Buttons */}
      <View style={styles.topRow}>
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="menu" size={22} color="#0A8F5B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color="#0A8F5B" />
        </TouchableOpacity>
      </View>

      {/* Radar Only On Native */}
      {!isWeb && (
        <View style={styles.radarContainer}>
          <View style={styles.outerCircle}>
            <View style={styles.middleCircle}>
              <View style={styles.innerCircle}>
                <Ionicons name="location" size={22} color="white" />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Destination Search Input */}
      <View style={styles.rentalInputContainer}>
        <TextInput
          style={styles.rentalInput}
          placeholder="Enter your destination..."
          placeholderTextColor="#555"
          value={rentalInput}
          onChangeText={setRentalInput}
          onSubmitEditing={handleSearchDestination}
        />
      </View>

      {/* Search Card */}
      <View style={styles.searchCard}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#7E7E7E" />
          <TextInput
            placeholder="Where would you go?"
            style={styles.searchInput}
            value={rentalInput}
            onChangeText={setRentalInput}
            onSubmitEditing={handleSearchDestination}
          />
          <Ionicons name="heart-outline" size={20} color="#7E7E7E" />
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === "Transport" && styles.activeToggle]}
            onPress={() => setActiveTab("Transport")}
          >
            <Text
              style={[styles.toggleText, activeTab === "Transport" && styles.activeText]}
            >
              Transport
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === "Delivery" && styles.activeToggle]}
            onPress={() => setActiveTab("Delivery")}
          >
            <Text
              style={[styles.toggleText, activeTab === "Delivery" && styles.activeText]}
            >
              Delivery
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#0A8F5B" />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="heart-outline" size={24} color="#555" />
          <Text style={styles.navText}>Favourite</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.walletIconContainer}>
          <Ionicons name="wallet" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="gift-outline" size={24} color="#555" />
          <Text style={styles.navText}>Offer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#555" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3FDF8",
  },

  /* MAP */
  webMap: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    zIndex: 0,
  },
  nativeMap: {
    position: "absolute",
    height: "100%",
    width: "100%",
  },

  /* TOP ICONS */
  topRow: {
    position: "absolute",
    top: 45,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  menuBtn: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  bellBtn: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },

  /* RADAR (Native Only) */
  radarContainer: {
    position: "absolute",
    top: "28%",
    alignSelf: "center",
    zIndex: 5,
  },
  outerCircle: {
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: "rgba(10,143,91,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  middleCircle: {
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: "rgba(10,143,91,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 55,
    height: 55,
    borderRadius: 100,
    backgroundColor: "#0A8F5B",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },

  /* DESTINATION INPUT */
  rentalInputContainer: {
    position: "absolute",
    top: 240,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#0A8F5B",
    paddingVertical: 2,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  rentalInput: {
    padding: 12,
    fontSize: 16,
    color: "#000",
  },

  /* SEARCH CARD */
  searchCard: {
    position: "absolute",
    top: 315,
    left: 20,
    right: 20,
    backgroundColor: "#E7F8F0",
    padding: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3FDF8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#000",
  },

  /* TOGGLE BUTTONS */
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#CDEFE0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  toggleText: {
    color: "#0A8F5B",
    fontSize: 15,
    fontWeight: "600",
  },
  activeToggle: {
    backgroundColor: "#0A8F5B",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  activeText: {
    color: "white",
  },

  /* BOTTOM NAVIGATION */
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#DCEEE5",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 20,
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },
  navTextActive: {
    fontSize: 12,
    color: "#0A8F5B",
    fontWeight: "700",
    marginTop: 3,
  },

  /* WALLET BUTTON */
  walletIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "#0A8F5B",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -35,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
});

