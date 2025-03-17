import React, { useState, useCallback } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";

export default function FavoriteScreen() {
    const [favorites, setFavorites] = useState([]);
    const navigation = useNavigation();

    // Tải danh sách yêu thích từ AsyncStorage khi màn hình được focus
    useFocusEffect(
        useCallback(() => {
            const loadFavorites = async () => {
                try {
                    const storedFavorites = await AsyncStorage.getItem("favorites");
                    console.log("Dữ liệu từ AsyncStorage:", storedFavorites);
                    const parsedFavorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    
                    // Kiểm tra nếu dữ liệu không phải mảng thì reset về []
                    setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);
                } catch (error) {
                    console.error("Error loading favorites:", error);
                }
            };
            loadFavorites();
        }, [])
    );
    

    // Thêm / xóa sản phẩm khỏi danh sách yêu thích
    const toggleFavorite = async (product) => {
        try {
            let storedFavorites = await AsyncStorage.getItem("favorites");
            let favoritesArray = storedFavorites ? JSON.parse(storedFavorites) : [];
    
            // Kiểm tra nếu sản phẩm đã tồn tại trong danh sách
            const index = favoritesArray.findIndex(item => item._id === product._id);
    
            if (index !== -1) {
                favoritesArray.splice(index, 1); // Nếu đã có, thì xóa
            } else {
                favoritesArray.push(product); // Nếu chưa có, thêm vào
            }
    
            // Lưu danh sách yêu thích dưới dạng mảng
            await AsyncStorage.setItem("favorites", JSON.stringify(favoritesArray));
            setFavorites(favoritesArray);
        } catch (error) {
            console.error("Lỗi khi cập nhật danh sách yêu thích:", error);
        }
    };
    

    // Xóa tất cả sản phẩm khỏi danh sách yêu thích
    const clearFavorites = async () => {
        Alert.alert(
            "Xóa tất cả?",
            "Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    onPress: async () => {
                        try {
                            setFavorites([]);
                            await AsyncStorage.removeItem("favorites");
                        } catch (error) {
                            console.error("Lỗi khi xóa danh sách yêu thích:", error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Danh sách yêu thích</Text>

            {favorites.length === 0 ? (
                <Text style={styles.emptyText}>Danh sách yêu thích đang trống.</Text>
            ) : (
                <>
                    <FlatList
                        data={favorites}
                        keyExtractor={(item) => item._id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.item}
                                onPress={() => navigation.navigate("DetailsScreen", { productId: item._id })}
                            >
                                <View style={styles.info}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.price}>{item.finalPrice.toLocaleString()}đ</Text>
                                </View>
                                <View style={styles.imageContainer}>
                                    <Image source={{ uri: item.image }} style={styles.image} />
                                    <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.favoriteButton}>
                                        <AntDesign
                                            name={favorites.some(fav => fav._id === item._id) ? "heart" : "hearto"}
                                            size={24}
                                            color={favorites.some(fav => fav._id === item._id) ? "red" : "white"}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        )}
                    />

                    {favorites.length >= 2 && (
                        <TouchableOpacity style={styles.clearButton} onPress={clearFavorites}>
                            <Text style={styles.clearText}>Xóa tất cả</Text>
                        </TouchableOpacity>
                    )}
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
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        color: "#777",
        marginTop: 20,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 10,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
    },
    price: {
        fontSize: 14,
        color: "#FF6F61",
    },
    clearButton: {
        backgroundColor: "#FF6F61",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    clearText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
});
