import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/ApiConfig';
import { useNavigation, useRoute } from '@react-navigation/native'; // Nhập useRoute

export default function UpdateUserScreen() {
  const navigation = useNavigation();
  const route = useRoute(); // Khai báo route
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        const response = await fetch(`${API_URL}/user/getMe`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await response.json();
        if (response.ok && data.status === 'SUCCESS') {
          setName(data.data.name);
          setPhone(data.data.phone);
          setEmail(data.data.email);
          setIsAdmin(data.data.isAdmin);
          setCreatedAt(new Date(data.data.createdAt).toLocaleDateString());
        } else {
          console.warn('Lỗi khi lấy dữ liệu:', data.message);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateUser = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/user/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name, phone }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Thông báo', 'Cập nhật thông tin thành công!', [
          { text: 'OK', onPress: () => {
            navigation.goBack();
            route.params.onUpdate(); // Gọi callback để cập nhật thông tin
          }},
        ]);
      } else {
        Alert.alert('Thông báo', data.message || 'Cập nhật không thành công.');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cập nhật thông tin</Text>
      <Text style={styles.label}>Tên: {name}</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nhập tên mới"
      />
      <Text style={styles.label}>Số điện thoại: {phone}</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Nhập số điện thoại mới"
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Email: {email}</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder='Nhập email mới'
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateUser}>
        <Text style={styles.buttonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});