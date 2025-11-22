import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignupScreen() {
  const router = useRouter();

  const [country, setCountry] = useState({
    cca2: "Np",
    callingCode: ["977"],
  });

  //lets add the state to store Data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  // ----------------------------
  // SIGNUP API FUNCTION
  // ----------------------------
  const handleSignup = async () => {
    if (!name || !email || !password || !phone || !gender) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:8084/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          phoneNumber: phone,
          gender: gender,
        }),
      });

      const data = await response.text();

      if (!response.ok) {
        alert(data); 
        return;
      }

      alert("Signup successful!");
      router.push("/home");

    } catch (error) {
      alert("Network Error: " + error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>
        Sign up with your email or phone number
      </Text>

      {/* Inputs */}
      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      {/* Phone */}
      <View style={styles.phoneRow}>
        <Text style={styles.phoneCode}>+{country.callingCode[0]}</Text>

        <TextInput
          placeholder="Your mobile number"
          style={styles.phoneInput}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      {/* Gender */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setGender(gender === "Male" ? "Female" : "Male")}
      >
        <Text style={{ color: gender ? "#000" : "#777" }}>
          {gender || "Gender"}
        </Text>
      </TouchableOpacity>

      {/* Terms */}
      <Text style={styles.termsText}>
        ✔ By signing up, you agree to the{" "}
        <Text style={styles.link}>Terms of service</Text> and{" "}
        <Text style={styles.link}>Privacy policy</Text>.
      </Text>

      {/* Signup Button */}
      <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>or</Text>

      {/* Social Signup Buttons */}
      <TouchableOpacity style={styles.socialBtn}
      onPress={() => router.push("/GoogleLogin")}
      >
        <Image
          source={require("@/assets/images/Gmail.png")}
          style={styles.socialIcon}
        />
        <Text style={styles.socialText}>Sign up with Gmail</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialBtn}
        
      >
        <Image
          source={require("@/assets/images/Facebook.png")}
          style={styles.socialIcon}
        />
        <Text style={styles.socialText}>Sign up with Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialBtn}>
        <Image
          source={require("@/assets/images/Apple.png")}
          style={styles.socialIcon}
        />
        <Text style={styles.socialText}>Sign up with Apple</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Already have an account? <Text style={styles.link}>Sign in</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 32 
  },

  backRow: { 
    marginBottom: 20 
  },

  backText: { 
    fontSize: 16, 
    color: "#333" 
  },

  heading: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginBottom: 28, 
    lineHeight: 28 
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 12,
    marginBottom: 18,
    fontSize: 16,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 58,
    marginBottom: 18,
  },

  phoneCode: {
    fontSize: 16,
    marginRight: 10,
    color: "#444",
  },

  phoneInput: { 
    flex: 1, 
    fontSize: 16 
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },

  termsText: { 
    fontSize: 13, 
    color: "#555", 
    marginBottom: 25,
    lineHeight: 18
  },

  link: { 
    color: "#2EB872", 
    fontWeight: "600" 
  },

  signupBtn: {
    backgroundColor: "#2EB872",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  signupText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "700" 
  },

  orText: { 
    textAlign: "center", 
    color: "#666", 
    marginVertical: 12,
    fontSize: 14
  },

  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 16,
    borderRadius: 12,
    paddingHorizontal: 18,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },

  socialIcon: { 
    width: 26, 
    height: 26, 
    marginRight: 12 
  },

  socialText: { 
    fontSize: 15, 
    color: "#333", 
    fontWeight: "500" 
  },

  footerText: {
    textAlign: "center",
    marginTop: 25,
    color: "#333",
    fontSize: 14
  },
});
