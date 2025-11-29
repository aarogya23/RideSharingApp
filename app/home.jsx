import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Location from "expo-location";
import { Stack } from "expo-router";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

//
// Popup component (kept inside same file for simplicity)
//
const PopupMessage = ({ type = "success", message = "" }) => {
  if (!message) return null;

  return (
    <View
      style={[
        styles.popupContainer,
        type === "error" ? styles.popupError : styles.popupSuccess,
      ]}
    >
      <Text style={styles.popupText}>{message}</Text>
    </View>
  );
};

export default function HomeScreen() {
  // popup state
  const [popup, setPopup] = useState({ visible: false, type: "success", message: "" });

  // helper: show popup and auto-hide after 2.5s
  const showPopup = (type, message) => {
    // show
    setPopup({ visible: true, type, message });

    // hide after 2.5s (clear message too)
    setTimeout(() => {
      setPopup({ visible: false, type: "", message: "" });
    }, 2500);
  };

  // route & UI state
  const [routeData, setRouteData] = useState({
    input: "",
    userLocation: null,
    routeCoords: [],
    routeDistance: 0,
    routePrice: 0,
  });

  const [vehicleType, setVehicleType] = useState("Bike");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [saving, setSaving] = useState(false);

  const priceRates = { Bike: 30, Comfort: 80, Car: 60 };
  const isWeb = Platform.OS === "web";

  const getBaseUrl = () => "http://localhost:8084";

  // GET LOCATION (WEB ONLY)
  useEffect(() => {
    if (!isWeb) return;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const loc = await Location.getCurrentPositionAsync();
        setRouteData((prev) => ({
          ...prev,
          userLocation: [loc.coords.latitude, loc.coords.longitude],
        }));
      } catch (err) {
        console.log("Location error:", err);
      }
    })();
  }, [isWeb]);

  // PRICE RECALCULATE
  useEffect(() => {
    const dist = parseFloat(routeData.routeDistance) || 0;
    const rate = priceRates[vehicleType] || 0;

    setRouteData((prev) => ({
      ...prev,
      routePrice: dist ? parseFloat((dist * rate).toFixed(2)) : 0,
    }));
  }, [vehicleType, routeData.routeDistance]);

  // SEARCH DESTINATION
  const handleSearchDestination = async () => {
    if (!routeData.input.trim()) {
      Alert.alert("Enter destination");
      return;
    }

    if (isWeb && !routeData.userLocation) {
      Alert.alert("Location unavailable", "Try again when location loads.");
      return;
    }

    setLoadingRoute(true);
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          routeData.input
        )}`
      );
      const geo = await geoRes.json();
      if (!geo?.length) {
        Alert.alert("Not found");
        setLoadingRoute(false);
        return;
      }

      const destLat = parseFloat(geo[0].lat);
      const destLon = parseFloat(geo[0].lon);

      if (!routeData.userLocation) {
        Alert.alert(
          "User location missing",
          "App couldn't get your location. Enter manually (dev) or test on web."
        );
        setLoadingRoute(false);
        return;
      }

      const fromLon = routeData.userLocation[1];
      const fromLat = routeData.userLocation[0];

      const url = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${destLon},${destLat}?overview=full&geometries=geojson`;

      const res = await fetch(url);
      const route = await res.json();

      if (!route.routes?.length) {
        Alert.alert("Route not found");
        setLoadingRoute(false);
        return;
      }

      const coords = route.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
      const km = parseFloat((route.routes[0].distance / 1000).toFixed(2));

      setRouteData((prev) => ({
        ...prev,
        routeCoords: coords,
        routeDistance: km,
      }));
    } catch (err) {
      console.log("Error fetching route:", err);
      Alert.alert("Error", "Error fetching route");
    } finally {
      setLoadingRoute(false);
    }
  };

  // BOOK RIDE
  const handleBookRide = async () => {
    if (!routeData.routeDistance || routeData.routeDistance <= 0) {
      Alert.alert("Invalid", "Please search a destination to get distance.");
      return;
    }
    if (!routeData.routePrice || routeData.routePrice <= 0) {
      Alert.alert("Invalid", "Price cannot be 0. Select vehicle or recalc.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        vehicleType,
        distanceKm: routeData.routeDistance,
        price: routeData.routePrice,
        destinationName: routeData.input,
      };

      const res = await axios.post(`${getBaseUrl()}/api/rides/save`, payload);

      showPopup("success", "Ride booked successfully!");
      Alert.alert("Success", res.data?.message || "Ride saved successfully");
    } catch (err) {
      console.log("Save error:", err?.response ?? err);
      const serverMessage = err?.response?.data || "Could not save ride. Try again.";
      showPopup("error", "Could not save ride");
      Alert.alert("Failed", String(serverMessage));
    } finally {
      setSaving(false);
    }
  };

  // WEB MAP (lazy require)
  let WebMap = null;
  if (isWeb) {
    try {
      const { MapContainer, TileLayer, Marker, Popup, Polyline } = require("react-leaflet");

      WebMap = (
        <View style={styles.webMap}>
          <MapContainer
            center={routeData.userLocation || [27.7172, 85.324]}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {routeData.userLocation && (
              <Marker position={routeData.userLocation}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {routeData.routeCoords.length > 0 && <Polyline positions={routeData.routeCoords} />}
          </MapContainer>
        </View>
      );
    } catch (err) {
      console.log("Leaflet error:", err);
      WebMap = null;
    }
  }

  return (
    <View style={styles.container}>
      {/* popup rendered near top so it sits above everything */}
      {popup.visible && <PopupMessage type={popup.type} message={popup.message} />}

      {isWeb && WebMap}
      {!isWeb && (
        <ImageBackground source={require("@/assets/images/map.png")} style={styles.nativeMap} />
      )}

      {/* TOP BAR */}
      <View style={styles.topRow}>
        <Stack.Screen options={{ headerShown: false }} />

        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="menu" size={22} color="#0A8F5B" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color="#0A8F5B" />
        </TouchableOpacity>
      </View>

      {/* INFO */}
      {routeData.routeDistance > 0 && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Distance: {routeData.routeDistance} km</Text>
          <Text style={styles.infoText}>
            Price ({vehicleType}): Rs {routeData.routePrice}
          </Text>
        </View>
      )}

      {/* INPUT ABOVE CARD */}
      <View style={styles.rentalInputContainer}>
        <TextInput
          style={styles.rentalInput}
          placeholder="Enter your destination..."
          value={routeData.input}
          onChangeText={(x) => setRouteData((p) => ({ ...p, input: x }))}
          returnKeyType="search"
          onSubmitEditing={handleSearchDestination}
        />
      </View>

      {/* CARD */}
      <View style={styles.searchCard}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#7E7E7E" />
          <TextInput
            placeholder="Where would you go?"
            style={styles.searchInput}
            value={routeData.input}
            onChangeText={(txt) => setRouteData((prev) => ({ ...prev, input: txt }))}
            returnKeyType="search"
            onSubmitEditing={handleSearchDestination}
          />
          <Ionicons name="heart-outline" size={20} color="#7E7E7E" />
        </View>

        {/* BUTTONS */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearchDestination} disabled={loadingRoute}>
            {loadingRoute ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchBtnText}>Search Route</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: "#0A8F5B", marginLeft: 12 }]}
            onPress={() =>
              setRouteData((prev) => ({
                ...prev,
                routeCoords: [],
                routeDistance: 0,
                routePrice: 0,
              }))
            }
          >
            <Text style={styles.searchBtnText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* VEHICLE */}
        {routeData.routeDistance > 0 && (
          <View style={styles.vehicleRow}>
            {["Bike", "Comfort", "Car"].map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.vehicleBtn, vehicleType === v && styles.vehicleActive]}
                onPress={() => setVehicleType(v)}
              >
                <Ionicons name={v === "Bike" ? "bicycle" : v === "Car" ? "car" : "bus"} size={22} color={vehicleType === v ? "#fff" : "#0A8F5B"} />
                <Text style={[styles.vehicleText, vehicleType === v && styles.vehicleTextActive]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* BOOK */}
        <TouchableOpacity
          style={[styles.bookBtn, routeData.routePrice <= 0 && { opacity: 0.6 }]}
          onPress={handleBookRide}
          disabled={saving || routeData.routePrice <= 0}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.bookText}>Book Ride</Text>}
        </TouchableOpacity>
      </View>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#00996D" />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="heart-outline" size={24} color="#555" />
          <Text style={styles.navText}>Favourite</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navCenter}>
          <View style={styles.centerButton}>
            <Ionicons name="wallet-outline" size={28} color="#fff" />
          </View>
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

