import React from "react";
import { View, Text, Button, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios"; // Gọi API

export default function PayScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { cart, total } = route.params; // Nhận giỏ hàng và tổng tiền từ params

    // Hàm gọi API thanh toán và xóa giỏ hàng nếu thành công
    const handlePayment = async (paymentMethod) => {
        try {
            let paymentData = {
                cart,
                total,
            };

            let response;
            switch (paymentMethod) {
                case "creditCard":
                    response = await axios.post("/api/payment/credit-card", paymentData);
                    break;
                case "eWallet":
                    response = await axios.post("/api/payment/e-wallet", paymentData);
                    break;
                case "cashOnDelivery":
                    response = await axios.post("/api/payment/cash-on-delivery", paymentData);
                    break;
                default:
                    throw new Error("Phương thức thanh toán không hợp lệ.");
            }

            if (response.status === 200) {
                Alert.alert("Thông báo", "Thanh toán thành công!");

                // Xóa giỏ hàng sau khi thanh toán thành công
                await AsyncStorage.removeItem("cart");

                // Chuyển sang màn hình trạng thái đơn hàng
                navigation.navigate("OrderStatusScreen");
            } else {
                Alert.alert("Lỗi", "Có lỗi xảy ra trong quá trình thanh toán.");
            }
        } catch (error) {
            console.error("Lỗi thanh toán:", error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi thanh toán.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Giỏ hàng của bạn:</Text>
            <Text style={styles.total}>Tổng tiền: {total} VND</Text>

            {cart.map((item, index) => (
                <Text key={index} style={styles.product}>
                    {item.name} - {item.quantity} x {item.price} VND
                </Text>
            ))}

            <Text style={styles.paymentMethodText}>Chọn phương thức thanh toán:</Text>

            <TouchableOpacity style={styles.paymentButton} onPress={() => handlePayment("creditCard")}>
                <Text style={styles.paymentButtonText}>Thanh toán qua thẻ tín dụng</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.paymentButton} onPress={() => handlePayment("eWallet")}>
                <Text style={styles.paymentButtonText}>Thanh toán qua ví điện tử</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.paymentButton} onPress={() => handlePayment("cashOnDelivery")}>
                <Text style={styles.paymentButtonText}>Thanh toán khi nhận hàng</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    total: { fontSize: 16, marginBottom: 10 },
    product: { fontSize: 14, marginBottom: 5 },
    paymentMethodText: { fontSize: 16, marginVertical: 10 },
    paymentButton: { backgroundColor: "#4CAF50", padding: 10, marginVertical: 5, borderRadius: 5 },
    paymentButtonText: { color: "#fff", textAlign: "center" },
});
