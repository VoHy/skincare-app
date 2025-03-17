import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeScreen from '../screens/HomeScreen';
import FavoriteScreen from '../screens/FavoriteScreen';
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/SignupScreen';
import DetailsScreen from '../screens/DetailsScreen';
import CartScreen from '../screens/CartScreen';
import PayScreen from '../screens/PayScreen';
import AccountScreen from '../screens/AccountScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabs = ({ isLoggedIn, setIsLoggedIn }) => {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoriteScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="heart" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Icon name="shopping-cart" size={24} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Account"
                component={() => <AccountScreen isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="user" size={size} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    );
};

export default function AppNavigator() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const value = await AsyncStorage.getItem('isLoggedIn');
            setIsLoggedIn(value === 'true');
        };
        checkLoginStatus();
    }, []);

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Main"
                options={{ headerShown: false }}
            >
                {() => <BottomTabs isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>
            <Stack.Screen name="Login">
                {() => <LoginScreen setIsLoggedIn={setIsLoggedIn} />}
            </Stack.Screen>
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
            <Stack.Screen name="DetailsScreen" component={DetailsScreen} options={{ title: "Chi tiết sản phẩm" }} />
            <Stack.Screen name="PayScreen" component={PayScreen} options={{ title: "Chi tiết sản phẩm" }} />
        </Stack.Navigator>

    );
}
