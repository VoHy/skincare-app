import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../utils/ApiConfig";
import ProductItem from "../components/ProductItem";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";


export default function ProductsScreen() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [favorites, setFavorites] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/product/get-all`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(`API Error: ${response.statusText}`);
                }

                if (data && Array.isArray(data.data)) {
                    const sortedProducts = data.data.sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    );

                    setProducts(sortedProducts);
                    setFilteredProducts(sortedProducts);

                    const uniqueBrands = [
                        "All",
                        ...new Set(
                            sortedProducts.map((product) => product.brand).filter(Boolean)
                        ),
                    ];
                    setBrands(uniqueBrands);
                } else {
                    setError("No products available.");
                }
            } catch (error) {
                setError(`An error occurred: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const fetchFavorites = async () => {
        try {
            const userId = await AsyncStorage.getItem("userId");
            if (userId) {
                const storedFavorites = await AsyncStorage.getItem(
                    `favorites_${userId}`
                );
                let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
                // Đảm bảo favorites là một mảng
                if (!Array.isArray(favorites)) {
                    favorites = []; // Khởi tạo lại nếu không phải là mảng
                }
                setFavorites(favorites);
            }
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    // Thêm useFocusEffect để gọi lại fetchFavorites khi quay lại HomeScreen
    useFocusEffect(
        React.useCallback(() => {
            fetchFavorites();
        }, [])
    );

    const handleBrandSelect = (brand) => {
        setSelectedBrand(brand);
        if (brand === "All") {
            setFilteredProducts(products);
        } else {
            const filteredByBrand = products.filter(
                (product) =>
                    product.brand &&
                    typeof product.brand === "string" &&
                    product.brand.toLowerCase() === brand.toLowerCase()
            );
            setFilteredProducts(filteredByBrand);
        }
    };

    const handleFavorite = async (productId) => {
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
                favorites = []; // Khởi tạo lại nếu không phải là mảng
            }

            const index = favorites.findIndex((item) => item._id === productId);
            if (index !== -1) {
                favorites.splice(index, 1);
            } else {
                const productToAdd = products.find((item) => item._id === productId);
                if (productToAdd) {
                    favorites.push(productToAdd);
                }
            }

            await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
            setFavorites(favorites);
        } catch (error) {
            console.error("Error saving favorites:", error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6F61" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header
                onSearch={(searchText) => {
                    const filtered = products.filter(
                        (item) =>
                            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                            item.brand.toLowerCase().includes(searchText.toLowerCase())
                    );
                    setFilteredProducts(filtered);
                }}
            />
            <Text style={styles.brandTitle}>Thương Hiệu</Text>
            <View style={styles.brandContainer}>
                <FlatList
                    data={[...brands]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.brandList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.brandButton,
                                selectedBrand === item && styles.brandSelected,
                            ]}
                            onPress={() => handleBrandSelect(item)}
                        >
                            <Text
                                style={[
                                    styles.brandText,
                                    selectedBrand === item && styles.brandTextSelected,
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.spacing} />

            {/* Danh sách sản phẩm */}
            {filteredProducts.length === 0 ? (
                <Text style={styles.emptyText}>No products available.</Text>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item._id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.productListContainer}
                    renderItem={({ item }) => {
                        const isFavorite = favorites.some((fav) => fav._id === item._id);
                        return (
                            <ProductItem
                                item={item}
                                onPress={() =>
                                    navigation.navigate("DetailsScreen", { productId: item._id })
                                }
                                onFavorite={() => handleFavorite(item._id)}
                                isFavorite={isFavorite}
                            />
                        );
                    }}
                />
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        color: "#777",
        marginTop: 20,
    },
    errorText: {
        textAlign: "center",
        fontSize: 16,
        color: "red",
        marginTop: 20,
    },
    adContainer: {
        width: "100%",
        height: 150,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 5,
        borderRadius: 10,
        overflow: "hidden",
    },
    adImage: {
        borderRadius: 10,
    },
    spacing: {
        height: 10,
    },
    brandContainer: {
        height: 60,
        marginBottom: 10,
    },
    brandList: {
        flexDirection: "row",
        paddingVertical: 5,
        paddingHorizontal: 5,
        justifyContent: "flex-start",
    },
    brandButton: {
        minHeight: 35,
        maxHeight: 40,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#FF6F61",
        marginHorizontal: 5,
    },
    brandText: {
        fontSize: 13,
        color: "#FF6F61",
        textAlign: "center",
    },
    brandSelected: {
        backgroundColor: "#FF6F61",
    },
    brandTextSelected: {
        color: "#fff",
    },
    productListContainer: {
        paddingTop: 10,
    },
});