import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";

export default function RiderSignupScreen() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    vehicleType: "",
    licenseNumber: "",
  });

  const handleSignup = async () => {
    // Basic frontend validation
    if (
      !form.fullName ||
      !form.email ||
      !form.username ||
      !form.password ||
      !form.vehicleType ||
      !form.licenseNumber
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:8084/api/driver/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Driver registered successfully!");
        // Optionally, navigate to login screen
      } else {
        Alert.alert("Error", data || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Rider Signup</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={form.fullName}
        onChangeText={(text) => setForm({ ...form, fullName: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={form.username}
        onChangeText={(text) => setForm({ ...form, username: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => setForm({ ...form, password: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Vehicle Type"
        value={form.vehicleType}
        onChangeText={(text) => setForm({ ...form, vehicleType: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="License Number"
        value={form.licenseNumber}
        onChangeText={(text) => setForm({ ...form, licenseNumber: text })}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#2EB872",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
