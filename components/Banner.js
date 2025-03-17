import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { SliderBox } from "react-native-image-slider-box";

// Lấy chiều rộng màn hình
const { width } = Dimensions.get("window");

export default function Banner() {
  const slides = [
    "https://via.placeholder.com/600/92c952",
    "https://via.placeholder.com/600/771796",
    "https://via.placeholder.com/600/24f355",
  ];

  return (
    <View style={styles.container}>
      <SliderBox
        images={slides}
        autoplay={true} // Tự động chuyển ảnh
        circleLoop={true} // Lặp lại slider khi hết ảnh
        dotColor="#FFEE58" // Màu cho các dots
        inactiveDotColor="#90A4AE" // Màu cho các dots không hoạt động
        ImageComponentStyle={styles.sliderImage} // Thêm kiểu cho ảnh slider
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200, // Chiều cao cho slider
    marginBottom: 10,
  },
  sliderImage: {
    width: width, // Chiều rộng slider chiếm toàn bộ màn hình
    height: 200, // Chiều cao cho ảnh trong slider
    borderRadius: 10, // Bo góc cho ảnh
  },
});
