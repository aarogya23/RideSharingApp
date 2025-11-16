import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Illustration */}
      <Image
        source={require("../assets/icon.png")}
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Anywhere you are</Text>

      {/* Description */}
      <Text style={styles.description}>
        Sell houses easily with the help of Listenoryx and to make this line
        big I am writing more.
      </Text>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton}>
        <Ionicons name="arrow-forward" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  skipButton: {
    alignSelf: "flex-end",
  },
  skipText: {
    fontSize: 16,
    color: "#666",
  },

  illustration: {
    width: "100%",
    height: 250,
    marginTop: 30,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    color: "#000",
    textAlign: "center",
  },

  description: {
    color: "#777",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
    fontSize: 15,
  },

  nextButton: {
    position: "absolute",
    bottom: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#26C281",
    justifyContent: "center",
    alignItems: "center",
  },
});
