import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { DrawerItemList, useDrawerProgress } from '@react-navigation/drawer';
import { FontAwesome, AntDesign, Feather } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useAnimatedStyle, interpolate } from 'react-native-reanimated';

import { auth } from '../firebase/FirebaseConfig';
import { signOut } from "firebase/auth";

import colors from '../config/colors';
import spacing from '../config/spacing';

function CustomDrawer({ navigation, user, userLevel, ...props }) {

    const scrollRef = useRef(null);
    const drawerProgress = useDrawerProgress();

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                console.log('Logged out (Drawer)');
                navigation.navigate('welcome');
            })
            .catch((err) => { console.log(err) });
    }

    const viewStyles = useAnimatedStyle(() => {
        const translateX = interpolate(
            drawerProgress.value,
            [0, 1],
            [-200, 0]
        )

        return {
            transform: [{ translateX }]
        }
    });

    const viewStyles2 = (type) => useAnimatedStyle(() => {
        const val = type === 'top' ? -100 : 100

        const translateY = interpolate(
            drawerProgress.value,
            [0, 1],
            [val, 0]
        )

        const opacity = interpolate(
            drawerProgress.value,
            [0, 1],
            [0, 1]
        )

        return {
            transform: [{ translateY }], opacity
        }
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.row, styles.view, styles.marginTop, viewStyles2('top'), { marginTop: spacing * 5.5 }]}>
                <View style={styles.iconContainer}>
                    <FontAwesome name="hand-peace-o" size={20} color={colors.white} />
                </View>
                <Text style={[styles.headerTitle, { fontSize: 17.5 }]}>Hello there!</Text>
            </Animated.View>

            <Animated.ScrollView {...props} ref={scrollRef} style={[styles.marginVertical, viewStyles]} showsVerticalScrollIndicator={false}>
                <View style={[styles.view, { marginLeft: spacing * 0.3 }]}>
                    <DrawerItemList navigation={navigation} {...props} />
                </View>
            </Animated.ScrollView>

            <Animated.View style={[styles.hr, viewStyles]} />

            <Animated.View style={[styles.view, styles.logout, viewStyles]}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={handleLogout}>
                    <Feather name="power" size={19} color={colors.orange} />
                    <View style={{ marginLeft: spacing * 1.4 }}>
                        <Text style={{ fontSize: 14.2, color: colors.white, fontWeight: '600' }}>Logout</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.hr, viewStyles, { marginBottom: spacing * 1.3 }]} />

            <Animated.View style={[styles.row, styles.view, styles.marginBottom, viewStyles2('bottom'), { marginBottom: spacing * 1.5 }]}>
                <View style={[styles.profile, { backgroundColor: user.imageURL === '' ? colors.light : colors.whiteSmoke }]}>
                    {user.imageURL && <Image source={{ uri: user.imageURL }} style={{ zIndex: 1000, width: 47.5, height: 47.5, borderRadius: spacing * 5 }} />}
                    {!user.imageURL && <AntDesign name="user" size={22} color={colors.gray} />}
                </View>
                <View style={{ width: '65%' }}>
                    <Text style={styles.headerTitle}>{user.name}</Text>
                    <Text style={styles.text}>Level {userLevel}</Text>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    view: {
        borderRadius: spacing,
        marginLeft: spacing * 0.5,
        padding: spacing * 1.5,
        paddingRight: spacing
    },

    marginTop: {
        marginTop: spacing
    },
    marginBottom: {
        marginBottom: spacing
    },
    marginVertical: {
        marginVertical: spacing
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconContainer: {
        padding: spacing,
        borderRadius: spacing,
        margin: spacing / 1.5,
        backgroundColor: colors.twitterBlue
    },
    headerTitle: {
        fontSize: 16.5,
        color: colors.white,
        fontWeight: '500',
        marginLeft: spacing / 1.5
    },
    profile: {
        marginVertical: spacing / 1.5,
        marginRight: spacing,
        marginLeft: spacing,
        width: 50,
        height: 50,
        borderRadius: spacing * 5,
        backgroundColor: colors.light,
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        fontSize: 14,
        color: colors.whiteSmoke,
        marginLeft: spacing * 0.8
    },
    logout: {
        marginRight: spacing * 3,
        marginLeft: spacing * 2.7,
    },
    hr: {
        width: '70%',
        marginVertical: spacing * 0.2,
        borderBottomWidth: 0.2,
        borderBottomColor: '#F2E6D0',
        alignSelf: 'center',
        marginLeft: -spacing * 0.1
    },
})

export default CustomDrawer;