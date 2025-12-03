import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState(null); // passenger or rider

  const handleContinue = () => {
    if (!selectedMode) {
      alert("Please select a mode first");
      return;
    }
    router.push({ pathname: "/login", params: { mode: selectedMode } });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Image
        source={require("@/assets/images/welcome-car.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Choose how you want to use the app</Text>

      {/* MODE SELECTION */}
      <View style={styles.modeContainer}>

        {/* Passenger */}
        <TouchableOpacity
          style={[
            styles.modeBtn,
            { backgroundColor: selectedMode === "passenger" ? "#2EB872" : "#fff" },
          ]}
          onPress={() => setSelectedMode("passenger")}
        >
          <Text
            style={[
              styles.modeText,
              { color: selectedMode === "passenger" ? "#fff" : "#2EB872" },
            ]}
          >
            Passenger
          </Text>
        </TouchableOpacity>

        {/* Rider */}
        <TouchableOpacity
          style={[
            styles.modeBtn,
            { backgroundColor: selectedMode === "rider" ? "#2EB872" : "#fff" },
          ]}
          onPress={() => setSelectedMode("rider")}
        >
          <Text
            style={[
              styles.modeText,
              { color: selectedMode === "rider" ? "#fff" : "#2EB872" },
            ]}
          >
            Rider
          </Text>
        </TouchableOpacity>
      </View>

      {/* SHOW LOGIN / SIGNUP ONLY AFTER MODE SELECTED */}
      {selectedMode && (
        <View style={{ width: "100%", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => {
              if (selectedMode === "passenger") {
                router.push({ pathname: "/SignupScreen", params: { mode: "passenger" } });
              } else if (selectedMode === "rider") {
                router.push({ pathname: "/RiderSignupScreen", params: { mode: "rider" } });
              } else {
                alert("Please select a mode first");
              }
            }}
          >
            <Text style={styles.createText}>Create an account</Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() =>{
              if (selectedMode === "passenger") {
                router.push({ pathname: "/login", params: { mode: "passenger" } });
              } else if (selectedMode === "rider") {
                router.push({ pathname: "/DriverLogin", params: { mode: "rider" } });
              } else {
                alert("Please select a mode first");
              }}
            }
          >
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  image: { width: "85%", height: 260, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "700", color: "#333" },
  subtitle: { fontSize: 14, color: "#777", marginTop: 6, marginBottom: 30 },

  /* Mode Selection */
  modeContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  modeBtn: {
    width: "42%",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2EB872",
    alignItems: "center",
  },
  modeText: {
    fontSize: 16,
    fontWeight: "600",
  },

  createBtn: {
    width: "90%",
    backgroundColor: "#2EB872",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  createText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  loginBtn: {
    width: "90%",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#2EB872",
    alignItems: "center",
  },
  loginText: { color: "#2EB872", fontSize: 16, fontWeight: "600" },
});
