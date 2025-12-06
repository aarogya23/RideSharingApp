import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Popup component
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
  const isWeb = Platform.OS === "web";

  const [popup, setPopup] = useState({
    visible: false,
    type: "success",
    message: "",
  });

  const [routeData, setRouteData] = useState({
    input: "",
    userLocation: null,
    routeCoords: [],
    routeDistance: 0,
    routePrice: 0,
  });

  const [vehicleType, setVehicleType] = useState("Bike");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [acceptedDriver, setAcceptedDriver] = useState(null);
  const [driverRoute, setDriverRoute] = useState([]);
  const [showDriverSelection, setShowDriverSelection] = useState(false);

  const priceRates = { Bike: 30, Comfort: 80, Car: 60 };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current;

  const showPopup = (type, message) => {
    setPopup({ visible: true, type, message });
    setTimeout(
      () => setPopup({ visible: false, type: "", message: "" }),
      2500
    );
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

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();
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
  }, []);

  // Recalculate price
  useEffect(() => {
    const dist = parseFloat(routeData.routeDistance) || 0;
    const rate = priceRates[vehicleType] || 0;
    setRouteData((prev) => ({
      ...prev,
      routePrice: dist ? parseFloat((dist * rate).toFixed(2)) : 0,
    }));
  }, [vehicleType, routeData.routeDistance]);

  // Load dummy drivers
  const loadNearbyDrivers = () => {
    if (!routeData.userLocation) return;
    const [lat, lon] = routeData.userLocation;

    setDrivers([
      {
        id: 1,
        name: "Ram Bahadur",
        vehicle: "Bike",
        phone: "9812345678",
        location: [lat + 0.003, lon + 0.002],
      },
      {
        id: 2,
        name: "Sita Lama",
        vehicle: "Car",
        phone: "9801122334",
        location: [lat - 0.004, lon - 0.003],
      },
    ]);
  };

  // Handle driver accept
  const handleDriverAccept = async (driver) => {
    setAcceptedDriver(driver);
    setShowDriverSelection(false);

    if (!routeData.userLocation) return;
    try {
      const [uLat, uLon] = routeData.userLocation;
      const [dLat, dLon] = driver.location;

      const url = `https://router.project-osrm.org/route/v1/driving/${dLon},${dLat};${uLon},${uLat}?overview=full&geometries=geojson`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.routes?.length) {
        const coords = data.routes[0].geometry.coordinates.map((c) => [
          c[1],
          c[0],
        ]);

        setDriverRoute(coords);
      }
    } catch (err) {
      console.log("Driver route error:", err);
    }
  };

  // Search destination
  const handleSearchDestination = async () => {
    if (!routeData.input.trim()) {
      Alert.alert("Enter destination");
      return;
    }
    if (!routeData.userLocation) {
      Alert.alert("Location unavailable");
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
      const [fromLat, fromLon] = routeData.userLocation;

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
      ]);
      const km = parseFloat((route.routes[0].distance / 1000).toFixed(2));

      setRouteData((prev) => ({
        ...prev,
        routeCoords: coords,
        routeDistance: km,
      }));

      loadNearbyDrivers();
    } catch (err) {
      console.log("Error fetching route:", err);
      Alert.alert("Error", "Error fetching route");
    } finally {
      setLoadingRoute(false);
    }
  };

  // Book ride
  const handleBookRide = () => {
    if (!routeData.routeDistance || routeData.routeDistance <= 0) {
      Alert.alert("Search a destination first");
      return;
    }
    if (!routeData.routePrice || routeData.routePrice <= 0) {
      Alert.alert("Price cannot be 0");
      return;
    }
    setShowDriverSelection(true);
  };

  // Map component (WEB ONLY)
  let MapComponent = null;

  if (isWeb) {
    try {
      const {
        MapContainer,
        TileLayer,
        Marker,
        Polyline,
        Popup,
      } = require("react-leaflet");
      const L = require("leaflet");

      const userIcon = L.divIcon({
        html: `<div style="
              width:20px;height:20px;border-radius:50%;background-color:#0A8F5B;
              border:2px solid #fff;"></div>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 20],
      });

      const driverIcon = L.divIcon({
        html: `<div style="
              width:20px;height:20px;border-radius:50%;background-color:#ff6f00;
              border:2px solid #fff;"></div>`,
        className: "",
        iconSize: [20, 20],
        iconAnchor: [10, 20],
      });

      MapComponent = (
        <View style={styles.webMap}>
          <MapContainer
            center={routeData.userLocation || [27.7172, 85.324]}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {routeData.userLocation && (
              <Marker position={routeData.userLocation} icon={userIcon}>
                <Popup>
                  <b>You are here</b>
                </Popup>
              </Marker>
            )}

            {drivers.map((d) => (
              <Marker key={d.id} position={d.location} icon={driverIcon}>
                <Popup>
                  <div style={{ textAlign: "center" }}>
                    <div>{d.name}</div>
                    <div>{d.vehicle}</div>
                    <div>{d.phone}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {routeData.routeCoords.length > 0 && (
              <Polyline positions={routeData.routeCoords} color="blue" />
            )}

            {driverRoute.length > 0 && (
              <Polyline positions={driverRoute} color="red" />
            )}
          </MapContainer>
        </View>
      );
    } catch (err) {
      console.log("Map error:", err);
      MapComponent = null;
    }
  }

  return (
    <View style={styles.container}>
      {popup.visible && (
        <PopupMessage type={popup.type} message={popup.message} />
      )}

      {isWeb && MapComponent}
      {!isWeb && (
        <View style={{ flex: 1 }}>
          <Text style={{ textAlign: "center", margin: 10 }}>
            Native map placeholder
          </Text>
        </View>
      )}

      {/* TOP BAR */}
      <View style={styles.topRow}>
        <Stack.Screen options={{ headerShown: false }} />

        <TouchableOpacity style={styles.menuBtn} onPress={openSidebar}>
          <Ionicons name="menu" size={22} color="#0A8F5B" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color="#0A8F5B"
          />
        </TouchableOpacity>
      </View>

      {/* Distance & Price Box */}
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

      {/* Destination Input */}
      <View style={styles.rentalInputContainer}>
        <TextInput
          style={styles.rentalInput}
          placeholder="Enter your destination..."
          value={routeData.input}
          onChangeText={(x) =>
            setRouteData((p) => ({ ...p, input: x }))
          }
          returnKeyType="search"
          onSubmitEditing={handleSearchDestination}
        />
      </View>

      {/* Bottom Card */}
      <View style={styles.searchCard}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#7E7E7E" />
          <TextInput
            placeholder="Where would you go?"
            style={styles.searchInput}
            value={routeData.input}
            onChangeText={(txt) =>
              setRouteData((p) => ({ ...p, input: txt }))
            }
            returnKeyType="search"
            onSubmitEditing={handleSearchDestination}
          />
          <Ionicons name="heart-outline" size={20} color="#7E7E7E" />
        </View>

        {/* Vehicle Type */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginVertical: 12,
          }}
        >
          {["Bike", "Comfort", "Car"].map((type) => (
            <TouchableOpacity
              key={type}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10,
                borderWidth: 1,
                borderColor:
                  vehicleType === type ? "#0A8F5B" : "#ccc",
                backgroundColor:
                  vehicleType === type ? "#0A8F5B" : "#fff",
              }}
              onPress={() => setVehicleType(type)}
            >
              <Text
                style={{
                  color: vehicleType === type ? "#fff" : "#000",
                  fontWeight: "600",
                }}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Buttons */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
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
              setRouteData((p) => ({
                ...p,
                routeCoords: [],
                routeDistance: 0,
                routePrice: 0,
              }))
            }
          >
            <Text style={styles.searchBtnText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Book Ride Button */}
        <TouchableOpacity style={styles.bookBtn} onPress={handleBookRide}>
          <Text style={styles.bookText}>Book Ride</Text>
        </TouchableOpacity>
      </View>

      {/* Driver Selection Modal */}
      {showDriverSelection && (
        <View
          style={{
            position: "absolute",
            top: 200,
            left: 20,
            right: 20,
            backgroundColor: "#fff",
            padding: 15,
            borderRadius: 14,
            zIndex: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              marginBottom: 10,
            }}
          >
            Choose a Driver
          </Text>

          {drivers.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 8,
              }}
              onPress={() => handleDriverAccept(d)}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#ccc",
                  marginRight: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontWeight: "600" }}>
                  {d.vehicle[0]}
                </Text>
              </View>

              <View>
                <Text style={{ fontWeight: "600" }}>{d.name}</Text>
                <Text>{d.vehicle}</Text>
                <Text>{d.phone}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

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
          <Text style={styles.sidebarText}>My Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem}>
          <Ionicons name="wallet-outline" size={22} />
          <Text style={styles.sidebarText}>Spendings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem}>
          <Ionicons name="person-outline" size={22} />
          <Text style={styles.sidebarText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sidebarItem}>
          <Ionicons name="log-out-outline" size={22} />
          <Text style={[styles.sidebarText, { color: "red" }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3FDF8" },

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
  popupText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  webMap: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    zIndex: 0,
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
    backgroundColor: "#fff",
    padding: 10,
    marginHorizontal: 20,
    marginTop: 110,
    borderRadius: 10,
    zIndex: 10,
  },

  infoText: { fontSize: 15, fontWeight: "600", color: "#333" },

  rentalInputContainer: {
    marginTop: 310,
    marginHorizontal: 20,
  },

  rentalInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  searchCard: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    marginHorizontal: 20,
    backgroundColor: "white",
    padding: 18,
    borderRadius: 18,
  },

  searchBox: {
    flexDirection: "row",
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
  },

  searchBtn: {
    flex: 1,
    backgroundColor: "#00996D",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  searchBtnText: {
    color: "#fff",
    fontWeight: "600",
  },

  bookBtn: {
    backgroundColor: "#00996D",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
  },

  bookText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  bottomNav: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-around",
    elevation: 5,
  },

  navItem: { alignItems: "center" },

  navText: { fontSize: 12, color: "#555" },

  navTextActive: { fontSize: 12, color: "#00996D", fontWeight: "700" },

  navCenter: { marginTop: -30 },

  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#00996D",
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#fff",
    padding: 20,
    zIndex: 20,
  },

  sidebarTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },

  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  sidebarText: { fontSize: 16, marginLeft: 12 },
  
});
