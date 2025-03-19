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
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
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

                    const uniqueCategories = [
                        "All",
                        ...new Set(
                            sortedProducts
                                .filter(product => product.category && product.category.name)
                                .map(product => product.category.name)
                        ),
                    ];
                    setCategories(uniqueCategories);
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
                if (!Array.isArray(favorites)) {
                    favorites = [];
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

    useFocusEffect(
        React.useCallback(() => {
            fetchFavorites();
        }, [])
    );

    const handleBrandSelect = (brand) => {
        setSelectedBrand(brand);
        filterProducts(brand, selectedCategory);
    };

    const handleCategoryNameSelect = (category) => {
        setSelectedCategory(category);
        filterProducts(selectedBrand, category);
    };

    const filterProducts = (brand, category) => {
        let filtered = products;

        if (brand && brand !== "All") {
            filtered = filtered.filter(
                (product) =>
                    product.brand &&
                    typeof product.brand === "string" &&
                    product.brand.toLowerCase() === brand.toLowerCase()
            );
        }

        if (category && category !== "All") {
            filtered = filtered.filter(
                (product) =>
                    product.category &&
                    product.category.name &&
                    product.category.name.toLowerCase() === category.toLowerCase()
            );
        }

        setFilteredProducts(filtered);
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

            if (!Array.isArray(favorites)) {
                favorites = [];
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

            <Text style={styles.brandTitle}>Loại Sản Phẩm</Text>
            <View style={styles.brandContainer}>
                <FlatList
                    data={[...categories]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.brandList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.brandButton,
                                selectedCategory === item && styles.brandSelected,
                            ]}
                            onPress={() => handleCategoryNameSelect(item)}
                        >
                            <Text
                                style={[
                                    styles.brandText,
                                    selectedCategory === item && styles.brandTextSelected,
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.spacing} />

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
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: 15,
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
    brandTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginVertical: 12,
        color: "#333",
        paddingLeft: 5,
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