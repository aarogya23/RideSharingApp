import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Stack } from "expo-router";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [rentalInput, setRentalInput] = useState("");
  const [userLocation, setUserLocation] = useState(null); // [lat, lon]
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeDistance, setRouteDistance] = useState(null); // km as string "x.xx"
  const [routePrice, setRoutePrice] = useState(null);

  const [vehicleType, setVehicleType] = useState("Bike");

  // PRICE RATES (per km)
  const priceRates = {
    Bike: 30,
    Comfort: 80,
    Car: 60,
  };

  const isWeb = Platform.OS === "web";

  // Request location on web only (keeps mobile unaffected)
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
        setUserLocation([loc.coords.latitude, loc.coords.longitude]);
      } catch (err) {
        console.log("Location error:", err);
      }
    })();
  }, [isWeb]);

  // Recalculate price when vehicleType or routeDistance changes
  useEffect(() => {
    if (!routeDistance) {
      setRoutePrice(null);
      return;
    }
    const km = parseFloat(routeDistance);
    if (isNaN(km)) {
      setRoutePrice(null);
      return;
    }
    const price = (km * (priceRates[vehicleType] || 0)).toFixed(2);
    setRoutePrice(price);
  }, [vehicleType, routeDistance]);

  // Handle search -> geocode + route
  const handleSearchDestination = async () => {
    if (!rentalInput?.trim()) {
      Alert.alert("Enter destination", "Please enter a destination to search.");
      return;
    }

    if (!userLocation) {
      Alert.alert(
        "Location unavailable",
        "User location is not available yet. Allow location access (web) or try again."
      );
      return;
    }

    try {
      // Geocode with Nominatim
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          rentalInput
        )}`
      );
      const geoData = await geoRes.json();

      if (!Array.isArray(geoData) || geoData.length === 0) {
        Alert.alert("Not found", "Destination not found.");
        return;
      }

      const destLat = parseFloat(geoData[0].lat);
      const destLon = parseFloat(geoData[0].lon);

      if (Number.isNaN(destLat) || Number.isNaN(destLon)) {
        Alert.alert("Geocode error", "Unable to parse destination coordinates.");
        return;
      }

      // OSRM route: userLocation is [lat, lon] so pass lon,lat
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${destLon},${destLat}?overview=full&geometries=geojson`;

      const routeRes = await fetch(routeUrl);
      const routeData = await routeRes.json();

      if (
        !routeData ||
        !routeData.routes ||
        !Array.isArray(routeData.routes) ||
        routeData.routes.length === 0
      ) {
        Alert.alert("Route error", "No route found between points.");
        return;
      }

      // Convert coordinates [lon, lat] -> [lat, lon] for react-leaflet
      const coords = routeData.routes[0].geometry.coordinates.map((c) => [
        c[1],
        c[0],
      ]);
      setRouteCoords(coords);

      // Distance meters -> km  with two decimals
      const meters = routeData.routes[0].distance;
      const km = (meters / 1000).toFixed(2);
      setRouteDistance(km);

      // Price will be computed by useEffect above
    } catch (error) {
      console.log("Search/Route error:", error);
      Alert.alert("Error", "There was an error fetching the route.");
    }
  };

  // Web map component (only import react-leaflet on web)
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
            center={userLocation || [27.7172, 85.324]}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {userLocation && (
              <Marker position={userLocation}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {routeCoords.length > 0 && <Polyline positions={routeCoords} />}
          </MapContainer>
        </View>
      );
    } catch (err) {
      // If react-leaflet isn't available in the environment, just skip map to avoid crash.
      console.log("react-leaflet import error (web):", err);
      WebMap = null;
    }
  }

  return (
    <View style={styles.container}>
      {/* WEB MAP */}
      {isWeb && WebMap}

      {/* STATIC IMAGE FOR MOBILE */}
      {!isWeb && (
        <ImageBackground
          source={require("@/assets/images/map.png")}
          style={styles.nativeMap}
          resizeMode="cover"
        />
      )}

      {/* TOP ACTIONS */}
      <View style={styles.topRow}>
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="menu" size={22} color="#0A8F5B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color="#0A8F5B" />
        </TouchableOpacity>
      </View>

      {/* Distance + Price panel (only after route computed) */}
      {routeDistance && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Distance: {routeDistance} km</Text>
          <Text style={styles.infoText}>
            Price ({vehicleType}): Rs {routePrice}
          </Text>
        </View>
      )}

      {/* Destination input (always visible) */}
      <View style={styles.rentalInputContainer}>
        <TextInput
          style={styles.rentalInput}
          placeholder="Enter your destination..."
          value={rentalInput}
          onChangeText={setRentalInput}
          returnKeyType="search"
          onSubmitEditing={handleSearchDestination}
        />
      </View>

      {/* Show search card + vehicle options only after search */}
      {routeDistance && (
        <View style={styles.searchCard}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#7E7E7E" />
            <TextInput
              placeholder="Where would you go?"
              style={styles.searchInput}
              value={rentalInput}
              onChangeText={setRentalInput}
              returnKeyType="search"
              onSubmitEditing={handleSearchDestination}
            />
            <Ionicons name="heart-outline" size={20} color="#7E7E7E" />
          </View>

          <View style={styles.vehicleRow}>
  {/* BIKE */}
  <TouchableOpacity
    style={[
      styles.vehicleBtn,
      vehicleType === "Bike" && styles.vehicleActive,
    ]}
    onPress={() => setVehicleType("Bike")}
  >
    <Image
      source={{
        uri: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
      }}
      style={styles.vehicleImg}
    />
    <Text
      style={[
        styles.vehicleText,
        vehicleType === "Bike" && styles.vehicleTextActive,
      ]}
    >
      Motor Bike
    </Text>
  </TouchableOpacity>

  {/* COMFORT */}
  <TouchableOpacity
    style={[
      styles.vehicleBtn,
      vehicleType === "Comfort" && styles.vehicleActive,
    ]}
    onPress={() => setVehicleType("Comfort")}
  >
    <Image
      source={{
        uri: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
      }}
      style={styles.vehicleImg}
    />
    <Text
      style={[
        styles.vehicleText,
        vehicleType === "Comfort" && styles.vehicleTextActive,
      ]}
    >
      Comfort
    </Text>
  </TouchableOpacity>

  {/* CAR */}
  <TouchableOpacity
    style={[
      styles.vehicleBtn,
      vehicleType === "Car" && styles.vehicleActive,
    ]}
    onPress={() => setVehicleType("Car")}
  >
    <Image
      source={{
        uri: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
      }}
      style={styles.vehicleImg}
    />
    <Text
      style={[
        styles.vehicleText,
        vehicleType === "Car" && styles.vehicleTextActive,
      ]}
    >
      Car
    </Text>
  </TouchableOpacity>
</View>

        </View>
      )}

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

// Styles
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
    zIndex: 10,
  },

  menuBtn: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
  },
  bellBtn: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
  },

  infoBox: {
    position: "absolute",
    top: 290,
    left: 20,
    backgroundColor: "#0A8F5B",
    padding: 14,
    borderRadius: 10,
    zIndex: 20,
  },
  infoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  rentalInputContainer: {
    position: "absolute",
    top: 390,
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
    top: 450,
    left: 20,
    right: 20,
    backgroundColor: "#E7F8F0",
    padding: 18,
    borderRadius: 16,
    elevation: 6,
    zIndex: 12,
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
  },

  vehicleActive: {
    backgroundColor: "#0A8F5B",
  },

  vehicleImg: {
    width: 32,
    height: 32,
    marginBottom: 6,
  },

  vehicleText: {
    fontSize: 14,
    color: "#0A8F5B",
    fontWeight: "600",
  },

  vehicleTextActive: {
    color: "#fff",
  },

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
  },
});
