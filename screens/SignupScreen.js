import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { API_URL } from "../utils/ApiConfig";

export default function SignUpScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');

    const handleSignUp = async () => {
        console.log("Dữ liệu nhập vào:", { name, email, password, confirmPassword, phone });

        if (!name || !email || !password || !confirmPassword || !phone) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/user/sign-up`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone, confirmPassword }), // Đảm bảo gửi đầy đủ dữ liệu
            });

            const data = await response.json();
            console.log("Phản hồi từ server:", data);

            if (response.ok) {
                Alert.alert("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.");
                navigation.navigate("Login");
            } else {
                Alert.alert("Lỗi", data.message || "Đăng ký thất bại!");
            }
        } catch (error) {
            console.log("Lỗi kết nối:", error);
            Alert.alert("Lỗi", "Không thể kết nối đến máy chủ.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đăng ký</Text>
            <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Đăng ký</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.registerText}>Đã có tài khoản? Đăng nhập ngay</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '80%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15, paddingLeft: 10 },
    button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, width: '80%', alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
