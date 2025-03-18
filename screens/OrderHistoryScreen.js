import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../utils/ApiConfig";

export default function OrderHistoryScreen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const accessToken = await AsyncStorage.getItem("access_token");
            // console.log("Access token:", accessToken);

            if (!accessToken) {
                console.warn("Access token không hợp lệ");
                Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
                return;
            }

            const url = `${API_URL}/order/get-order-by-user`;
            // console.log("Fetching orders from:", url);

            const response = await fetch(url, {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
            });

            const textResponse = await response.text();
            // console.log("Response:", textResponse);

            const data = JSON.parse(textResponse);

            if (response.ok) {
                if (data && data.data) {
                    setOrders(Array.isArray(data.data) ? data.data : []);
                } else {
                    console.warn("Dữ liệu không hợp lệ:", data);
                    setOrders([]);
                }
            } else {
                console.warn("Lỗi khi lấy đơn hàng:", data.message);
                Alert.alert("Thông báo", "Chưa có đơn hàng nào.");
                setOrders([]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy đơn hàng:", error);
            Alert.alert("Lỗi", "Không thể lấy đơn hàng. Vui lòng kiểm tra lại.");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelivery = async (orderId) => {
        try {
            const accessToken = await AsyncStorage.getItem("access_token");
            const url = `${API_URL}/order/delivery-confirm/${orderId}`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Thành công", "Xác nhận đã nhận hàng thành công!");
                // Cập nhật lại danh sách đơn hàng
                fetchOrders();
            } else {
                Alert.alert("Lỗi", data.message || "Không thể xác nhận đơn hàng.");
            }
        } catch (error) {
            console.error("Lỗi khi xác nhận đơn hàng:", error);
            Alert.alert("Lỗi", "Không thể xác nhận đơn hàng. Vui lòng thử lại.");
        }
    };

  return (
        <View style={styles.container}>
            <Text style={styles.header}>Lịch Sử Đơn Hàng</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.orderItem}>
                            <View style={styles.orderHeader}>
                                <Text style={styles.orderId}>🛒 Đơn hàng #{item._id}</Text>
                                <Text style={[
                                    styles.statusBadge,
                                    item.isDelivered ? styles.statusDelivered : styles.statusPending
                                ]}>
                                    {item.isDelivered ? "Đã giao" : "Chưa giao"}
                                </Text>
                            </View>
                            
                            <View style={styles.orderDetails}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Tổng tiền:</Text>
                                    <Text style={styles.detailValue}>
                                        {item.totalPrice.toLocaleString('vi-VN')} VNĐ
                                    </Text>
                                </View>
                                
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Phương thức:</Text>
                                    <Text style={styles.detailValue}>{item.paymentMethod}</Text>
                                </View>
                                
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Ngày đặt:</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                    </Text>
                                </View>
                            </View>

                            {!item.isDelivered && (
                                <TouchableOpacity 
                                    style={styles.confirmButton}
                                    onPress={() => {
                                        Alert.alert(
                                            "Xác nhận đơn hàng",
                                            "Bạn đã nhận được đơn hàng này?",
                                            [
                                                {
                                                    text: "Hủy",
                                                    style: "cancel"
                                                },
                                                {
                                                    text: "Xác nhận",
                                                    onPress: () => confirmDelivery(item._id)
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <Text style={styles.confirmButtonText}>Xác nhận đã nhận hàng</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    contentContainerStyle={styles.listContainer}
                />
            )}
    </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 15,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
    },
    orderItem: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    orderId: {
        fontSize: 16,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '80%',
        fontWeight: '600',
        color: '#2c3e50',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        fontSize: 14,
        fontWeight: '500',
    },
    statusDelivered: {
        backgroundColor: '#d4edda',
        color: '#155724',
    },
    statusPending: {
        backgroundColor: '#fff3cd',
        color: '#856404',
    },
    orderDetails: {
        marginTop: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6c757d',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        color: '#2c3e50',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
    confirmButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});