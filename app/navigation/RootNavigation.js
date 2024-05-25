import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { auth } from "../firebase/FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

import AuthStack from "./AuthStack";
import AppStack from "./AppStack";
import SplashScreen from "../screens/SplashScreen";

function RootNavigation() {
  const [user, setUser] = useState([]);
  const [userLevel, setUserLevel] = useState();
  const [notificationData, setNotificationData] = useState([]);
  const [userLogged, setUserLogged] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      setLoading(true);

      const isNewUser = await AsyncStorage.getItem("isNewUser");

      onAuthStateChanged(auth, (user) => {
        if (user && isNewUser !== "true") {
          setUserLogged(user);
          console.log("User logged in (Welcome)");
          setLoading(false);
        } else {
          setUserLogged(null);
          console.log("No user logged in (Welcome)");
          setLoading(false);
        }
      });
    };
    checkLogin();
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {userLogged ? (
        <AppStack
          setUser={setUser}
          user={user}
          setUserLevel={setUserLevel}
          userLevel={userLevel}
          setNotificationData={setNotificationData}
          notificationData={notificationData}
        />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

export default RootNavigation;
