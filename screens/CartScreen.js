import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function CartScreen() {
    const [cart, setCart] = useState([]);
    const [userId, setUserId] = useState(null);
    const navigation = useNavigation();

    // Lấy userId từ AsyncStorage
    const loadUserId = async () => {
        try {
            const storedUserId = await AsyncStorage.getItem("userId");
            setUserId(storedUserId);
        } catch (error) {
            console.error("Error loading userId:", error);
        }
    };

    // Load cart data từ AsyncStorage dựa trên userId
    const loadCart = useCallback(async () => {
        try {
            const userId = await AsyncStorage.getItem("userId"); // Lấy userId
            if (!userId) {
                setCart([]); // Nếu chưa đăng nhập, không hiển thị giỏ hàng
                return;
            }
            const storedCart = await AsyncStorage.getItem(`cart_${userId}`);
            console.log("Stored cart:", storedCart);
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        } catch (error) {
            console.error("Error loading cart:", error);
        }
    }, []);


    useFocusEffect(
        useCallback(() => {
            loadUserId().then(() => {
                loadCart();
            });
        }, [userId])
    );

    // xoa san pham khoi gio hang sau khi thanh toán 
    useEffect(() => {
        const fetchCart = async () => {
            const savedCart = await AsyncStorage.getItem("cart");
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        };
        fetchCart();
    }, []);

    // Save cart data theo userId
    const saveCart = async (updatedCart) => {
        try {
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) return; // Không lưu nếu chưa đăng nhập

            await AsyncStorage.setItem(`cart_${userId}`, JSON.stringify(updatedCart));
            setCart(updatedCart);
        } catch (error) {
            console.error("Error saving cart:", error);
        }
    };

    // Update số lượng sản phẩm
    const updateQuantity = async (_id, action) => {
        let updatedCart = cart
            .map((item) => {
                if (item._id === _id) {
                    const newQuantity = action === "increase" ? item.quantity + 1 : item.quantity - 1;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            })
            .filter((item) => item !== null);

        saveCart(updatedCart);
    };

    // Xóa toàn bộ giỏ hàng
    const clearCart = async () => {
        Alert.alert("Xóa giỏ hàng?", "Bạn có chắc muốn xóa toàn bộ giỏ hàng?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa",
                onPress: async () => {
                    setCart([]);
                    if (userId) {
                        await AsyncStorage.removeItem(`cart_${userId}`);
                    }
                },
            },
        ]);
    };

    // Tính tổng tiền
    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.discount_price && !isNaN(item.discount_price) ? item.discount_price : item.price;
            return total + price * item.quantity;
        }, 0);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Giỏ hàng</Text>

            {userId === null ? (
                <Text style={styles.emptyText}>Vui lòng đăng nhập để xem giỏ hàng.</Text>
            ) : cart.length === 0 ? (
                <Text style={styles.emptyText}>Giỏ hàng đang trống.</Text>
            ) : (
                <>
                    <FlatList
                        data={cart}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <View style={styles.item} key={item._id}>
                                <TouchableOpacity onPress={() => navigation.navigate("DetailsScreen", { productId: item._id })}>
                                    <Text style={styles.name}> {item.name}</Text>
                                    <Image
                                        source={{ uri: item.images?.[0] || "https://via.placeholder.com/150" }}
                                        style={styles.image}
                                    />
                                </TouchableOpacity>
                                <View style={styles.info}>
                                    <View style={styles.priceContainer}>
                                        {item.discount?.value > 0 ? (
                                            <>
                                                <Text style={styles.oldPrice}>{item.price?.toLocaleString()}đ</Text>
                                            </>
                                        ) : (
                                            <Text style={styles.price}>{item.price?.toLocaleString()}đ</Text>
                                        )}
                                    </View>
                                    {item.discount?.value > 0 && (
                                        <Text style={styles.discountText}>
                                            Giảm {item.discount.value}%
                                        </Text>
                                    )}
                                    <Text style={styles.finalPrice}>
                                        {(item.discount_price && !isNaN(item.discount_price) ? item.discount_price : 0).toLocaleString()}đ
                                    </Text>
                                    <View style={styles.quantityContainer}>
                                        <TouchableOpacity onPress={() => updateQuantity(item._id, "decrease")}>
                                            <Text style={styles.quantityButton}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.quantityText}>{item.quantity}</Text>
                                        <TouchableOpacity onPress={() => updateQuantity(item._id, "increase")}>
                                            <Text style={styles.quantityButton}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                    />
                    {cart.length >= 2 && (
                        <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
                            <Text style={styles.clearText}>Xóa tất cả</Text>
                        </TouchableOpacity>
                    )}
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalText}>
                            Tổng tiền: {calculateTotal().toLocaleString() || 0}đ
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.paymentButton}
                        onPress={() => navigation.navigate("PayScreen", { cart, total: calculateTotal() })}
                    >
                        <Text style={styles.paymentText}>Thanh toán</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
        color: "#333",
    },
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        color: "#888",
        marginTop: 20,
    },
    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    name: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        flex: 1,
        marginRight: 10,
        overflow: "hidden",
    },
    image: {
        width: 100,
        height: 100,
        resizeMode: "cover",
    },
    info: {
        alignItems: "flex-end",
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    price: {
        fontSize: 16,
        color: "#FF6F61",
        fontWeight: "bold",
    },
    oldPrice: {
        fontSize: 14,
        color: "#999",
        textDecorationLine: "line-through",
        marginRight: 6,
    },
    discountText: {
        fontSize: 14,
        color: "#FF6F61",
        marginTop: 4,
    },
    finalPrice: {
        fontSize: 18,
        color: "#FF3B30",
        fontWeight: "bold",
        marginTop: 4,
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        backgroundColor: "#f1f1f1",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 5,
    },
    quantityButton: {
        fontSize: 18,
        fontWeight: "bold",
        backgroundColor: "#FF6F61",
        color: "#fff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
        marginHorizontal: 6,
        textAlign: "center",
    },
    quantityText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    totalContainer: {
        marginTop: 25,
        alignItems: "center",
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    totalText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 12,
    },
    clearButton: {
        backgroundColor: "#FF3B30",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        width: "80%",
        alignSelf: "center",
        marginTop: 20,
    },
    clearText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        textTransform: "uppercase",
    },
    paymentButton: {
        marginTop: 20,
        backgroundColor: "#FF6F61",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        width: "80%",
        alignSelf: "center",
    },
    paymentText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
});
