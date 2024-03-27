import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

import colors from '../config/colors';
import spacing from '../config/spacing';

function BottomTab(props) {
    return (
        <View style={styles.container}>
            <View style={styles.box}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => { props.navigation.navigate('home') }}>
                    <AntDesign name="home" size={24} color={props.active === 'home' ? colors.primary : colors.darkRed} />
                    <Text style={[styles.text, { color: props.active === 'home' ? colors.primary : colors.darkRed }]}>Home</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.box}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => { props.navigation.navigate('goals') }}>
                    <MaterialCommunityIcons name="cards-outline" size={24} color={props.active === 'goals' ? colors.primary : colors.darkRed} />
                    <Text style={[styles.text, { color: props.active === 'goals' ? colors.primary : colors.darkRed }]}>Goals</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.box}>
                <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => { props.navigation.navigate('itemRequest') }}>
                    <AntDesign name="inbox" size={24} color={props.active === 'itemRequest' ? colors.primary : colors.darkRed} />
                    <Text style={[styles.text, { color: props.active === 'itemRequest' ? colors.primary : colors.darkRed }]}>Requests</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.box}>
                <View style={{ alignItems: 'center' }}>
                    <Feather name="message-square" size={22} color={colors.gray} />
                    <Text style={[styles.text, { color: colors.gray }]}>Messages</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        position: 'absolute',
        bottom: 3,
        height: spacing * 6,
        width: '95%',
        elevation: spacing * 1,
        flexDirection: 'row',
        borderRadius: spacing * 5,
        alignSelf: 'center',
        paddingHorizontal: spacing * 0.5
    },

    box: {
        width: '25%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    text: {
        color: colors.darkRed,
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
    }
})

export default BottomTab;