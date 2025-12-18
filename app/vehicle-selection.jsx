import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function VehicleSelectionScreen() {
  const [vehicleType, setVehicleType] = useState(null);
  const router = useRouter();

  const selectVehicle = (type) => {
    setVehicleType(type);

    router.push({
      pathname: "/",
      params: { selectedVehicle: type },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Vehicle</Text>

      <TouchableOpacity
        style={[styles.option, vehicleType === "Bike" && styles.active]}
        onPress={() => selectVehicle("Bike")}
      >
        <Ionicons
          name="bicycle-outline"
          size={26}
          color={vehicleType === "Bike" ? "#fff" : "#0A8F5B"}
        />
        <Text
          style={[
            styles.optionName,
            vehicleType === "Bike" && styles.activeText,
          ]}
        >
          Motor Bike
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, vehicleType === "Comfort" && styles.active]}
        onPress={() => selectVehicle("Comfort")}
      >
        <Ionicons
          name="car-sport-outline"
          size={26}
          color={vehicleType === "Comfort" ? "#fff" : "#0A8F5B"}
        />
        <Text
          style={[
            styles.optionName,
            vehicleType === "Comfort" && styles.activeText,
          ]}
        >
          Comfort
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, vehicleType === "Car" && styles.active]}
        onPress={() => selectVehicle("Car")}
      >
        <Ionicons
          name="car-outline"
          size={26}
          color={vehicleType === "Car" ? "#fff" : "#0A8F5B"}
        />
        <Text
          style={[
            styles.optionName,
            vehicleType === "Car" && styles.activeText,
          ]}
        >
          Car
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 22,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 25,
  },

  option: {
    backgroundColor: "#F0FAF4",
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  active: {
    backgroundColor: "#0A8F5B",
  },

  optionName: {
    marginLeft: 14,
    fontSize: 18,
    fontWeight: "600",
    color: "#0A8F5B",
  },

  activeText: {
    color: "#fff",
  },
});
