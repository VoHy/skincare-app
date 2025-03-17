import React from 'react';
import Login from '../screens/Login';
import ProfileScreen from '../screens/ProfileScreen';

const AccountScreen = ({ isLoggedIn, setIsLoggedIn }) => {
    return isLoggedIn ? (
        <ProfileScreen setIsLoggedIn={setIsLoggedIn} />
    ) : (
        <Login setIsLoggedIn={setIsLoggedIn} />
    );
};

export default AccountScreen;
