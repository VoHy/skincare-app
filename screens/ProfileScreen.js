import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/ApiConfig';

export default function ProfileScreen({ setIsLoggedIn }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const accessToken = await AsyncStorage.getItem('access_token');
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
        await AsyncStorage.removeItem('isLoggedIn');
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('userId');
        setIsLoggedIn(false);
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" />;
    }

    return (
        <View style={styles.container}>
            {user ? (
                <>
                    <Text style={styles.title}>Thông tin người dùng</Text>
                    <Text><Text style={styles.label}>Tên:</Text> {user.name}</Text>
                    <Text><Text style={styles.label}>Email:</Text> {user.email}</Text>
                    <Text><Text style={styles.label}>SĐT:</Text> {user.phone}</Text>
                    <Text><Text style={styles.label}>Quyền Admin:</Text> {user.isAdmin ? "Có" : "Không"}</Text>
                    <Text><Text style={styles.label}>Ngày tạo:</Text> {new Date(user.createdAt).toLocaleDateString()}</Text>
                    <Button title="Đăng xuất" onPress={handleLogout} />
                </>
            ) : (
                <Text style={styles.errorText}>Không thể tải thông tin người dùng</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    label: { fontWeight: 'bold' },
    errorText: { color: 'red', fontSize: 16 },
});
