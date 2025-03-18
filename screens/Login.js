import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from "../utils/ApiConfig";

export default function Login({ setIsLoggedIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/user/sign-in`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log("Response:", data);

            if (response.ok) {
                // Lưu token vào AsyncStorage
                await AsyncStorage.setItem('access_token', data.access_token);
                await AsyncStorage.setItem('refresh_token', data.refresh_token);
                await AsyncStorage.setItem('userId', data.user._id);
                await AsyncStorage.setItem('isLoggedIn', 'true');

                setIsLoggedIn(true);
                Alert.alert("Thành công", "Đăng nhập thành công!");
                navigation.navigate('Main', { screen: 'Home' })
            } else {
                Alert.alert("Lỗi", data.message || "Sai email hoặc mật khẩu!");
            }
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            Alert.alert("Lỗi", "Không thể kết nối đến máy chủ, vui lòng thử lại sau.");
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert("Lỗi", "Vui lòng nhập email để đặt lại mật khẩu!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/user/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert("Thông báo", data.message);
            } else {
                Alert.alert("Lỗi", data.message || "Có lỗi xảy ra, vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi khi gửi yêu cầu đặt lại mật khẩu:", error);
            Alert.alert("Lỗi", "Không thể kết nối đến máy chủ, vui lòng thử lại sau.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đăng nhập</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Đăng nhập</Text>
            </TouchableOpacity>

            {/* Thêm nút Đăng ký */}
            <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('SignupScreen')}>
                <Text style={styles.registerText}>Chưa có tài khoản? Đăng ký ngay</Text>
            </TouchableOpacity>

            {/* Nút quên mật khẩu */}
            <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '80%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15, paddingLeft: 10 },
    button: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, width: '80%', alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    registerButton: { marginTop: 15 },
    registerText: { color: '#007bff', fontSize: 16 },
    forgotPasswordButton: { marginTop: 15 },
    forgotPasswordText: { color: '#007bff', fontSize: 16 },
});
