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
  const [routeDistance, setRouteDistance] = useState(null);

  // 🔥 NEW: Show drivers only after search
  const [showDrivers, setShowDrivers] = useState(false);

  const isWeb = Platform.OS === "web";

  // -------------- DRIVER LIST -----------------
  const drivers = [
    { id: 1, lat: 27.7172, lon: 85.324 },
    { id: 2, lat: 27.7200, lon: 85.330 },
    { id: 3, lat: 27.7150, lon: 85.322 },
    { id: 4, lat: 27.7250, lon: 85.335 },
    { id: 5, lat: 27.7105, lon: 85.3288 },
  ];

  // =============== GET USER LOCATION ==================
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

  // ================ SEARCH DESTINATION + GET ROUTE ==================
  const handleSearchDestination = async () => {
    if (!rentalInput || !userLocation) return;

    try {
      // GET LAT/LON
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

      // GET ROUTE FROM OSRM
      const routeRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${destLon},${destLat}?overview=full&geometries=geojson`
      );

      const routeData = await routeRes.json();
      const coords = routeData.routes[0].geometry.coordinates.map((c) => [
        c[1],
        c[0],
      ]);

      setRouteCoords(coords);

      const meters = routeData.routes[0].distance;
      const km = (meters / 1000).toFixed(2);
      setRouteDistance(km);

      // 🔥 NEW — ONLY AFTER SEARCH SHOW DRIVERS
      setShowDrivers(true);

    } catch (error) {
      console.log(error);
      alert("Something went wrong.");
    }
  };

  // ====================== LEAFLET MAP (WEB ONLY) ======================
  let WebMap = null;

  if (isWeb) {
    const {
      MapContainer,
      TileLayer,
      Marker,
      Popup,
      Polyline,
    } = require("react-leaflet");

    const L = require("leaflet");
    const driverIcon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
      iconSize: [40, 40],
    });

    WebMap = (
      <View style={styles.webMap}>
        <MapContainer
          center={userLocation || [27.7172, 85.324]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* USER LOCATION */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* 🔥 DRIVER MARKERS ONLY AFTER SEARCH */}
          {showDrivers &&
            drivers.map((d) => (
              <Marker key={d.id} position={[d.lat, d.lon]} icon={driverIcon}>
                <Popup>Driver {d.id}</Popup>
              </Marker>
            ))}

          {/* ROUTE LINE */}
          {routeCoords.length > 0 && <Polyline positions={routeCoords} />}
        </MapContainer>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isWeb && WebMap}

      {!isWeb && (
        <ImageBackground
          source={require("@/assets/images/map.png")}
          style={styles.nativeMap}
          resizeMode="cover"
        />
      )}

      {/* TOP ICONS */}
      <View style={styles.topRow}>
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="menu" size={22} color="#0A8F5B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color="#0A8F5B" />
        </TouchableOpacity>
      </View>

      {/* DISTANCE DISPLAY */}
      {routeDistance && (
        <View style={styles.distanceBox}>
          <Text style={styles.distanceText}>Distance: {routeDistance} km</Text>
        </View>
      )}

      {/* INPUT */}
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

      {/* SEARCH CARD */}
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
            <Text style={[styles.toggleText, activeTab === "Transport" && styles.activeText]}>
              Transport
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === "Delivery" && styles.activeToggle]}
            onPress={() => setActiveTab("Delivery")}
          >
            <Text style={[styles.toggleText, activeTab === "Delivery" && styles.activeText]}>
              Delivery
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BOTTOM NAV */}
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
  container: { flex: 1, backgroundColor: "#F3FDF8" },
  webMap: {
    position: "absolute",
    top: 0, left: 0,
    height: "100%", width: "100%",
    zIndex: 0,
  },
  nativeMap: {
    position: "absolute",
    height: "100%",
    width: "100%",
  },

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

  distanceBox: {
    position: "absolute",
    top: 380,
    left: 20,
    backgroundColor: "#0A8F5B",
    padding: 10,
    borderRadius: 10,
    zIndex: 20,
  },
  distanceText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  rentalInputContainer: {
    position: "absolute",
    top: 420,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 2,
    paddingHorizontal: 10,
    elevation: 5,
    zIndex: 10,
  },
  rentalInput: { padding: 12, fontSize: 16 },

  searchCard: {
    position: "absolute",
    top: 500,
    left: 20,
    right: 20,
    backgroundColor: "#E7F8F0",
    padding: 18,
    borderRadius: 16,
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
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },

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
    marginHorizontal: 5,
  },
  toggleText: { fontSize: 15, fontWeight: "600", color: "#0A8F5B" },
  activeToggle: { backgroundColor: "#0A8F5B" },
  activeText: { color: "white" },

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
    elevation: 12,
  },

  navItem: { alignItems: "center" },
  navText: { fontSize: 12, color: "#777", marginTop: 3 },
  navTextActive: { fontSize: 12, color: "#0A8F5B", marginTop: 3 },

  walletIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "#0A8F5B",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -35,
    elevation: 10,
  },
});
