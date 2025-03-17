import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../utils/ApiConfig";

export default function ProfileScreen({ setIsLoggedIn }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        if (!accessToken) {
          setLoading(false);
          return;
        }

        // Gọi API lấy thông tin user
        const response = await fetch(`${API_URL}/user/getMe`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await response.json();
        if (response.ok && data.status === "SUCCESS") {
          setUser(data.data);
        } else {
          console.warn("Lỗi khi lấy dữ liệu:", data.message);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("isLoggedIn");
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    await AsyncStorage.removeItem("userId");
    setIsLoggedIn(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" />;
  }

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.card}>
          <Text style={styles.title}>Thông tin người dùng</Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Tên:</Text> {user.name}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Email:</Text> {user.email}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>SĐT:</Text> {user.phone}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Quyền Admin:</Text>{" "}
            {user.isAdmin ? "Có" : "Không"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Ngày tạo:</Text>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.errorText}>Không thể tải thông tin người dùng</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    width: "90%",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 8,
    color: "#333",
  },
  label: {
    fontWeight: "bold",
    color: "#555",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#d9534f",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    shadowColor: "#d9534f",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
