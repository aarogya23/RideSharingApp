import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DriverRideMap() {
  const isWeb = Platform.OS === "web";

  const {
    userLat,
    userLon,
    destLat,
    destLon,
    userName,
    userPhone, // pass user's phone number
    destinationName,
    distanceKm,
    price,
  } = useLocalSearchParams();

  const pickup = [Number(userLat), Number(userLon)];
  const destination = [Number(destLat), Number(destLon)];

  const [routeCoords, setRouteCoords] = useState([]); // pickup -> destination
  const [driverRouteCoords, setDriverRouteCoords] = useState([]); // driver -> pickup
  const [showDriverRoute, setShowDriverRoute] = useState(false);

  // 🔹 FETCH ROUTE FROM PICKUP TO DESTINATION
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes?.length) {
          const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
          setRouteCoords(coords);
        }
      } catch (err) {
        console.log("Route error:", err);
      }
    };
    fetchRoute();
  }, []);

  // 🔹 ACCEPT RIDE -> SHOW DRIVER ROUTE TO PICKUP
  const handleAcceptRide = async () => {
    try {
      // Example: driver starts a bit away from pickup
      const driverStart = [pickup[0] - 0.01, pickup[1] - 0.01];

      const url = `https://router.project-osrm.org/route/v1/driving/${driverStart[1]},${driverStart[0]};${pickup[1]},${pickup[0]}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes?.length) {
        const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
        setDriverRouteCoords(coords);
        setShowDriverRoute(true);
        Alert.alert("Ride Accepted", "Route to user pickup is now shown on map!");
      }
    } catch (err) {
      console.log("Driver route error:", err);
    }
  };

  // 🔹 CALL USER
  const handleCallUser = () => {
    if (!userPhone) return Alert.alert("Error", "User phone not available");
    Linking.openURL(`tel:${userPhone}`);
  };

  // 🔹 MESSAGE USER -> navigate to /message.jsx
  const handleMessageUser = () => {
    router.push({
      pathname: "/message", // message.jsx page
      params: {
        userName,
        userPhone,
        pickupLat: pickup[0],
        pickupLon: pickup[1],
        destinationLat: destination[0],
        destinationLon: destination[1],
      },
    });
  };

  // 🔹 LEAFLET MAP FOR WEB
  let MapComponent = null;

  if (isWeb) {
    try {
      const { MapContainer, TileLayer, Marker, Polyline, Popup } = require("react-leaflet");
      const L = require("leaflet");

      const pickupIcon = L.divIcon({
        html: `<div style="width:20px;height:20px;border-radius:50%;background-color:#0A8F5B;border:2px solid white;"></div>`,
        className: "",
      });

      const destIcon = L.divIcon({
        html: `<div style="width:20px;height:20px;border-radius:50%;background-color:#d00000;border:2px solid white;"></div>`,
        className: "",
      });

      const driverIcon = L.divIcon({
        html: `<div style="width:16px;height:16px;border-radius:50%;background-color:#f5a623;border:2px solid white;"></div>`,
        className: "",
      });

      MapComponent = (
        <View style={styles.mapWrapper}>
          <MapContainer center={pickup} zoom={14} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Driver -> Pickup route */}
            {showDriverRoute && driverRouteCoords.length > 0 && (
              <>
                <Polyline positions={driverRouteCoords} color="orange" />
                <Marker position={driverRouteCoords[0]} icon={driverIcon}>
                  <Popup>Driver Start</Popup>
                </Marker>
                <Marker position={driverRouteCoords[driverRouteCoords.length - 1]} icon={pickupIcon}>
                  <Popup>Pickup Location</Popup>
                </Marker>
              </>
            )}

            {/* Pickup -> Destination route */}
            {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}

            {/* Destination */}
            <Marker position={destination} icon={destIcon}>
              <Popup>
                <b>Destination</b>
                <br />
                {destinationName}
              </Popup>
            </Marker>
          </MapContainer>
        </View>
      );
    } catch (err) {
      console.log("Leaflet error:", err);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* MAP */}
      {isWeb ? MapComponent : <View style={styles.nativePlaceholder}><Text>Native map not implemented</Text></View>}

      {/* INFO CARD */}
      <View style={styles.infoCard}>
        <Text style={styles.name}>{userName}</Text>
        <Text>Destination: {destinationName}</Text>
        <Text>Distance: {distanceKm} km</Text>
        <Text style={styles.price}>Rs {price}</Text>

        <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptRide}>
          <Text style={styles.acceptText}>Accept Ride</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", marginTop: 10, justifyContent: "space-between" }}>
          <TouchableOpacity style={styles.contactBtn} onPress={handleMessageUser}>
            <Text style={styles.contactText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactBtn} onPress={handleCallUser}>
            <Text style={styles.contactText}>Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3FDF8" },
  header: { position: "absolute", top: 40, left: 0, right: 0, zIndex: 10, paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  mapWrapper: { position: "absolute", top: 0, left: 0, height: "100%", width: "100%" },
  nativePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  infoCard: { position: "absolute", bottom: 30, left: 20, right: 20, backgroundColor: "#fff", padding: 16, borderRadius: 16, elevation: 10 },
  name: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  price: { fontSize: 16, fontWeight: "700", color: "#16a34a", marginTop: 4 },
  acceptBtn: { marginTop: 12, backgroundColor: "#0A8F5B", paddingVertical: 12, borderRadius: 10 },
  acceptText: { textAlign: "center", color: "#fff", fontWeight: "700", fontSize: 15 },
  contactBtn: { flex: 0.48, backgroundColor: "#0A8F5B", paddingVertical: 10, borderRadius: 10 },
  contactText: { textAlign: "center", color: "#fff", fontWeight: "700", fontSize: 14 },
});
