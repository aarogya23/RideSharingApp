// components/BurgerMenu.jsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function BurgerMenu() {
  const [open, setOpen] = useState(false);
  const slide = new Animated.Value(0);

  const toggleMenu = () => {
    setOpen(!open);
    Animated.timing(slide, {
      toValue: open ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const translateX = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [-260, 0],
  });

  return (
    <>
      {/* BURGER ICON */}
      <TouchableOpacity style={styles.menuBtn} onPress={toggleMenu}>
        <Ionicons name="menu" size={22} color="#0A8F5B" />
      </TouchableOpacity>

      {/* SIDE MENU */}
      <Animated.View style={[styles.sideMenu, { transform: [{ translateX }] }]}>
        <Text style={styles.menuTitle}>Menu</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Favourite</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  menuBtn: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
  },

  sideMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 260,
    bottom: 0,
    backgroundColor: "#fff",
    paddingTop: 70,
    paddingHorizontal: 18,
    zIndex: 999,
    elevation: 50,
    borderRightWidth: 1,
    borderColor: "#ddd",
  },

  menuTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  menuItem: {
    paddingVertical: 14,
  },

  menuText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
