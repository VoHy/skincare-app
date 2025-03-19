import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, ScrollView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { API_URL } from "../utils/ApiConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from "react-native-vector-icons/FontAwesome";

const DetailsScreen = ({ route }) => {
    const { productId } = route.params;
    const navigation = useNavigation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);

    // Fetch product details
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productRes, feedbackRes] = await Promise.all([
                    fetch(`${API_URL}/product/details/${productId}`),
                    fetch(`${API_URL}/review/get-all/${productId}`)
                ]);

                const productData = await productRes.json();
                console.log(productData);
                const feedbackData = await feedbackRes.json();
                console.log(feedbackData);

                if (isMounted) {
                    if (productData?.data) {
                        setProduct(productData.data);
                        // Lấy sản phẩm có cùng danh mục
                        const relatedRes = await fetch(`${API_URL}/product/get-all/${productData.data.category._id}`);
                        const relatedData = await relatedRes.json();
                        setRelatedProducts(relatedData.data);
                    } else {
                        Alert.alert("Product not found");
                    }

                    if (feedbackData.status === "OK") {
                        setFeedbacks(feedbackData.data);
                    }
                }
            } catch (error) {
                Alert.alert("Error", error.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();

        return () => (isMounted = false);
    }, [productId]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: "row", marginRight: 10 }}>
                    <TouchableOpacity
                        onPress={async () => {
                            const userId = await AsyncStorage.getItem("userId");
                            if (!userId) {
                                Alert.alert("Thông báo", "Bạn cần đăng nhập để xem yêu thích.");
                            } else {
                                navigation.navigate("Main", { screen: "Favorites" });
                            }
                        }}
                        style={[styles.headerButton, { marginRight: 10 }]}
                    >
                        <Text style={styles.headerButtonText}>❤️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={async () => {
                            const userId = await AsyncStorage.getItem("userId");
                            if (!userId) {
                                Alert.alert("Thông báo", "Bạn cần đăng nhập để xem giỏ hàng.");
                            } else {
                                navigation.navigate("Main", { screen: "Cart" });
                            }
                        }}
                        style={styles.headerButton}
                    >
                        <Text style={styles.headerButtonText}>🛒</Text>
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            const checkFavoriteStatus = async () => {
                try {
                    const userId = await AsyncStorage.getItem("userId");
                    if (!userId) {
                        return;
                    }

                    const storedFavorites = await AsyncStorage.getItem(`favorites_${userId}`);
                    let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

                    // Đảm bảo favorites là một mảng
                    if (!Array.isArray(favorites)) {
                        favorites = [];
                    }

                    // Kiểm tra xem sản phẩm có trong danh sách yêu thích không
                    const isFav = favorites.some(item => item._id === productId);
                    setIsFavorite(isFav);
                } catch (error) {
                    console.error("Error loading favorites:", error);
                }
            };

            checkFavoriteStatus();
        }, [productId])
    );

    const toggleFavorite = async () => {
        try {
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) {
                Alert.alert("Thông báo", "Bạn cần đăng nhập để thêm vào yêu thích.");
                return;
            }

            const storedFavorites = await AsyncStorage.getItem(`favorites_${userId}`);
            let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

            // Đảm bảo favorites là một mảng
            if (!Array.isArray(favorites)) {
                favorites = [];
            }

            // Tìm sản phẩm trong danh sách yêu thích
            const index = favorites.findIndex(item => item._id === productId);

            // Toggle favorite status
            if (index !== -1) {
                // Sản phẩm đã tồn tại trong danh sách yêu thích, xóa nó
                favorites.splice(index, 1);
                setIsFavorite(false);
            } else {
                // Sản phẩm chưa có trong danh sách yêu thích, thêm vào
                favorites.push(product);
                setIsFavorite(true);
            }

            // Lưu danh sách yêu thích đã cập nhật
            await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));

            // Log để kiểm tra
            console.log("Favorite status toggled:", !isFavorite);
        } catch (error) {
            console.error("Error saving favorites:", error);
        }
    };

    // Add to cart functionality
    const addToCart = async () => {
        try {
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) {
                Alert.alert("Bạn cần đăng nhập để mua hàng!");
                return;
            }

            const cartKey = `cart_${userId}`;
            const cartItems = JSON.parse(await AsyncStorage.getItem(cartKey)) || [];

            const existingProduct = cartItems.find(item => item._id === product._id);
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cartItems.push({ ...product, quantity });
            }

            await AsyncStorage.setItem(cartKey, JSON.stringify(cartItems));
            Alert.alert("Đã thêm vào giỏ hàng!");
        } catch (error) {
            console.error("Lỗi giỏ hàng:", error);
        }
    };

    // If loading, show a loading indicator
    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    // If no product is found
    if (!product) {
        return <Text>No product found</Text>;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.infoContainer}>
                <Image
                    source={{ uri: product.images[0] || 'https://example.com/images/sunscreen.jpg' }}
                    style={styles.image}
                />
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.description}>{product.description}</Text>
                <Text style={styles.category}>{`Loại sản phẩm : ${product.category.name}`}</Text>

                <Text style={styles.stockText}>{`Số lượng còn lại: ${product.countInStock}`}</Text>

                <View style={styles.priceContainer}>
                    {product.discount?.value > 0 ? (
                        <>
                            <Text style={styles.oldPrice}>{product.price?.toLocaleString()}đ</Text>
                        </>
                    ) : (
                        <Text style={styles.price}>{product.price?.toLocaleString()}đ</Text>
                    )}
                </View>
                {product.discount?.value > 0 && (
                    <Text style={styles.discountText}>
                        Giảm {product.discount.value}% - {product.discount_price?.toLocaleString()}đ
                    </Text>
                )}

                <Text style={styles.skinTypes}>Loại da: {product.skin_types.join(', ')}</Text>

                <Text style={styles.sectionTitle}>Thành phần:</Text>
                <Text style={styles.ingredients}>{product.ingredients.join(', ')}</Text>
            </View>

            <View style={styles.imageContainer}>
                <Image source={{ uri: productId.image }} />
                <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
                    <Icon
                        name={isFavorite ? "heart" : "heart-o"}
                        size={24}
                        color={isFavorite ? "red" : "white"}
                    />
                </TouchableOpacity>
            </View>

            {/* Quantity Selector */}
            <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}>
                    <Text style={styles.quantityButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                    <Text style={styles.quantityButton}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity onPress={addToCart} style={styles.addToCartButton}>
                <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>

            {/* Hiển thị sản phẩm liên quan */}
            <View style={styles.relatedContainer}>
                <Text style={styles.sectionTitle}>Sản phẩm liên quan:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {relatedProducts.length > 0 ? (
                        relatedProducts
                            .filter(relatedProduct => relatedProduct._id !== productId)
                            .map((relatedProduct) => (
                                <TouchableOpacity
                                    key={relatedProduct._id}
                                    style={styles.relatedProductItem}
                                    onPress={() => navigation.navigate('DetailsScreen', { productId: relatedProduct._id })}
                                >
                                    <Image
                                        source={{ uri: relatedProduct.images[0] }}
                                        style={styles.relatedProductImage}
                                    />
                                    <Text style={styles.relatedProductName}>{relatedProduct.name}</Text>
                                </TouchableOpacity>
                            ))
                    ) : (
                        <Text style={styles.noRelatedProductsText}>Không có sản phẩm liên quan.</Text>
                    )}
                </ScrollView>
            </View>

            <View style={styles.feedbackContainer}>
                <Text style={styles.sectionTitle}>Feedback từ khách hàng:</Text>
                {feedbacks.length > 0 ? (
                    feedbacks.map((feedback, index) => (
                        <View key={index} style={styles.feedbackItem}>
                            <Text style={styles.feedbackUser}>{feedback.user.name || "Khách hàng ẩn danh"}</Text>
                            <Text style={styles.feedbackContent}>{feedback.comment}</Text>
                            <Text style={styles.feedbackRating}>⭐ {feedback.rating}/5</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noFeedbackText}>Chưa có đánh giá nào.</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#fff",
    },
    image: {
        width: "100%",
        height: 300,
        resizeMode: "cover",
    },
    favoriteButton: {
        position: "absolute",
        top: 20,
        right: 20,
        backgroundColor: "rgba(106, 48, 48, 0.8)",
        padding: 10,
        borderRadius: 20,
    },
    addToCartButton: {
        marginTop: 20,
        backgroundColor: "#FF6F61",
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 20,
        alignItems: "center",
    },
    addToCartText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
        justifyContent: "center",
    },
    quantityButton: {
        fontSize: 30,
        color: "#FF6F61",
        paddingHorizontal: 20,
    },
    quantityText: {
        fontSize: 20,
        color: "#333",
        paddingHorizontal: 10,
    },
    infoContainer: {
        padding: 20,
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    description: {
        fontSize: 14,
        color: "#666",
        marginBottom: 15,
    },
    category: {
        fontSize: 14,
        color: "#555",
        marginVertical: 5,
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    price: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FF6F61",
    },
    oldPrice: {
        fontSize: 16,
        textDecorationLine: "line-through",
        color: "#999",
        marginRight: 10,
    },
    discountText: {
        fontSize: 16,
        color: "#FF6F61",
        fontWeight: "bold",
        marginTop: 10,
    },
    skinTypes: {
        fontSize: 14,
        color: "#555",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 15,
        color: "#333",
    },
    ingredients: {
        fontSize: 14,
        color: "#666",
    },
    relatedContainer: {
        padding: 20,
    },
    relatedProductItem: {
        marginRight: 15,
        alignItems: "center",
    },
    relatedProductImage: {
        width: 100,
        height: 100,
        resizeMode: "cover",
        borderRadius: 10,
    },
    relatedProductName: {
        fontSize: 14,
        color: "#333",
        textAlign: "center",
        marginTop: 5,
    },
    noRelatedProductsText: {
        fontSize: 16,
        color: "#777",
        textAlign: "center",
    },
    feedbackContainer: {
        padding: 20,
        marginTop: 20,
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
    },
    feedbackItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    feedbackUser: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    feedbackContent: {
        fontSize: 14,
        color: "#555",
        marginTop: 5,
    },
    feedbackRating: {
        fontSize: 14,
        color: "#FF6F61",
        fontWeight: "bold",
        marginTop: 5,
    },
    noFeedbackText: {
        fontSize: 14,
        color: "#777",
        textAlign: "center",
    },
    stockText: {
        fontSize: 14,
        color: "#555",
        marginBottom: 10,
    },
    imageContainer: {
        position: "relative",
    },
});

export default DetailsScreen;