import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function MessagePage() {
  const { userName, userPhone } = useLocalSearchParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [animValue] = useState(new Animated.Value(1));

  // For editing
  const [editingMessageId, setEditingMessageId] = useState(null);

  /* ================= GET MESSAGES ================= */
  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:8084/api/messages/${userName}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const result = await response.json();

      const formattedMessages = result.messages.map((msg) => ({
        id: msg.id.toString(),
        text: msg.content,
        sender: msg.sender,
        createdAt: msg.createdAt, // assuming API returns a createdAt field
      }));

      // Sort messages by date ascending (older first)
      formattedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setMessages(formattedMessages);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to load messages");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  /* ================= SEND / UPDATE MESSAGE ================= */
  const sendMessage = async () => {
    if (message.trim() === "") {
      Alert.alert("Validation", "Please write a message");
      return;
    }

    if (editingMessageId) {
      const payload = { content: message };

      try {
        const response = await fetch(
          `http://localhost:8084/api/messages/${editingMessageId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          Alert.alert("Error", errorText);
          return;
        }

        // Update locally
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === editingMessageId
              ? { ...msg, text: message, sender: "driver", createdAt: new Date().toISOString() }
              : msg
          )
        );

        setMessage("");
        setEditingMessageId(null);
      } catch (error) {
        Alert.alert("Error", "Failed to update message");
        console.log(error);
      }
    } else {
      const payload = {
        driverName: userName,
        sender: "driver",
        content: message,
      };

      try {
        const response = await fetch(
          "http://localhost:8084/api/messages/send",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          Alert.alert("Error", errorText);
          return;
        }

        const result = await response.json();

        animValue.setValue(0);

        setMessages((prev) => [
          ...prev,
          {
            id: result.data.id.toString(),
            text: result.data.content,
            sender: "driver",
            createdAt: new Date().toISOString(), // assume new message now
          },
        ]);

        setMessage("");

        Animated.spring(animValue, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        Alert.alert("Error", "Failed to send message");
        console.log(error);
      }
    }
  };

  /* ================= RENDER MESSAGE ================= */
  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: item.sender === "driver" ? "flex-end" : "flex-start",
          alignItems: "center",
          marginVertical: 4,
        }}
      >
        {/* Edit icon outside driver bubble */}
        {item.sender === "driver" && (
          <TouchableOpacity
            style={{ marginRight: 8 }}
            onPress={() => {
              setEditingMessageId(item.id);
              setMessage(item.text);
            }}
          >
            <Ionicons name="create-outline" size={20} color="#0A8F5B" />
          </TouchableOpacity>
        )}

        <View>
          <Animated.View
            style={[
              styles.messageBubble,
              item.sender === "driver" ? styles.driverBubble : styles.userBubble,
              { transform: [{ scale: animValue }], opacity: animValue },
            ]}
          >
            <Text
              style={[styles.messageText, item.sender === "driver" && { color: "#fff" }]}
            >
              {item.text}
            </Text>
          </Animated.View>

          {/* Date / Time below bubble */}
          <Text
            style={{
              fontSize: 10,
              color: "#555",
              marginTop: 2,
              alignSelf: item.sender === "driver" ? "flex-end" : "flex-start",
            }}
          >
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>

        {item.sender !== "driver" && <View style={{ width: 28 }} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{userName}</Text>
          <Text style={styles.headerSubTitle}>{userPhone}</Text>
        </View>

        <Ionicons name="call-outline" size={22} color="#fff" />
      </View>

      {/* ===== CHAT ===== */}
      <FlatList
        style={styles.chatContainer}
        data={messages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      {/* ===== INPUT ===== */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
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
  container: { flex: 1, backgroundColor: "#F3F3F3" },

  header: {
    height: Platform.OS === "web" ? 70 : 60,
    backgroundColor: "#0A8F5B",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 20 : 0,
  },

  headerTextContainer: { flex: 1, marginLeft: 12 },

  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  headerSubTitle: {
    color: "#E0F2EA",
    fontSize: 13,
    marginTop: 2,
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
