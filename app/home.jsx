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
  // SINGLE STATE OBJECT FOR ROUTE + SEARCH
  const [routeData, setRouteData] = useState({
    input: "",
    userLocation: null,
    routeCoords: [],
    routeDistance: 0,
    routePrice: 0,
  });

  // SEPARATE VEHICLE TYPE
  const [vehicleType, setVehicleType] = useState("Bike");

  // PRICE RATE (per km)
  const priceRates = {
    Bike: 30,
    Comfort: 80,
    Car: 60,
  };

  const isWeb = Platform.OS === "web";

  // 1) Request location on web
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

  // 2) Recalculate price when vehicle or distance changes
  useEffect(() => {
    if (!routeData.routeDistance) return;

    const km = parseFloat(routeData.routeDistance);
    const rate = priceRates[vehicleType] || 0;

    const newPrice = (km * rate).toFixed(2);

    setRouteData((prev) => ({
      ...prev,
      routePrice: newPrice,
    }));
  }, [vehicleType, routeData.routeDistance]);

  // 3) Search destination + fetch route
  const handleSearchDestination = async () => {
    if (!routeData.input.trim()) {
      Alert.alert("Enter destination");
      return;
    }

    if (!routeData.userLocation) {
      Alert.alert("Location unavailable", "Try again when location loads.");
      return;
    }

    try {
      // NOMINATIM
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          routeData.input
        )}`
      );
      const geo = await geoRes.json();

      if (!geo.length) {
        Alert.alert("Not found");
        return;
      }

      const destLat = parseFloat(geo[0].lat);
      const destLon = parseFloat(geo[0].lon);

      // OSRM ROUTER
      const url = `https://router.project-osrm.org/route/v1/driving/${routeData.userLocation[1]},${routeData.userLocation[0]};${destLon},${destLat}?overview=full&geometries=geojson`;

      const res = await fetch(url);
      const route = await res.json();

      if (!route.routes?.length) {
        Alert.alert("Route not found");
        return;
      }

      const coords = route.routes[0].geometry.coordinates.map((c) => [
        c[1],
        c[0],
      ]);

      const km = (route.routes[0].distance / 1000).toFixed(2);

      setRouteData((prev) => ({
        ...prev,
        routeCoords: coords,
        routeDistance: km,
      }));
    } catch (err) {
      console.log("Error:", err);
      Alert.alert("Error fetching route");
    }
  };

  // 4) Web map renderer
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
      {isWeb && WebMap}

      {!isWeb && (
        <ImageBackground
          source={require("@/assets/images/map.png")}
          style={styles.nativeMap}
        />
      )}

      {/* TOP BUTTONS */}
      <View style={styles.topRow}>
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="menu" size={22} color="#0A8F5B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color="#0A8F5B" />
        </TouchableOpacity>
      </View>

      {/* DISTANCE + PRICE */}
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

      {/* SEARCH INPUT */}
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

      {/* VEHICLE SELECTION */}
      {routeData.routeDistance > 0 && (
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

          {/* VEHICLE BUTTONS */}
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

// STYLES
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
  },

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

navCenter: {
  marginBottom: 40,
},

centerButton: {
  width: 60,
  height: 60,
  backgroundColor: "#00996D",
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center",
  elevation: 5,
},

  menuBtn: { backgroundColor: "white", padding: 12, borderRadius: 12 },
  bellBtn: { backgroundColor: "white", padding: 12, borderRadius: 12 },

  infoBox: {
    position: "absolute",
    top: 290,
    left: 20,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#0A8F5B",
  },

  infoText: { color: "white", fontSize: 16, fontWeight: "600" },

  rentalInputContainer: {
    position: "absolute",
    top: 390,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
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
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#F3FDF8",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
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

  vehicleActive: { backgroundColor: "#0A8F5B" },

  vehicleImg: { width: 32, height: 32, marginBottom: 6 },

  vehicleText: {
    fontSize: 14,
    color: "#0A8F5B",
    fontWeight: "600",
  },

  vehicleTextActive: { color: "#fff" },
});
