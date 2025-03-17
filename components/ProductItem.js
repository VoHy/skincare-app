import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { AntDesign } from "@expo/vector-icons";

export default function ProductItem({ item, onPress, onFavorite, isFavorite }) {
  const currentDate = new Date();
  const endDate = new Date(item.discount?.end_date);
  const timeDiff = endDate - currentDate;
  const daysRemaining =
    timeDiff > 0 ? Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={() => onPress(item)}
    >
      {/* Ảnh sản phẩm */}
      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 && item.images[0] ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.image}
            resizeMode="cover"
            onError={() => console.log("Failed to load image")}
          />
        ) : (
          <View style={styles.noImageContainer}>
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}

        {/* Badge giảm giá */}
        {item.discount?.value > 0 && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>-{item.discount.value}%</Text>
          </View>
        )}
      </View>

      {/* Thông tin sản phẩm */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>

        {/* Hiển thị giá */}
        <View style={styles.priceContainer}>
          {item.discount?.value > 0 ? (
            <>
              <Text style={styles.oldPrice}>
                {item.price?.toLocaleString()}đ
              </Text>
              <Text style={styles.finalPrice}>
                {item.discount_price?.toLocaleString()}đ
              </Text>
            </>
          ) : (
            <Text style={styles.price}>{item.price?.toLocaleString()}đ</Text>
          )}
        </View>

        {/* Hiển thị số ngày còn lại và tiết kiệm */}
        {item.discount?.value > 0 && daysRemaining > 0 && (
          <Text style={styles.countdownText}>
            🔥 Còn {daysRemaining} ngày - Tiết kiệm{" "}
            {(((item.price - item.discount_price) / item.price) * 100).toFixed(
              0
            )}
            %
          </Text>
        )}
      </View>

      {/* Nút yêu thích */}
      <TouchableOpacity style={styles.favoriteButton} onPress={onFavorite}>
        <AntDesign
          name={isFavorite ? "heart" : "hearto"}
          size={24}
          color="red"
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    margin: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#eee",
  },
  imageContainer: {
    position: "relative",
    width: 130,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  noImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  noImageText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "bold",
  },
  infoContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    color: "#FF6F61",
    fontWeight: "bold",
  },
  oldPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: "gray",
    marginRight: 5,
  },
  finalPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "red",
  },
  featuredBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "rgba(255, 180, 0, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    zIndex: 10,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  countdownText: {
    fontSize: 12,
    color: "#FF4500",
    fontWeight: "bold",
    marginTop: 4,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 10,
  },
});
