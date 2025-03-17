import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../utils/ApiConfig";
import ProductItem from "../components/ProductItem";
import Header from "../components/Header";

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState("");
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
          // Sắp xếp sản phẩm theo createdAt (mới nhất lên đầu)
          const sortedProducts = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setProducts(sortedProducts);
          setFilteredProducts(sortedProducts);

          // Lấy danh sách brand duy nhất
          const uniqueBrands = ["All", ...new Set(sortedProducts.map(product => product.brand).filter(Boolean))];
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

  // Lọc sản phẩm theo brand
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    if (brand === "All") {
      setFilteredProducts(products); // Hiển thị toàn bộ sản phẩm
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
      <Header onSearch={(searchText) => {
        const filtered = products.filter(item =>
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredProducts(filtered);
      }} />

      {/* Danh sách brand */}
      <FlatList
        data={[...brands]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.brandList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.brandButton, selectedBrand === item && styles.brandSelected]}
            onPress={() => handleBrandSelect(item)}
          >
            <Text style={[styles.brandText, selectedBrand === item && styles.brandTextSelected]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Danh sách sản phẩm */}
      {filteredProducts.length === 0 ? (
        <Text style={styles.emptyText}>No products available.</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          key={selectedBrand}
          keyExtractor={(item) => item._id.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <ProductItem
              item={item}
              onPress={() => navigation.navigate("DetailsScreen", { productId: item._id })}
            />
          )}
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
  brandList: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  brandButton: {
    minHeight: 40,
    maxHeight: 50,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF6F61",
    marginHorizontal: 5,
  },
  brandText: {
    fontSize: 14,
    color: "#FF6F61",
    textAlign: "center",
  },
  brandSelected: {
    backgroundColor: "#FF6F61",
  },
  brandTextSelected: {
    color: "#fff",
  },
});
