import { Stack, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
      <Image
        source={require("@/assets/images/welcome-car.png")}
        
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Have a better sharing experience</Text>

      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => router.push("/SignupScreen")}
      >
        <Text style={styles.createText}>Create an account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginBtn}
       onPress={() => router.push("/login")}>
        <Text style={styles.loginText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    alignItems: "center", 
    justifyContent: "center", 
    paddingHorizontal: 20 
  },
  image: {
     width: "85%", 
     height: 260, 
     marginBottom: 20 
    },
  title: { 
    fontSize: 28, 
    fontWeight: "700", 
    color: "#333" 
  },
  subtitle: { 
    fontSize: 14, 
    color: "#777", 
    marginTop: 6, 
    marginBottom: 40 
  },
  createBtn: {
     width: "90%", 
     backgroundColor: "#2EB872", 
     paddingVertical: 14, 
     borderRadius: 10, 
     alignItems: "center", 
     marginBottom: 15 
    },
  createText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  loginBtn: { 
    width: "90%", 
    paddingVertical: 14, 
    borderRadius: 10, 
    borderWidth: 1.5, 
    borderColor: "#2EB872", 
    alignItems: "center" 
  },
  loginText: { 
    color: "#2EB872", 
    fontSize: 16, 
    fontWeight: "600" 
  },
});
