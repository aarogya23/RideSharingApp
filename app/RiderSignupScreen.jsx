import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RiderSignupScreen() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    vehicleType: "",
    licenseNumber: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false); // disable button after success
  const [successMessage, setSuccessMessage] = useState(""); // message to show on screen

  const handleSignup = async () => {
    if (isSubmitted) return;

    // Basic frontend validation
    if (
      !form.fullName ||
      !form.email ||
      !form.username ||
      !form.password ||
      !form.vehicleType ||
      !form.licenseNumber
    ) {
      setSuccessMessage("Please fill all fields");
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
        setSuccessMessage("Your account is successfully registered!");
        setIsSubmitted(true);

        // hide the message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        setSuccessMessage(data || "Something went wrong");
      }
    } catch (error) {
      setSuccessMessage(error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Rider Signup</Text>

      {successMessage !== "" && (
        <View style={styles.messageContainer}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={form.fullName}
        onChangeText={(text) => setForm({ ...form, fullName: text })}
        editable={!isSubmitted}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
        keyboardType="email-address"
        editable={!isSubmitted}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={form.username}
        onChangeText={(text) => setForm({ ...form, username: text })}
        editable={!isSubmitted}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => setForm({ ...form, password: text })}
        editable={!isSubmitted}
      />
      <TextInput
        style={styles.input}
        placeholder="Vehicle Type"
        value={form.vehicleType}
        onChangeText={(text) => setForm({ ...form, vehicleType: text })}
        editable={!isSubmitted}
      />
      <TextInput
        style={styles.input}
        placeholder="License Number"
        value={form.licenseNumber}
        onChangeText={(text) => setForm({ ...form, licenseNumber: text })}
        editable={!isSubmitted}
      />

      <TouchableOpacity
        style={[styles.button, isSubmitted && { backgroundColor: "#ccc" }]}
        onPress={handleSignup}
        disabled={isSubmitted}
      >
        <Text style={styles.buttonText}>{isSubmitted ? "Registered" : "Sign Up"}</Text>
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
  messageContainer: {
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  successText: {
    color: "#155724",
    fontSize: 16,
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
