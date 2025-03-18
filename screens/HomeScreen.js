import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
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

export default function HomeScreen() {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [newestProducts, setNewestProducts] = useState([]);
  const [topPurchasedProducts, setTopPurchasedProducts] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchNewestProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/product/get-all/newest`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        if (Array.isArray(data)) {
          setNewestProducts(data);
        } else {
          console.error("Newest products data is not an array:", data);
          setNewestProducts([]);
        }
      } catch (error) {
        console.error(`Error fetching newest products: ${error.message}`);
        setNewestProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchTopPurchasedProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/product/get-all/top-purchased`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        if (Array.isArray(data)) {
          setTopPurchasedProducts(data);
        } else {
          console.error("Top purchased products data is not an array:", data);
        }
      } catch (error) {
        console.error(`Error fetching top purchased products: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNewestProducts();
    fetchTopPurchasedProducts();
  }, []);

  const fetchFavorites = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        const storedFavorites = await AsyncStorage.getItem(`favorites_${userId}`);
        let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
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

  const handleFavorite = async (productId) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để thêm vào yêu thích.");
        return;
      }

      const storedFavorites = await AsyncStorage.getItem(`favorites_${userId}`);
      let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

      const index = favorites.findIndex((item) => item._id === productId);
      if (index !== -1) {
        favorites.splice(index, 1);
      } else {
        const productToAdd = newestProducts.find((item) => item._id === productId) || topPurchasedProducts.find((item) => item._id === productId);
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
          const filtered = [...newestProducts, ...topPurchasedProducts].filter(
            (item) =>
              item.name.toLowerCase().includes(searchText.toLowerCase()) ||
              item.brand.toLowerCase().includes(searchText.toLowerCase())
          );
          setFilteredProducts(filtered);
        }}
      />

      <ImageBackground
        source={{
          uri: "https://cdn.happyskin.vn/media/54/cham-soc-lan-da-nang-tam-ve-dep.jpg",
        }}
        style={styles.adContainer}
        imageStyle={styles.adImage}
      />

      <View style={styles.spacing} />

      <Text style={styles.sectionTitle}>Sản phẩm mới</Text>
      <FlatList
        data={newestProducts}
        keyExtractor={(item) => item._id.toString()}
        numColumns={2}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductItem
            item={item}
            onPress={() =>
              navigation.navigate("DetailsScreen", { productId: item._id })
            }
            onFavorite={() => handleFavorite(item._id)}
            isFavorite={favorites.some((fav) => fav._id === item._id)}
          />
        )}
      />

      <View style={styles.spacing} />

      <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
      <FlatList
        data={topPurchasedProducts}
        keyExtractor={(item) => item._id.toString()}
        numColumns={2}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProductItem
            item={item.product}
            onPress={() =>
              navigation.navigate("DetailsScreen", { productId: item._id })
            }
            onFavorite={() => handleFavorite(item._id)}
            isFavorite={favorites.some((fav) => fav._id === item._id)}
          />
        )}
      />

      <View style={styles.spacing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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
    marginBottom: 10,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  adImage: {
    borderRadius: 10,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  spacing: {
    height: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
});
