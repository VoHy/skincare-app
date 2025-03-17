import React from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function PayScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { cart, total } = route.params;

    const handlePayment = async () => {
        try {
            // Gọi API thanh toán ở đây
            const response = await fetch("https://your-api.com/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cart, total, paymentMethod: "VNPAY" })
            });

            const result = await response.json();
            if (response.ok) {
                Alert.alert("Thành công", "Thanh toán thành công!");
                navigation.navigate("CartScreen");
            } else {
                Alert.alert("Lỗi", result.message || "Thanh toán thất bại.");
            }
        } catch (error) {
            console.error("Payment error:", error);
            Alert.alert("Lỗi", "Có lỗi xảy ra, vui lòng thử lại.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thanh toán</Text>
            <Text style={styles.total}>Tổng tiền: {total.toLocaleString()}đ</Text>

            <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
                <Text style={styles.paymentText}>Xác nhận thanh toán</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
    total: { fontSize: 18, marginBottom: 30 },
    paymentButton: { backgroundColor: "blue", padding: 15, borderRadius: 10 },
    paymentText: { color: "white", fontWeight: "bold" },
});
