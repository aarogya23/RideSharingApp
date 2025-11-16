import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

// Onboarding Data
const slides = [
  {
    id: 1,
    title: "Anywhere you are",
    description: "Access your ride instantly from any location with a seamless and responsive mobile experience.",
    image: require("@/assets/images/ttt.png"),
  },
  {
    id: 2,
    title: "Find Your Perfect Home",
    description: "Connect with nearby drivers quickly and choose the ride that fits your comfort and budget.",
    image: require("@/assets/images/Frame 1.png"),
  },
  {
    id: 3,
    title: "Fast & Secure Deals",
    description: "Enjoy secure payments and a smooth ride-booking flow backed by reliable systems.",
    image: require("@/assets/images/At anytime.png"),
  },
];


export default function Onboarding() {
  const router = useRouter();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex); // Update state immediately
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      router.push("/Welcome");
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex); // Update state immediately
      flatListRef.current.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Skip */}
      <TouchableOpacity style={styles.skipButton} onPress={() => router.push("/Welcome")}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* FlatList Slides */}
      <FlatList
        data={slides}
        ref={flatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.illustration} resizeMode="contain" />

            <Text style={styles.title}>{item.title}</Text>

            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && { width: 20, backgroundColor: "#26C281" },
            ]}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {/* Back Button - Only show if not on first slide */}
        {currentIndex > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={goNext}>
          <Ionicons name="arrow-forward" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  slide: {
    width: width,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    color: "#666",
  },

  illustration: {
    width: "100%",
    height: 300,
    marginTop: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
    color: "#000",
    textAlign: "center",
  },

  description: {
    color: "#777",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
    fontSize: 15,
    paddingHorizontal: 20,
  },

  pagination: {
    flexDirection: "row",
    alignSelf: "center",
    marginBottom: 20,
  },

  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },

  navigationContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },

  backButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#26C281",
    justifyContent: "center",
    alignItems: "center",
  },

  nextButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#26C281",
    justifyContent: "center",
    alignItems: "center",
  },
});