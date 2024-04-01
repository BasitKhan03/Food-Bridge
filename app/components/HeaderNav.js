import React from 'react'
import { StyleSheet, View, Image, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DotIndicator } from 'react-native-indicators';

import colors from '../config/colors';
import spacing from '../config/spacing';

export default function HeaderNav(props) {
    return (
        <>
            <View style={styles.topBarContainer}>
                <StatusBar translucent backgroundColor="transparent" />

                <View style={styles.topBar}>
                    <Image style={styles.userImage} source={require("../assets/avatar.jpg")} />
                    <Text style={styles.userName}>{props.nameLoading ? <DotIndicator color={colors.darkOrange} size={4} count={5} style={{ paddingLeft: spacing * 0.2 }} /> : props.username}</Text>
                </View>

                <View style={styles.topBar}>
                    <TouchableOpacity style={{ marginRight: spacing * 1.7 }} onPress={props.toggleNotification}>
                        {props.notification.length > 0 ? <View style={{ width: 8.2, height: 8.2, backgroundColor: colors.darkOrange, borderRadius: spacing * 5, left: 12, top: -1, zIndex: 1000, position: 'absolute' }} /> : null}
                        <Feather name="bell" size={21} color={props.showNotification ? colors.primary : colors.dark} />
                    </TouchableOpacity>

                    <TouchableOpacity style={{ marginRight: spacing * 0.5, top: -1 }} onPress={props.openDrawer}>
                        <Feather name="menu" size={23} color={colors.dark} />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    topBarContainer: {
        backgroundColor: colors.white,
        flexDirection: "row",
        justifyContent: "space-between",
        width: '100%',
        height: 90,
        padding: spacing * 2,
        paddingTop: StatusBar.currentHeight,
        paddingBottom: spacing
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center"
    },
    userImage: {
        width: spacing * 4.3,
        height: spacing * 4.3,
        borderRadius: spacing * 2,
        marginRight: spacing * 0.6
    },
    userName: {
        fontSize: 15.5,
        fontWeight: "600",
        color: colors.black
    }
})
