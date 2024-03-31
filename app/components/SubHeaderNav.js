import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons, Feather } from "@expo/vector-icons";

import colors from '../config/colors';
import spacing from '../config/spacing';

function SubHeaderNav(props) {

    const openDrawer = () => {
        props.navigation.openDrawer();
    };

    return (
        <View style={styles.topBarContainer}>
            <StatusBar translucent backgroundColor="transparent" />

            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => { props.navigation.goBack() }} style={{ top: 1.7, marginLeft: spacing }}>
                    <Ionicons name="arrow-back" size={spacing * 2.7} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.topBar}>
                <Text style={styles.title}>{props.title}</Text>
            </View>

            <View style={styles.topBar}>
                <TouchableOpacity style={{ top: -1, marginRight: spacing }} onPress={() => { openDrawer() }}>
                    <Feather name="menu" size={23} color={colors.dark} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    topBarContainer: {
        backgroundColor: colors.white,
        flexDirection: "row",
        justifyContent: "space-between",
        width: '100%',
        height: 100,
        padding: spacing * 2,
        paddingTop: StatusBar.currentHeight,
        paddingBottom: -spacing * 1.5,
        elevation: spacing,
        shadowColor: colors.darkGray,
        zIndex: 1005,
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center"
    },
    title: {
        fontSize: 15.5,
        fontWeight: "700",
        color: colors.darkBlue
    }
})

export default SubHeaderNav;