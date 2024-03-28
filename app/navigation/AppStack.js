import React from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AntDesign } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import MyListingsEditScreen from '../screens/MyListingsEditScreen';
import NotificationScreen from '../screens/NotificationScreen';
import FAQsScreen from '../screens/FAQsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import GoalConfirmationScreen from '../screens/GoalConfirmationScreen';
import ItemRequestScreen from '../screens/ItemRequestScreen';
import CustomDrawer from '../components/CustomDrawer';

import colors from '../config/colors';
import spacing from '../config/spacing';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ setUser, user, setNotificationData, notificationData, setUserLevel, userLevel }) => {
    return (
        <Drawer.Navigator
            drawerContent={props => <CustomDrawer {...props} user={user} userLevel={userLevel} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: styles.drawerStyles,
                drawerType: 'slide',
                overlayColor: 'transparent',
                sceneContainerStyle: styles.sceneStyle,
                drawerLabelStyle: { marginLeft: -spacing * 1.6, fontSize: 14.5 },
                drawerActiveBackgroundColor: colors.primary,
                drawerActiveTintColor: colors.white,
                drawerInactiveTintColor: colors.white,
                swipeEdgeWidth: Platform.OS === 'android' && 180
            }}
        >
            <Drawer.Screen
                name="Home"
                options={{
                    drawerIcon: ({ color }) => (
                        <AntDesign name="home" size={21} color={color} style={{ marginLeft: spacing * 0.6 }} />
                    )
                }}
            >
                {props => <HomeScreen {...props} setUser={setUser} setUserLevel={setUserLevel} setNotificationData={setNotificationData} />}
            </Drawer.Screen>

            <Drawer.Screen name="Profile" component={ProfileScreen} options={{
                drawerIcon: ({ color }) => (
                    <AntDesign name="user" size={21} color={color} style={{ marginLeft: spacing * 0.6 }} />
                )
            }} />

            <Drawer.Screen name="Settings" component={SettingsScreen} options={{
                drawerIcon: ({ color }) => (
                    <AntDesign name="setting" size={21} color={color} style={{ marginLeft: spacing * 0.6 }} />
                )
            }} />

            <Drawer.Screen
                name="My Listings"
                options={{
                    drawerIcon: ({ color }) => (
                        <AntDesign name="inbox" size={22} color={color} style={{ marginLeft: spacing * 0.55 }} />
                    )
                }}
            >
                {props => <MyListingsScreen {...props} user={user} />}
            </Drawer.Screen>

            <Drawer.Screen
                name="Notification"
                options={{
                    drawerIcon: ({ color }) => (
                        <View>
                            {notificationData.length > 0 ? <View style={{ width: 8.2, height: 8.2, backgroundColor: colors.darkOrange, borderRadius: spacing * 5, left: 18, top: -1, zIndex: 1000, position: 'absolute' }} /> : null}
                            <AntDesign name="bells" size={21} color={color} style={{ marginLeft: spacing * 0.6 }} />
                        </View>
                    )
                }}
            >
                {props => <NotificationScreen {...props} user={user} notificationData={notificationData} setNotificationData={setNotificationData} />}
            </Drawer.Screen>

            <Drawer.Screen name="FAQs" component={FAQsScreen} options={{
                drawerIcon: ({ color }) => (
                    <AntDesign name="questioncircleo" size={19} color={color} style={{ marginLeft: spacing * 0.68, marginRight: spacing * 0.18 }} />
                )
            }} />

        </Drawer.Navigator>
    );
};

export default function AppStack({ setUser, user, setNotificationData, notificationData, setUserLevel, userLevel }) {
    return (
        <Stack.Navigator initialRouteName='welcome'>
            <Stack.Screen name="home" options={{ headerShown: false }}>
                {props => <DrawerNavigator {...props} setUser={setUser} user={user} setUserLevel={setUserLevel} userLevel={userLevel} setNotificationData={setNotificationData} notificationData={notificationData} />}
            </Stack.Screen>
            <Stack.Screen name="item" component={ItemDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="itemEdit" component={MyListingsEditScreen} options={{ headerShown: false }} />
            <Stack.Screen name="goals" options={{ headerShown: false }}>
                {props => <GoalsScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="goalConfirm" component={GoalConfirmationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="itemRequest" options={{ headerShown: false }}>
                {props => <ItemRequestScreen {...props} user={user} />}
            </Stack.Screen>
        </Stack.Navigator>
    )
}

const styles = StyleSheet.create({
    drawerStyles: {
        width: 225,
        backgroundColor: '#213440',
    },
    sceneStyle: {
        flex: 1,
        backgroundColor: '#213440',
    }
})