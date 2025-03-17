import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function FavoriteScreen() {
  const [favorites, setFavorites] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Tải userId từ AsyncStorage
  const loadUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      console.log("Stored userId:", storedUserId);
      setUserId(storedUserId);
    } catch (error) {
      console.error("Error loading userId:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách yêu thích từ AsyncStorage dựa trên userId
  const loadFavorites = useCallback(async () => {
    if (!userId) {
      setFavorites([]); // Clear favorites if no userId
      return;
    }
    try {
      const storedFavorites = await AsyncStorage.getItem(`favorites_${userId}`);
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadUserId().then(() => {
        loadFavorites();
      });
    }, [userId])
  );

  // Kiểm tra trạng thái đăng nhập trước khi thực hiện toggle
  const toggleFavorite = async (product) => {
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

      const index = favorites.findIndex((item) => item._id === product._id);
      if (index !== -1) {
        // Nếu sản phẩm đã tồn tại, xóa nó khỏi danh sách yêu thích
        favorites.splice(index, 1);
      } else {
        // Nếu sản phẩm không tồn tại, thêm nó vào danh sách yêu thích
        favorites.push(product);
      }

      // Lưu danh sách yêu thích đã cập nhật cho người dùng
      await AsyncStorage.setItem(
        `favorites_${userId}`,
        JSON.stringify(favorites)
      );
      setFavorites(favorites); // Cập nhật trạng thái local
    } catch (error) {
      console.error("Error saving favorites:", error);
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
              if (!userId) {
                Alert.alert(
                  "Thông báo",
                  "Bạn cần đăng nhập để xóa danh sách yêu thích."
                );
                return;
              }
              setFavorites([]); // Reset danh sách yêu thích
              await AsyncStorage.removeItem(`favorites_${userId}`);
            } catch (error) {
              console.error("Lỗi khi xóa danh sách yêu thích:", error);
            }
          },
        },
      ]
    );
  };

  const renderFavoriteItem = ({ item }) => (
    <View style={styles.favoriteItem}>
      <Image source={{ uri: item.images[0] }} style={styles.image} />
      <View style={styles.details}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("DetailsScreen", { productId: item._id })
          }
        >
          <Text style={styles.name}>{item.name}</Text>
        </TouchableOpacity>

        <Text style={styles.price}>
          Giá: {item.discount_price.toLocaleString()} VND
        </Text>
        <Text style={styles.originalPrice}>
          Giá gốc: {item.price.toLocaleString()} VND
        </Text>
        <TouchableOpacity onPress={() => toggleFavorite(item)}>
          <AntDesign
            name={
              favorites.find((fav) => fav._id === item._id) ? "heart" : "hearto"
            }
            size={24}
            color="red"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <Text>Đang tải...</Text>;
  }

  return (
    <View style={styles.container}>
      {userId ? ( // Kiểm tra xem userId có tồn tại không
        favorites.length > 0 ? (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item._id}
            renderItem={renderFavoriteItem}
          />
        ) : (
          <Text style={styles.noFavoritesText}>
            Bạn chưa có sản phẩm yêu thích nào!
          </Text>
        )
      ) : (
        <Text style={styles.noFavoritesText}>
          Bạn cần đăng nhập để xem sản phẩm yêu thích!
        </Text>
      )}
      {favorites.length >= 2 && (
        <TouchableOpacity onPress={clearFavorites} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Xóa tất cả</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  favoriteItem: {
    flexDirection: "row",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 15,
    borderRadius: 8,
  },
  details: {
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    color: "green",
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "gray",
  },
  noFavoritesText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    color: "gray",
  },
  clearButton: {
    marginTop: 20,
    backgroundColor: "#f00",
    padding: 10,
    borderRadius: 5,
  },
  clearButtonText: {
    color: "#fff",
    textAlign: "center",
  },
});
