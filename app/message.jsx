import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function MessagePage() {
  const { userName } = useLocalSearchParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // 🔹 SEND MESSAGE (POST Mapping)
  const sendMessage = async () => {
    if (message.trim() === "") {
      Alert.alert("Validation", "Please write a message");
      return;
    }

    const payload = {
      driverName: userName,
      sender: "driver",
      content: message,
    };

    try {
      const response = await fetch("http://localhost:8084/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        Alert.alert("Error", errorText);
        return;
      }

      const result = await response.json();

      // Add message to UI after success
      setMessages((prev) => [
        ...prev,
        {
          id: result.data.id.toString(),
          text: result.data.content,
          sender: "driver",
        },
      ]);

      setMessage("");
    } catch (error) {
      Alert.alert("Error", "Failed to send message");
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{userName}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* CHAT MESSAGES */}
      <FlatList
        style={styles.chatContainer}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === "driver"
                ? styles.driverBubble
                : styles.userBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.sender === "driver" && { color: "#fff" },
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* INPUT BOX */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F3F3",
  },
  header: {
    height: Platform.OS === "web" ? 70 : 60,
    backgroundColor: "#0A8F5B",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 20 : 0,
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  driverBubble: {
    backgroundColor: "#0A8F5B",
    alignSelf: "flex-end",
  },
  userBubble: {
    backgroundColor: "#E0E0E0",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 14,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 16,
  },
  sendBtn: {
    backgroundColor: "#0A8F5B",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
