import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Image, Modal, FlatList, Text } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';

export default function Header({ onSearch }) {  // Receive onSearch prop
    const [searchText, setSearchText] = useState("");
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const navigation = useNavigation();

    const handleChangeText = (text) => {
        setSearchText(text);
        onSearch(text);  // Call the onSearch function when text changes
    };

    const handleSidebarToggle = () => {
        setSidebarVisible(!isSidebarVisible);
    };

    const sidebarItems = [
        { id: '1', name: 'Trang Chủ', screen: 'Home', icon: 'home' },
        { id: '2', name: 'Sản phẩm yêu thích', screen: 'Favorites', icon: 'heart' },
        { id: '3', name: 'Blog làm đẹp', screen: 'Blog', icon: 'book' },
        { id: '4', name: 'Tài khoản', screen: 'Account', icon: 'user' }
    ];

    const handleItemPress = (screen) => {
        navigation.navigate(screen);
        setSidebarVisible(false); 
    };

    return (
        <View style={styles.header}>
            {/* Logo */}
            <Image source={require('../assets/image/logo.png')} style={styles.logo} />

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Icon name="search1" size={18} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchText}
                    onChangeText={handleChangeText}  // Call handleChangeText on text change
                />
            </View>

            {/* Sidebar Button */}
            <TouchableOpacity style={styles.sidebarButton} onPress={handleSidebarToggle}>
                <Icon name="bars" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Sidebar Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isSidebarVisible}
                onRequestClose={handleSidebarToggle}
            >
                <View style={styles.sidebarOverlay}>
                    <View style={styles.sidebar}>
                        <FlatList
                            data={sidebarItems}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.sidebarItem} onPress={() => handleItemPress(item.screen)}>
                                    <Icon name={item.icon} size={24} color="#000" style={styles.sidebarItemIcon} />
                                    <Text style={styles.sidebarItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.closeButton} onPress={handleSidebarToggle}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#bebebe',
        padding: 20,
    },
    logo: {
        width: 50,
        height: 40,
        paddingRight: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
    },
    sidebarButton: {
        backgroundColor: '#444',
        padding: 10,
        borderRadius: 8,
    },
    sidebarOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidebar: {
        backgroundColor: '#fff',
        width: 250,
        padding: 20,
        height: '100%',
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    sidebarItemIcon: {
        marginRight: 10,
    },
    sidebarItemText: {
        fontSize: 18,
    },
    closeButton: {
        marginTop: 20,
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#444',
        borderRadius: 8,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 18,
    },
});