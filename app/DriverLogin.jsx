import { Stack } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function DriverLogin() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [driver, setDriver] = useState(null);

  const handleSubmit = async () => {
    setError("");
    setDriver(null);

    if (!usernameOrEmail.trim()) {
      setError("Username or email is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8084/api/driver/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernameOrEmail: usernameOrEmail.trim(),
          password,
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        setError(text || "Login failed");
        setLoading(false);
        return;
      }

      const data = JSON.parse(text);
      setDriver(data.driver || data);
      setLoading(false);
    } catch (err) {
      setError("Network or server error.");
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.card}>
        <Text style={styles.title}>Driver Login</Text>

        <Text style={styles.label}>Username or Email</Text>
        <TextInput
          style={styles.input}
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
          placeholder="username or email"
        />

        <Text style={styles.label}>Password</Text>

        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="password"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.toggleBtn}
          >
            <Text style={styles.toggleText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.submit}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Login</Text>
          )}
        </TouchableOpacity>

        {driver && (
          <View style={styles.success}>
            <Text style={{ fontWeight: "bold" }}>Login successful!</Text>
            <Text>{JSON.stringify(driver, null, 2)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 10,
    color: "#374151",
  },
  input: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  toggleBtn: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 13,
    color: "#111827",
  },
  submit: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 8,
    marginTop: 15,
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  success: {
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
});
