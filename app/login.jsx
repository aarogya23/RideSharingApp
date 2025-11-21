import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { Stack } from "expo-router";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Popup state
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success"); // success / error

  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8084/api/login", {
        identifier,
        password,
      });

      // Show success popup
      setPopupType("success");
      setPopupMessage("Login Successful!");
      setPopupVisible(true);

      // Close popup and redirect
      setTimeout(() => {
        setPopupVisible(false);
        navigation.navigate("home");
      }, 1500);

    } catch (error) {
      console.log(error);

      // Show error popup
      setPopupType("error");
      setPopupMessage("Invalid login credentials!");
      setPopupVisible(true);

      // Auto close popup
      setTimeout(() => {
        setPopupVisible(false);
      }, 1500);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>

      <Stack.Screen options={{ headerShown: false }} />
      {/* Popup */}
      {popupVisible && (
        <View style={styles.popupOverlay}>
          <View
            style={[
              styles.popupBox,
              popupType === "success" ? styles.successBox : styles.errorBox,
            ]}
          >
            <Text style={styles.popupText}>{popupMessage}</Text>
          </View>
        </View>
      )}

      {/* Back button */}
      <TouchableOpacity style={{ marginBottom: 20 }} onPress={handleBack}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        Sign in with your email or phone number
      </Text>

      <TextInput
        placeholder="Email or Phone Number"
        style={styles.input}
        value={identifier}
        onChangeText={setIdentifier}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Enter Your Password"
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={22}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={styles.socialBtn}>
        <Ionicons name="logo-google" size={20} color="#DB4437" />
        <Text style={styles.socialText}>Sign in with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialBtn}>
        <Ionicons name="logo-facebook" size={20} color="#1877F2" />
        <Text style={styles.socialText}>Sign in with Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialBtn}>
        <Ionicons name="logo-apple" size={20} color="black" />
        <Text style={styles.socialText}>Sign in with Apple</Text>
      </TouchableOpacity>

      <Text style={styles.bottomText}>
        Don’t have an account?
        <Text style={styles.signupText}> Sign Up</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#fff",
  },
  backText: {
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 25,
  },
  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  forgotText: {
    textAlign: "right",
    color: "red",
    marginBottom: 25,
  },
  button: {
    backgroundColor: "#1E9F4E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    marginHorizontal: 10,
    color: "#666",
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  socialText: {
    marginLeft: 10,
    fontSize: 16,
  },
  bottomText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
  },
  signupText: {
    color: "#1E9F4E",
    fontWeight: "600",
  },

  /* --- POPUP STYLES --- */
  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 999,
  },
  popupBox: {
    padding: 25,
    borderRadius: 12,
    minWidth: "70%",
    alignItems: "center",
  },
  successBox: {
    backgroundColor: "#D4F8D4",
    borderLeftWidth: 6,
    borderLeftColor: "#1E9F4E",
  },
  errorBox: {
    backgroundColor: "#FFD4D4",
    borderLeftWidth: 6,
    borderLeftColor: "#FF3B30",
  },
  popupText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
