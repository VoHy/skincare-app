import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { API_URL } from '../utils/ApiConfig';

const CategoryFilter = ({ selectedCategory, onSelectCategory, selectedBrand }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/category`);
        const data = await response.json();
        if (response.ok) {
          setCategories(data.data); 
        } else {
          throw new Error('Failed to load categories');
        }
      } catch (error) {
        setError(`An error occurred: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products based on selected category and brand
  const fetchProducts = async (category) => {
    setLoading(true);
    try {
      // Construct the API URL with category and brand filters
      let url = `${API_URL}/product/get-all?page=1&limit=10`;  // Set the limit and pagination as needed

      // Add category filter if selected
      if (category) {
        url += `&filter=category&value=${category}`;
      }

      // Add brand filter if selected
      if (selectedBrand) {
        url += `&filter=brand&value=${encodeURIComponent(selectedBrand)}`;
      }

      // Fetch products from the API
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Products Response:', data);

      if (response.ok) {
        if (data.data.length > 0) {
          setProducts(data.data);
        } else {
          console.log('No products found');
          setProducts([]);
        }
      } else {
        throw new Error('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    onSelectCategory(category);
    fetchProducts(category);
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
      {/* All Products Button */}
      <TouchableOpacity
        style={[styles.categoryButton, selectedCategory === '' && styles.selectedCategoryButton]}
        onPress={() => handleCategorySelect('')}
      >
        <Text style={[styles.categoryText, selectedCategory === '' && styles.selectedCategoryText]}>
          All Products
        </Text>
      </TouchableOpacity>

      {/* Render Categories */}
      <FlatList
        data={categories}
        horizontal
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === item.name && styles.selectedCategoryButton]}
            onPress={() => handleCategorySelect(item.name)}
          >
            <Text style={[styles.categoryText, selectedCategory === item.name && styles.selectedCategoryText]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Display Products */}
      {products.length === 0 ? (
        <Text style={styles.noProductsText}>No products found for this category or brand.</Text>
      ) : (
        <View style={styles.productsContainer}>
          <FlatList
            data={products}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  selectedCategoryButton: {
    backgroundColor: '#FF6F61',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  productsContainer: {
    marginTop: 20,
  },
  productItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  brandText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
    marginTop: 20,
  },
  noProductsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});

export default CategoryFilter;
