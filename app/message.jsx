import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";


const BASE_URL = "http://localhost:8084"; // Local host IP from spring boot

export default function MessagePage() {
  const { userName, userPhone } = useLocalSearchParams();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [animValue] = useState(new Animated.Value(1));

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [menuVisibleId, setMenuVisibleId] = useState(null);

  /* ================= GET MESSAGES ================= */
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/messages/${userName}`);
      if (!response.ok) throw new Error("Failed to fetch messages");

      const result = await response.json();
      const formattedMessages = result.messages.map((msg) => ({
        id: msg.id.toString(),
        text: msg.content,
        sender: msg.sender,
        createdAt: msg.createdAt,
      }));

      formattedMessages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      setMessages(formattedMessages);
    } catch (error) {
      Alert.alert("Error", "Unable to load messages");
      console.log(error);
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

    // UPDATE
    if (editingMessageId) {
      try {
        const response = await fetch(
          `${BASE_URL}/api/messages/${editingMessageId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: message }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          Alert.alert("Error", errorText);
          return;
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === editingMessageId.toString()
              ? { ...msg, text: message }
              : msg
          )
        );

        setMessage("");
        setEditingMessageId(null);
      } catch (error) {
        Alert.alert("Error", "Failed to update message");
        console.log(error);
      }
    }
    // SEND
    else {
      try {
        const response = await fetch(`${BASE_URL}/api/messages/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driverName: userName,
            sender: "driver",
            content: message,
          }),
        });

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
            createdAt: new Date().toISOString(),
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

  //lets add deletemapping api in thi application

/* ================= DELETE MESSAGE ================= */
  const deleteMessage = (id) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Deleting message id:", id);
              const response = await fetch(`${BASE_URL}/api/messages/${id}`, {
                method: "DELETE",
              });

              if (!response.ok) {
                const errorText = await response.text();
                Alert.alert("Error", errorText);
                return;
              }

              setMessages((prev) =>
                prev.filter((msg) => msg.id !== id.toString())
              );
              setMenuVisibleId(null);
            } catch (error) {
              Alert.alert("Error", "Failed to delete message");
              console.log(error);
            }
          },
        },
      ]
    );
  };


  /* ================= RENDER MESSAGE ================= */
  const renderItem = ({ item, index }) => {
    const isLast = index === messages.length - 1;

    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent:
            item.sender === "driver" ? "flex-end" : "flex-start",
          marginVertical: 4,
        }}
      >
        {item.sender === "driver" && (
          <View style={{ marginRight: 6 }}>
            <TouchableOpacity
              onPress={() =>
                setMenuVisibleId(menuVisibleId === item.id ? null : item.id)
              }
            >
              <Ionicons name="ellipsis-vertical" size={18} color="#0A8F5B" />
            </TouchableOpacity>

            {menuVisibleId === item.id && (
              <View style={styles.menu}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setEditingMessageId(item.id);
                    setMessage(item.text);
                    setMenuVisibleId(null);
                  }}
                >
                  <Text>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => deleteMessage(item.id)}
                >
                  <Text style={{ color: "red" }}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View>
          <Animated.View
            style={[
              styles.messageBubble,
              item.sender === "driver"
                ? styles.driverBubble
                : styles.userBubble,
              { transform: [{ scale: animValue }] },
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
          </Animated.View>

          {isLast && (
            <Text style={styles.timeText}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.headerTitle}>{userName}</Text>
          <Text style={styles.headerSubTitle}>{userPhone}</Text>
        </View>
      </View>

      {/* CHAT */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={
            editingMessageId ? "Edit your message..." : "Type a message..."
          }
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F3F3" },
  header: {
    height: 60,
    backgroundColor: "#0A8F5B",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  headerSubTitle: { color: "#DFF5EC", fontSize: 12 },
  messageBubble: { maxWidth: "80%", padding: 10, borderRadius: 10 },
  driverBubble: { backgroundColor: "#0A8F5B" },
  userBubble: { backgroundColor: "#E0E0E0" },
  messageText: { fontSize: 14 },
  timeText: { fontSize: 10, color: "#555", marginTop: 2 },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  sendBtn: {
    backgroundColor: "#0A8F5B",
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  menu: {
    position: "absolute",
    top: 18,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 6,
    elevation: 4,
  },
  menuItem: { padding: 8 },
});
