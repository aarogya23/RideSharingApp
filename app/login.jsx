import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as Google from "expo-auth-session/providers/google";
import { Stack, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

const BASE_URL = "http://localhost:8084"; // 🔴 CHANGE TO YOUR PC IP

export default function Login() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  /* ================= GOOGLE AUTH ================= */
  const [googleRequest, googleResponse, googlePromptAsync] =
    Google.useAuthRequest({
      clientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    });

  useEffect(() => {
    if (googleResponse?.type === "success") {
      handleSocialLogin("google", googleResponse.authentication.accessToken);
    }
  }, [googleResponse]);

  /* ================= FACEBOOK AUTH ================= */
  const [fbRequest, fbResponse, fbPromptAsync] =
    Facebook.useAuthRequest({
      clientId: "YOUR_FACEBOOK_APP_ID",
    });

  useEffect(() => {
    if (fbResponse?.type === "success") {
      handleSocialLogin("facebook", fbResponse.authentication.accessToken);
    }
  }, [fbResponse]);

  /* ================= COMMON FUNCTIONS ================= */

  const showPopup = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setPopupVisible(true);
    setTimeout(() => setPopupVisible(false), 1500);
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      showPopup("Please enter credentials", "error");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/login`, {
        identifier,
        password,
      });

      console.log("USER FROM API:", res.data.user);
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

      showPopup("Login successful 🎉");
      setTimeout(() => router.replace("/home"), 1200);

    } catch (err) {
      showPopup(
        err.response?.data?.error || "Login failed",
        "error"
      );
    }
  };

  const handleSocialLogin = async (provider, token) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/social-login`, {
        provider,
        token,
      });

      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

      showPopup(`${provider} login successful 🎉`);
      setTimeout(() => router.replace("/home"), 1200);

    } catch (err) {
      showPopup("Social login failed", "error");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ================= BACK BUTTON ================= */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={26} color="#333" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* ================= POPUP ================= */}
      {popupVisible && (
        <View style={styles.popupOverlay}>
          <View
            style={[
              styles.popupBox,
              popupType === "success"
                ? styles.successBox
                : styles.errorBox,
            ]}
          >
            <Text style={styles.popupText}>{popupMessage}</Text>
          </View>
        </View>
      )}

      <Text style={styles.title}>Sign In</Text>

      <TextInput
        placeholder="Email or Username"
        style={styles.input}
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      {/* ================= DIVIDER ================= */}
      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>

      {/* ================= GOOGLE ================= */}
      <TouchableOpacity
        style={styles.socialBtn}
        disabled={!googleRequest}
        onPress={() => googlePromptAsync()}
      >
        <Ionicons name="logo-google" size={20} color="#DB4437" />
        <Text style={styles.socialText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* ================= FACEBOOK ================= */}
      <TouchableOpacity
        style={styles.socialBtn}
        disabled={!fbRequest}
        onPress={() => fbPromptAsync()}
      >
        <Ionicons name="logo-facebook" size={20} color="#1877F2" />
        <Text style={styles.socialText}>Continue with Facebook</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#fff",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  passwordInput: {
    flex: 1,
    height: 50,
  },
  button: {
    backgroundColor: "#1E9F4E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
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
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  socialText: {
    marginLeft: 10,
    fontSize: 16,
  },
  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  popupBox: {
    padding: 25,
    borderRadius: 12,
    minWidth: "70%",
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
