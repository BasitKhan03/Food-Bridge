import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { auth } from '../firebase/FirebaseConfig';
import { onAuthStateChanged } from "firebase/auth";

import AuthStack from './AuthStack';
import AppStack from './AppStack';
import SplashScreen from '../screens/SplashScreen';

function RootNavigation() {
    const [user, setUser] = useState([]);
    const [userLevel, setUserLevel] = useState();
    const [notificationData, setNotificationData] = useState([]);
    const [userLogged, setUserLogged] = useState(null);
    const [loading, setLoading] = useState(true);
    const [justSignedUp, setJustSignedUp] = useState(false);

    useEffect(() => {
        setJustSignedUp(false);
    }, []);

    useEffect(() => {
        const checkLogin = () => {
            setLoading(true);
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserLogged(user);
                    setLoading(false);
                } else {
                    setUserLogged(null);
                    console.log('No user logged in (Welcome)');
                    setLoading(false);
                }
            });
        }

        if (!justSignedUp) {
            checkLogin();
        }
    }, [justSignedUp]);

    if (loading) {
        return <SplashScreen />;
    }

    if (justSignedUp) {
        return (
            <NavigationContainer>
                <AuthStack setJustSignedUp={setJustSignedUp} />
            </NavigationContainer>
        )
    }

    else {
        return (
            <NavigationContainer>
                {userLogged ?
                    <AppStack setUser={setUser} user={user} setUserLevel={setUserLevel} userLevel={userLevel} setNotificationData={setNotificationData} notificationData={notificationData} />
                    :
                    <AuthStack setJustSignedUp={setJustSignedUp} />
                }
            </NavigationContainer>
        );
    }

}

export default RootNavigation;