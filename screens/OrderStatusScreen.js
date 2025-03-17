import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import axios from "axios";

export default function OrderStatusScreen() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get("https://mockapi.io/orders");
            setOrders(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy đơn hàng:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Trạng thái đơn hàng</Text>

            {orders.length === 0 ? (
                <Text>Chưa có đơn hàng nào</Text>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.orderItem}>
                            <Text>🛒 Đơn hàng #{item._id}</Text>
                            <Text>Tổng tiền: {item.total} VND</Text>
                            <Text>Phương thức: {item.paymentMethod}</Text>
                            <Text>Trạng thái: {item.status}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    orderItem: { backgroundColor: "#f5f5f5", padding: 10, marginVertical: 5, borderRadius: 5 },
});
