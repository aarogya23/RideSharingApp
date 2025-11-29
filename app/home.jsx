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

/**
 * Full HomeScreen (React Native + Expo)
 * - Uses single state object: routeData
 * - Map only on web (react-leaflet)
 * - Destination search via Nominatim + route via OSRM
 * - Price calculation and POST to backend
 */

export default function HomeScreen() {


   const [popup, setPopup] = useState({ visible: false, type: "success", message: "" });

    const showPopup = (type, message) => {
    setPopup({ visible: true, type, message });
    setTimeout(() => setPopup((prev) => ({ ...prev, visible: false })), 2500);
    };

  // SINGLE STATE OBJECT
  const [routeData, setRouteData] = useState({
    input: "",
    userLocation: null, // [lat, lng]
    routeCoords: [], // [[lat, lng], ...]
    routeDistance: 0, // in km (number or string convertible)
    routePrice: 0, // number or string convertible
  });

  // Vehicle selection (separate)
  const [vehicleType, setVehicleType] = useState("Bike");

  // Loading states
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [saving, setSaving] = useState(false);

  // Price rates per km
  const priceRates = {
    Bike: 30,
    Comfort: 80,
    Car: 60,
  };

  const isWeb = Platform.OS === "web";

  // Base URL helper (different for emulators)
  const getBaseUrl = () => {
    if (isWeb) return "http://localhost:8084";
    if (Platform.OS === "android") return "http://localhost:8084"; // Android emulator
    return "http://localhost:8084"; // iOS simulator / dev device (adjust if needed)
  };

  // 1) Request location on web (only)
  useEffect(() => {
    if (!isWeb) return;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission", "Location permission denied");
          return;
        }

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

  // 2) Recalculate price when vehicleType or routeDistance changes
  useEffect(() => {
    const dist = parseFloat(routeData.routeDistance) || 0;
    const rate = priceRates[vehicleType] || 0;
    const newPrice = dist ? parseFloat((dist * rate).toFixed(2)) : 0;

    setRouteData((prev) => ({
      ...prev,
      routePrice: newPrice,
    }));
  }, [vehicleType, routeData.routeDistance]);

  // 3) Search destination + fetch route from OSRM
  const handleSearchDestination = async () => {
    if (!routeData.input.trim()) {
      Alert.alert("Enter destination");
      return;
    }

    // If on web and userLocation not ready
    if (isWeb && !routeData.userLocation) {
      Alert.alert("Location unavailable", "Try again when location loads.");
      return;
    }

    setLoadingRoute(true);

    try {
      // 1) Geocode destination (Nominatim)
      const q = encodeURIComponent(routeData.input);
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}`
      );
      const geo = await geoRes.json();

      if (!geo || !geo.length) {
        Alert.alert("Not found");
        setLoadingRoute(false);
        return;
      }

      const destLat = parseFloat(geo[0].lat);
      const destLon = parseFloat(geo[0].lon);

      // 2) If we don't have userLocation (native), we can't route — inform user
      if (!routeData.userLocation) {
        // On native you might want to use a fallback or let user enter manually
        Alert.alert(
          "User location missing",
          "App couldn't get your location. Enter manually (dev) or test on web."
        );
        setLoadingRoute(false);
        return;
      }

      // Build OSRM URL (lon,lat order)
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

      const coords = route.routes[0].geometry.coordinates.map((c) => [
        c[1],
        c[0],
      ]); // convert [lon,lat] -> [lat,lon]

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

  // 4) POST to backend to save ride
  const handleBookRide = async () => {
    // Validate price > 0
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
      // payload shape matches backend example (adjust keys if your backend expects different names)
      const payload = {
        vehicleType: vehicleType,
        distanceKm: routeData.routeDistance,
        price: routeData.routePrice,
        destinationName: routeData.input,
      };

      // POST
      const base = getBaseUrl();
      const response = await axios.post(`${base}/api/rides/save`, payload);

      // Backend might return string message or object; handle both
      const respData = response?.data;
      const message =
        typeof respData === "string"
          ? respData
          : respData?.message || "Ride saved successfully";

      
      showPopup("success", "Ride booked successfully!");


      Alert.alert("Success", message);
    } catch (err) {
      console.log("Save error:", err?.response ?? err);
      const serverMessage =
        err?.response?.data || "Could not save ride. Try again.";
      Alert.alert("Failed", String(serverMessage));
      showPopup("error", "Could not save ride");
    } finally {
      setSaving(false);
    }
  };

  // 5) Web map renderer (lazy require)
  let WebMap = null;
  if (isWeb) {
    try {
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

            {routeData.routeCoords.length > 0 && (
              <Polyline positions={routeData.routeCoords} />
            )}
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
      {/* Map (web) or static image (native) */}
      {isWeb && WebMap}
      {!isWeb && (
        <ImageBackground
          source={require("@/assets/images/map.png")}
          style={styles.nativeMap}
        />
      )}

      <View style={styles.topRow}>
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="menu" size={22} color="#0A8F5B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color="#0A8F5B" />
        </TouchableOpacity>
      </View>

      {/* Distance + Price */}
      {routeData.routeDistance > 0 && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Distance: {routeData.routeDistance} km
          </Text>
          <Text style={styles.infoText}>
            Price ({vehicleType}): Rs {routeData.routePrice}
          </Text>
        </View>
      )}

      {/* Destination input */}
      <View style={styles.rentalInputContainer}>
        <TextInput
          style={styles.rentalInput}
          placeholder="Enter your destination..."
          value={routeData.input}
          onChangeText={(txt) =>
            setRouteData((prev) => ({ ...prev, input: txt }))
          }
          returnKeyType="search"
          onSubmitEditing={handleSearchDestination}
        />
      </View>

      {/* Search card + vehicle selection */}
      {/** Show card when we have distance or after search */}
      <View style={styles.searchCard}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#7E7E7E" />
          <TextInput
            placeholder="Where would you go?"
            style={styles.searchInput}
            value={routeData.input}
            onChangeText={(txt) =>
              setRouteData((prev) => ({ ...prev, input: txt }))
            }
            returnKeyType="search"
            onSubmitEditing={handleSearchDestination}
          />
          <Ionicons name="heart-outline" size={20} color="#7E7E7E" />
        </View>

        {/* Search / loading */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleSearchDestination}
            disabled={loadingRoute}
          >
            {loadingRoute ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.searchBtnText}>Search Route</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.searchBtn,
              { backgroundColor: "#0A8F5B", marginLeft: 12 },
            ]}
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

        {/* Vehicle selection only visible after routeDistance > 0 */}
        {routeData.routeDistance > 0 && (
          <View style={styles.vehicleRow}>
            {["Bike", "Comfort", "Car"].map((v) => (
              <TouchableOpacity
                key={v}
                style={[
                  styles.vehicleBtn,
                  vehicleType === v && styles.vehicleActive,
                ]}
                onPress={() => setVehicleType(v)}
              >
                <Ionicons
                  name={
                    v === "Bike" ? "bicycle" : v === "Car" ? "car" : "bus"
                  }
                  size={22}
                  color={vehicleType === v ? "#fff" : "#0A8F5B"}
                />
                <Text
                  style={[
                    styles.vehicleText,
                    vehicleType === v && styles.vehicleTextActive,
                  ]}
                >
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Book Ride Button */}
        <TouchableOpacity
          style={[styles.bookBtn, routeData.routePrice <= 0 && { opacity: 0.6 }]}
          onPress={handleBookRide}
          disabled={saving || routeData.routePrice <= 0}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookText}>Book Ride</Text>
          )}
        </TouchableOpacity>
      </View>


      

      {/* Bottom nav (kept minimal) */}
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

// Styles (kept close to your original)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3FDF8" },

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
  top: 330, // moved up from 360
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
  top: 390, // moved up from 420
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

  vehicleImg: { width: 32, height: 32, marginBottom: 6 },

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
    elevation: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    zIndex: 7,
  },

  navItem: {
    justifyContent: "center",
    alignItems: "center",
  },

  navText: {
    fontSize: 12,
    color: "#555",
  },

  navTextActive: {
    fontSize: 12,
    color: "#00996D",
    fontWeight: "600",
  },

  navCenter: { marginBottom: 40 },

  centerButton: {
    width: 60,
    height: 60,
    backgroundColor: "#00996D",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
