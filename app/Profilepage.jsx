import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfilePage() {
  const [driver, setDriver] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [imageFile, setImageFile] = useState(null); // NEW: For file upload

  // ================= LOAD DRIVER =================
  useEffect(() => {
    const loadDriver = async () => {
      const stored = await AsyncStorage.getItem("driver");
      if (stored) {
        const parsed = JSON.parse(stored);
        setDriver(parsed);
        setEditData(parsed);
      }
    };
    loadDriver();
  }, []);

  if (!driver) {
    return (
      <View style={styles.loading}>
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  // ================= IMAGE UPLOAD =================
  const handleWebImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditData((prev) => ({
        ...prev,
        profileImageBase64: reader.result.split(",")[1],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleNativeImage = (file) => {
    // For React Native mobile: pass `file` from image picker
    setImageFile(file);
  };

  // ================= SAVE PROFILE =================
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("fullName", editData.fullName || "");
      formData.append("email", editData.email || "");
      formData.append("vehicleType", editData.vehicleType || "");
      formData.append("licenseNumber", editData.licenseNumber || "");

      if (imageFile) {
        const fileToSend =
          Platform.OS === "web"
            ? imageFile
            : {
                uri: imageFile.uri,
                name: imageFile.name || "profile.jpg",
                type: imageFile.type || "image/jpeg",
              };
        formData.append("profileImage", fileToSend);
      }

      const response = await fetch(
        `http://localhost:8084/api/driver/update/${driver.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Update failed");
        return;
      }

      const updatedDriver = result.driver;

      await AsyncStorage.setItem("driver", JSON.stringify(updatedDriver));

      setDriver(updatedDriver);
      setEditData(updatedDriver);
      setIsEditing(false);
      setImageFile(null);

      alert("Profile updated successfully!");
    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  // ================= IMAGE DISPLAY =================
  const displayedImage =
    editData.profileImageBase64
      ? `data:image/jpeg;base64,${editData.profileImageBase64}`
      : "https://via.placeholder.com/150";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollArea}>
        <Text style={styles.headerText}>My Profile</Text>

        <View style={styles.profileCard}>
          <Image source={{ uri: displayedImage }} style={styles.profileImage} />

          {/* WEB IMAGE INPUT */}
          {isEditing && Platform.OS === "web" && (
            <input
              type="file"
              accept="image/*"
              onChange={handleWebImage}
              style={{ marginBottom: 10 }}
            />
          )}

          {/* FULL NAME */}
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.fullName || ""}
              onChangeText={(text) =>
                setEditData({ ...editData, fullName: text })
              }
              placeholder="Full Name"
            />
          ) : (
            <Text style={styles.profileName}>{driver.fullName}</Text>
          )}

          {/* EMAIL */}
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.email || ""}
              onChangeText={(text) =>
                setEditData({ ...editData, email: text })
              }
              placeholder="Email"
            />
          ) : (
            <Text style={styles.profileEmail}>{driver.email}</Text>
          )}

          {/* VEHICLE */}
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.vehicleType || ""}
              onChangeText={(text) =>
                setEditData({ ...editData, vehicleType: text })
              }
              placeholder="Vehicle Type"
            />
          ) : (
            <Text style={styles.profileOther}>
              Vehicle: {driver.vehicleType}
            </Text>
          )}

          {/* LICENSE */}
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.licenseNumber || ""}
              onChangeText={(text) =>
                setEditData({ ...editData, licenseNumber: text })
              }
              placeholder="License Number"
            />
          ) : (
            <Text style={styles.profileOther}>
              License: {driver.licenseNumber}
            </Text>
          )}
        </View>

        {/* BUTTONS */}
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={22} color="#fff" />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setIsEditing(false);
                setEditData(driver);
                setImageFile(null);
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await AsyncStorage.removeItem("driver");
            alert("Logged out");
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#dc2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollArea: { padding: 20, paddingBottom: 120 },
  headerText: { fontSize: 22, fontWeight: "800", marginBottom: 15 },
  profileCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 12,
  },
  profileName: { fontSize: 18, fontWeight: "700" },
  profileEmail: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  profileOther: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  input: {
    width: "90%",
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    marginTop: 8,
  },
  editBtn: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  editText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  editRow: { flexDirection: "row", justifyContent: "space-between" },
  saveBtn: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  saveText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  cancelBtn: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 10,
    flex: 1,
  },
  cancelText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#ffe4e6",
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
  },
  logoutText: { color: "#dc2626", fontWeight: "700" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
