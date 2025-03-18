import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, TextInput, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../utils/ApiConfig";

export default function PayScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { cart, total } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        address: "",
        city: ""
    });

    // Hàm tính phí vận chuyển
    const calculateShippingPrice = (shippingAddress) => {
        if (shippingAddress.city === 'Hà Nội') {
            return 3000; // Phí cho Hà Nội
        } else if (shippingAddress.city === 'TP.HCM') {
            return 4000; // Phí cho TP.HCM
        }
        return 2000; // Phí mặc định
    };

    // Tính phí vận chuyển
    const shippingPrice = calculateShippingPrice(shippingAddress);

    // Hàm xử lý thanh toán
    const handlePayment = async () => {
        try {
            setIsLoading(true);
            const userId = await AsyncStorage.getItem("userId");
            const token = await AsyncStorage.getItem("access_token");

            if (!userId) {
                Alert.alert("Bạn cần đăng nhập để thanh toán!");
                return;
            }

            if (!token) {
                Alert.alert("Lỗi", "Không tìm thấy token xác thực.");
                return;
            }

            // Kiểm tra xem người dùng đã nhập đủ thông tin chưa
            if (!shippingAddress.address.trim() || !shippingAddress.city.trim()) {
                Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng");
                return;
            }

            // Chuẩn bị dữ liệu đơn hàng
            const orderData = {
                orderItems: cart.map(item => ({
                    amount: item.quantity,
                    product: item._id
                })),
                paymentMethod: "payOS",
                shippingAddress: {
                    address: shippingAddress.address,
                    city: shippingAddress.city
                },
                shippingPrice: shippingPrice,
                user: userId
            };

            console.log('Sending order data:', orderData);

            // Gọi API để tạo đơn hàng
            const orderResponse = await axios.post(`${API_URL}/order/create`, orderData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Order response:', orderResponse.data);

            if (orderResponse.data && orderResponse.data.data && orderResponse.data.data._id) {
                const orderId = orderResponse.data.data._id;

                console.log('Creating payment for order:', orderId);

                // Gọi API thanh toán
                const paymentResponse = await axios.post(`${API_URL}/payment/create`, { orderId }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Payment response:', paymentResponse.data);

                if (paymentResponse.data.status === "OK") {
                    // Xóa giỏ hàng sau khi tạo đơn hàng thành công
                    await AsyncStorage.removeItem(`cart_${userId}`);
                    
                    // Chuyển hướng đến trang thanh toán
                    const checkoutUrl = paymentResponse.data.data.checkoutUrl;
                    navigation.navigate("WebViewScreen", { 
                        url: checkoutUrl,
                        orderId: orderId
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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6F61" />
                <Text style={styles.loadingText}>Đang xử lý thanh toán...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Thông tin đơn hàng</Text>

            {/* Phần hiển thị sản phẩm */}
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

            {/* Phần nhập địa chỉ giao hàng */}
            <View style={styles.addressContainer}>
                <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập địa chỉ giao hàng"
                    value={shippingAddress.address}
                    onChangeText={(text) => setShippingAddress(prev => ({...prev, address: text}))}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Nhập thành phố"
                    value={shippingAddress.city}
                    onChangeText={(text) => setShippingAddress(prev => ({...prev, city: text}))}
                />
            </View>

            {/* Phần hiển thị tổng tiền và phí ship */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tổng tiền hàng:</Text>
                    <Text style={styles.summaryValue}>{total.toLocaleString()} VND</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
                    <Text style={styles.summaryValue}>{shippingPrice.toLocaleString()} VND</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tổng thanh toán:</Text>
                    <Text style={styles.summaryTotal}>{(total + shippingPrice).toLocaleString()} VND</Text>
                </View>
            </View>

            {/* Nút xác nhận thanh toán */}
            <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handlePayment}
            >
                <Text style={styles.confirmButtonText}>Xác nhận thanh toán</Text>
            </TouchableOpacity>
        </ScrollView>
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
    addressContainer: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333"
    },
    input: {
        backgroundColor: '#fff',
        height: 50,
        borderColor: "#ddd",
        borderWidth: 1,
        marginBottom: 15,
        padding: 15,
        borderRadius: 8,
        fontSize: 16,
    },
    summaryContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
    },
    summaryValue: {
        fontSize: 16,
        color: '#333',
    },
    summaryTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6F61',
    },
    confirmButton: {
        backgroundColor: '#FF6F61',
        padding: 15,
        borderRadius: 8,
        marginBottom: 30,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