/* ===================================
   STYLES (FULL FINAL VERSION)
=================================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3FDF8" },

  // popup
  popupContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 10,
    zIndex: 9999,
    elevation: 9999,
    alignItems: "center",
  },
  popupSuccess: { backgroundColor: "#0A8F5B" },
  popupError: { backgroundColor: "#ff4d4d" },
  popupText: { color: "#fff", fontSize: 15, fontWeight: "600" },

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

  topRow: {
    position: "absolute",
    top: 45,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 5,
  },

  menuBtn: { backgroundColor: "white", padding: 12, borderRadius: 12 },
  bellBtn: { backgroundColor: "white", padding: 12, borderRadius: 12 },

  infoBox: {
    position: "absolute",
    top: 240,
    left: 20,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#0A8F5B",
    zIndex: 5,
  },

  infoText: { color: "white", fontSize: 16, fontWeight: "600" },

  rentalInputContainer: {
    position: "absolute",
    top: 330,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    zIndex: 5,
  },

  rentalInput: {
    padding: 12,
    top: 8,
    fontSize: 16,
  },

  searchCard: {
    position: "absolute",
    top: 390,
    left: 20,
    right: 20,
    backgroundColor: "#E7F8F0",
    padding: 18,
    borderRadius: 16,
    zIndex: 6,
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#F3FDF8",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },

  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },

  searchBtn: {
    backgroundColor: "#00996D",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  searchBtnText: { color: "#fff", fontWeight: "600" },

  vehicleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  vehicleBtn: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#CDEFE0",
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 5,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  vehicleActive: { backgroundColor: "#0A8F5B" },

  vehicleText: {
    fontSize: 14,
    color: "#0A8F5B",
    fontWeight: "600",
    marginLeft: 8,
  },

  vehicleTextActive: { color: "#fff" },

  bookBtn: {
    backgroundColor: "#0A8F5B",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 18,
  },

  bookText: { color: "#fff", textAlign: "center", fontSize: 16 },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 10,
  },

  navItem: { alignItems: "center" },

  navText: { color: "#555", fontSize: 12, marginTop: 4 },
  navTextActive: { color: "#00996D", fontSize: 12, marginTop: 4 },

  navCenter: {
    position: "relative",
  },

  centerButton: {
    backgroundColor: "#00996D",
    padding: 14,
    borderRadius: 40,
  },
});
