import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../utils/ApiConfig";
import ProductItem from "../components/ProductItem";
import Header from "../components/Header";
import CategoryFilter from "../components/CategoryFilter";

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigation = useNavigation();

  // Fetch all products from the API when the screen is loaded
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/product/get-all`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        if (data && Array.isArray(data.data)) {
          setProducts(data.data);
          setFilteredProducts(data.data);  
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

  const handleSearch = (searchText) => {
    const filteredProducts = products.filter((item) => {
      const category = item.category;
      if (category && typeof category === "string") {
        return (
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchText.toLowerCase()) ||
          category.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      return (
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredProducts(filteredProducts); 
  };

  // Handle category selection
  const handleBrandSelect = (brand) => {
    setSelectedCategory(brand);
    if (brand === "") {
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

  // Loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6F61" />
      </View>
    );
  }

  // Error handling
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onSearch={handleSearch} /> 

      {/* Category Filter */}
      {/* <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={handleBrandSelect}
      /> */}

      {filteredProducts.length === 0 ? (
        <Text style={styles.emptyText}>No products available at the moment.</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <ProductItem
              item={item}
              onPress={() => {
                console.log('Navigating with product ID:', item._id);
                navigation.navigate("DetailsScreen", { productId: item._id });
              }}
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
});