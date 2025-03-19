import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
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
            (item?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
              item?.brand?.name?.toLowerCase().includes(searchText.toLowerCase()))
          );
          setFilteredProducts(filtered);
        }}
      />
      <View style={styles.spacing} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={{
            uri: "https://cdn.happyskin.vn/media/54/cham-soc-lan-da-nang-tam-ve-dep.jpg",
          }}
          style={styles.adContainer}
          imageStyle={styles.adImage}
        />

        <View style={styles.spacing} />

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sản phẩm mới</Text>
          <FlatList
            data={newestProducts}
            keyExtractor={(item) => item._id.toString()}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
            renderItem={({ item }) => (
              <View style={styles.productItemContainer}>
                <ProductItem
                  item={item}
                  onPress={() =>
                    navigation.navigate("DetailsScreen", { productId: item._id })
                  }
                  onFavorite={() => handleFavorite(item._id)}
                  isFavorite={favorites.some((fav) => fav._id === item._id)}
                />
              </View>
            )}
          />
          <View style={styles.spacing} />
          <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
          <FlatList
            data={topPurchasedProducts}
            keyExtractor={(item) => item._id.toString()}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
            renderItem={({ item }) => (
              <View style={styles.productItemContainer}>
                <View style={styles.purchaseCountContainer}>
                  <Text style={styles.purchaseCountText}>Đã bán: {item.totalPurchased}</Text>
                </View>
                <ProductItem
                  item={item.product}
                  onPress={() =>
                    navigation.navigate("DetailsScreen", { productId: item._id })
                  }
                  onFavorite={() => handleFavorite(item._id)}
                  isFavorite={favorites.some((fav) => fav._id === item._id)}
                />
              </View>
            )}
          />

        </View>

        <View style={styles.spacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
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
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  adImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 15,
  },
  spacing: {
    height: 15,
  },
  sectionContainer: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 12,
    color: "#333",
    paddingLeft: 5,
  },
  productList: {
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  purchaseCountContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 111, 97, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  purchaseCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productItemContainer: {
    marginHorizontal: 8,
    borderRadius: 12,
    width: 180,
    height: 280,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
});
