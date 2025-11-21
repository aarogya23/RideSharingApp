import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("Transport");
  const [rentalInput, setRentalInput] = useState(""); // State for the new input

  return (
    <ImageBackground
      source={require("@/assets/images/map.png")} // Your static map image here
      style={styles.container}
      resizeMode="cover" // This ensures the image fills the entire screen without distortion
    >
      {/* Top Row Buttons */}
      <View style={styles.topRow}>
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="menu" size={22} color="#0A8F5B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color="#0A8F5B" />
        </TouchableOpacity>
      </View>
      {/* Center Radar Circle */}
      <View style={styles.radarContainer}>
        <View style={styles.outerCircle}>
          <View style={styles.middleCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name="location" size={22} color="white" />
            </View>
          </View>
        </View>
      </View>
      {/* Rental Input */}
      <View style={styles.rentalInputContainer}>
        <TextInput
          style={styles.rentalInput}
          placeholder="Enter your destination details..."
          value={rentalInput}
          onChangeText={setRentalInput}
        />
      </View>
      {/* Search Card */}
      <View style={styles.searchCard}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#7E7E7E" />
          <TextInput
            placeholder="Where would you go?"
            style={styles.searchInput}
          />
          <Ionicons name="heart-outline" size={20} color="#7E7E7E" />
        </View>
        {/* Toggle Transport / Delivery */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === "Transport" && styles.activeToggle,
            ]}
            onPress={() => setActiveTab("Transport")}
          >
            <Text style={[
              styles.toggleText,
              activeTab === "Transport" && styles.activeText
            ]}>Transport</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === "Delivery" && styles.activeToggle,
            ]}
            onPress={() => setActiveTab("Delivery")}
          >
            <Text style={[
              styles.toggleText,
              activeTab === "Delivery" && styles.activeText
            ]}>Delivery</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Bottom Navigation */}
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Top
  topRow: {
    marginTop: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  menuBtn: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  bellBtn: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
  },
  // Radar
  radarContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  outerCircle: {
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: "rgba(28, 199, 142, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  middleCircle: {
    width: 120,
    height: 120,
    borderRadius: 100,
    backgroundColor: "rgba(28, 199, 142, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: "#0A8F5B",
    justifyContent: "center",
    alignItems: "center",
  },
  // Rental Input
  rentalInputContainer: {
    backgroundColor: "white",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0A8F5B",
  },
  rentalInput: {
    color: "black",
    padding: 13,
    fontSize: 17,
    fontWeight: "500",
    placeholderTextColor: "#666",
  },
  // Search Card
  searchCard: {
    backgroundColor: "#E5F7EE",
    margin: 20,
    padding: 15,
    borderRadius: 15,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF8F0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#CDEFE0",
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  toggleText: {
    color: "#0A8F5B",
    fontSize: 15,
    fontWeight: "500",
  },
  activeToggle: {
    backgroundColor: "#0A8F5B",
  },
  activeText: {
    color: "white",
  },
  // Bottom Nav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "white",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#555",
  },
  navTextActive: {
    color: "#0A8F5B",
    fontSize: 12,
    fontWeight: "600",
  },
  walletIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0A8F5B",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -40,
    elevation: 6,
  },
});