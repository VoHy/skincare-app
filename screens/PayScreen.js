import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../utils/ApiConfig";

export default function PayScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { cart, total } = route.params;
    const [isLoading, setIsLoading] = React.useState(false);

    // Hàm xử lý thanh toán
    const handlePayment = async () => {
        try {
            setIsLoading(true);
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) {
                Alert.alert("Bạn cần đăng nhập để thanh toán!");
                return;
            }

            // Chuẩn bị dữ liệu đơn hàng
            const orderData = {
                userId: userId,
                items: cart.map(item => ({
                    productId: item._id,
                    quantity: item.quantity,
                    price: item.price || item.discount_price,
                    name: item.name,
                })),
                totalAmount: total,
            };

            console.log('Sending order data:', orderData); // Log dữ liệu gửi đi

            // Gọi API để tạo đơn hàng
            const orderResponse = await axios.post(`${API_URL}/order/create`, orderData);
            console.log('Order response:', orderResponse.data); // Log phản hồi từ API

            if (orderResponse.data && orderResponse.data._id) { // Giả sử API trả về _id của đơn hàng
                const orderId = orderResponse.data._id;

                console.log('Creating payment for order:', orderId); // Log orderId

                // Gọi API thanh toán
                const paymentResponse = await axios.post(`${API_URL}/payment/create`, { orderId });
                console.log('Payment response:', paymentResponse.data); // Log phản hồi từ API thanh toán

                if (paymentResponse.data.status === "OK") {
                    // Xóa giỏ hàng sau khi tạo đơn hàng thành công
                    await AsyncStorage.removeItem(`cart_${userId}`);
                    
                    // Chuyển hướng đến trang thanh toán
                    const checkoutUrl = paymentResponse.data.data.checkoutUrl;
                    navigation.navigate("WebViewScreen", { 
                        url: checkoutUrl,
                        orderId: orderId // Truyền orderId để có thể sử dụng sau này
                    });
                } else {
                    throw new Error(paymentResponse.data.message || "Lỗi tạo thanh toán");
                }
            } else {
                throw new Error("Không nhận được mã đơn hàng");
            }
        } catch (error) {
            console.error("Chi tiết lỗi:", error.response?.data || error.message);
            Alert.alert(
                "Lỗi thanh toán",
                "Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại sau."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Gọi hàm thanh toán khi component được render
    React.useEffect(() => {
        handlePayment();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6F61" />
                <Text style={styles.loadingText}>Đang xử lý thanh toán...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Thông tin đơn hàng</Text>
            <Text style={styles.total}>Tổng tiền: {total.toLocaleString()} VND</Text>

            {cart.map((item, index) => (
                <View key={index} style={styles.productItem}>
                    {item.images && item.images[0] && (
                        <Image
                            source={{ uri: item.images[0] }}
                            style={styles.productImage}
                            resizeMode="contain"
                        />
                    )}
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productPrice}>
                            {item.quantity} x {(item.discount_price || item.price).toLocaleString()} VND
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20,
        backgroundColor: "#f9f9f9" 
    },
    header: { 
        fontSize: 22, 
        fontWeight: "bold", 
        marginBottom: 15,
        color: "#333" 
    },
    total: { 
        fontSize: 18, 
        marginBottom: 20,
        fontWeight: "bold",
        color: "#FF6F61" 
    },
    productItem: {
        flexDirection: "row",
        marginBottom: 15,
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    productImage: { 
        width: 60, 
        height: 60, 
        marginRight: 10 
    },
    productInfo: {
        flex: 1,
        justifyContent: "center"
    },
    productName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
        marginBottom: 5
    },
    productPrice: { 
        fontSize: 14, 
        color: "#666" 
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});
