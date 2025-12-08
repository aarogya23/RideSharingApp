import React from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function RecommendationMap() {
  const route = useRoute();
  const navigation = useNavigation();
  const { type } = route.params;

  const places = type === "hospital"
    ? ["City Hospital", "Kathmandu General Hospital", "Green Cross Hospital"]
    : ["Super Bike Repair", "Auto Care Garage", "Nepal Car Repair"];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        {type === "hospital" ? "Nearest Hospitals" : "Nearest Bike/Car Repairs"}
      </Text>

      {Platform.OS === "web" ? (
        <iframe
          title="map"
          src="https://www.openstreetmap.org/export/embed.html"
          style={{ width: "100%", height: "60%", border: "none", borderRadius: 12, marginTop: 20 }}
        />
      ) : (
        <Text style={{ marginTop: 20, color: "gray", fontSize: 16 }}>Map only available on web</Text>
      )}

      <View style={{ marginTop: 20 }}>
        {places.map((p, i) => (
          <Text key={i} style={styles.placeText}>• {p}</Text>
        ))}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", backgroundColor: "#f3f4f6" },
  title: { fontSize: 22, fontWeight: "700", marginTop: 20 },
  backBtn: { position: "absolute", top: 50, left: 20 },
  backText: { fontSize: 16, color: "#16a34a", fontWeight: "600" },
  placeText: { fontSize: 16, marginVertical: 5 },
});