import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from "@react-navigation/native";

export default function WebViewScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { url } = route.params;
    const [isLoading, setIsLoading] = useState(true);

    // Xử lý khi URL thay đổi trong WebView
    const handleNavigationStateChange = (navState) => {
        // Kiểm tra nếu URL chứa thông tin thanh toán thành công
        if (navState.url.includes('success')) {
            // Hiển thị thông báo chuyển khoản thành công
            Alert.alert(
                "Thông báo",
                "Chuyển khoản thành công!",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate('Main', { screen: 'Home' })
                    }
                ]
            );
        }
        // Kiểm tra nếu URL chứa thông tin thanh toán thất bại
        else if (navState.url.includes('cancel')) {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: url }}
                style={styles.webview}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onNavigationStateChange={handleNavigationStateChange}
            />
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6F61" />
                    <Text style={styles.loadingText}>Đang tải trang thanh toán...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
}); 