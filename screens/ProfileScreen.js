import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../utils/ApiConfig";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons'; // Nhập biểu tượng từ Expo
import { launchImageLibrary } from 'react-native-image-picker'; // Nhập thư viện chọn ảnh

export default function ProfileScreen({ setIsLoggedIn }) {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null); // Thêm state cho ảnh đại diện

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      if (!accessToken) {
        setLoading(false);
        return;
      }

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

  const handleLogout = async () => {
    await AsyncStorage.removeItem("isLoggedIn");
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    await AsyncStorage.removeItem("userId");
    setIsLoggedIn(false);
  };

  const handleUpdateUser = () => {
    navigation.navigate("UpdateUserScreen", { onUpdate: fetchUserData });
  };

  const handleUploadImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true, // Bao gồm base64 để gửi ảnh
    });

    if (result.didCancel) {
      console.log("Người dùng đã hủy chọn ảnh");
      return;
    }

    if (result.assets) {
      const imageData = result.assets[0].base64; // Lấy dữ liệu ảnh base64
      const accessToken = await AsyncStorage.getItem("access_token");

      try {
        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ image: imageData }), // Gửi dữ liệu ảnh
        });

        const data = await response.json();
        if (response.ok) {
          setProfileImage(data.imageUrl); // Giả sử API trả về URL của ảnh
          Alert.alert("Thành công", "Ảnh đã được upload thành công!");
        } else {
          Alert.alert("Lỗi", data.message || "Có lỗi xảy ra khi upload ảnh.");
        }
      } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
        Alert.alert("Lỗi", "Không thể upload ảnh. Vui lòng thử lại.");
      }
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" />;
  }

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.card}>
          <Text style={styles.title}>Thông tin người dùng</Text>
          <View style={styles.infoContainer}>
            <MaterialIcons name="person" size={24} color="#007bff" />
            <Text style={styles.infoText}>
              <Text style={styles.label}>Tên:</Text> {user.name}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <MaterialIcons name="email" size={24} color="#007bff" />
            <Text style={styles.infoText}>
              <Text style={styles.label}>Email:</Text> {user.email}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <MaterialIcons name="phone" size={24} color="#007bff" />
            <Text style={styles.infoText}>
              <Text style={styles.label}>SĐT:</Text> {user.phone}
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleUpdateUser}>
            <Text style={styles.buttonText}>Chỉnh sửa thông tin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("OrderHistoryScreen")}
          >
            <Text style={styles.buttonText}>Xem lịch sử đơn hàng</Text>
          </TouchableOpacity>
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
    width: "100%", // Căng hết chiều rộng
    alignItems: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 15,
  },
  infoContainer: {
    flexDirection: 'row', // Sắp xếp theo hàng
    alignItems: 'center', // Căn giữa theo chiều dọc
    marginBottom: 10,
  },
  infoText: {
    fontSize: 18,
    marginLeft: 10, // Khoảng cách giữa icon và text
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
    marginTop: 10,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
});