import "leaflet/dist/leaflet.css";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function App() {
  if (Platform.OS === "web") {
    // Load Leaflet map only on Web
    const { MapContainer, TileLayer, Marker, Popup } = require("react-leaflet");

    return (
      <View style={styles.container}>
        <MapContainer
          center={[27.7172, 85.3240]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[27.7172, 85.3240]}>
            <Popup>Kathmandu</Popup>
          </Marker>
        </MapContainer>
      </View>
    );
  }

  // 👉 For Android & iOS (NO MAP)
  return (
    <View style={styles.nativeContainer}>
      <Text style={styles.text}>Map feature is available only on the web.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nativeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 16,
    color: "black",
  },
});
