import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from "react-native-modal";

import colors from '../config/colors';
import spacing from '../config/spacing';

function OrderAlert(props) {
    return (
        <Modal style={styles.myAlert} animationType="fade" transparent={true} visible={props.showAlert}>

            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.mainText}>{props.msg1}</Text>
                <Text style={{ marginBottom: spacing * 1.4, fontSize: 14 }}>{props.msg2}</Text>
                <Text style={{ marginBottom: spacing * 1.6, fontSize: 14, color: colors.darkRed }}>{props.msg3}</Text>
                <TouchableOpacity style={styles.btn} onPress={() => { props.toggleAlert(); props.navigation.goBack(); }}>
                    <Text style={{ color: colors.white, fontSize: 14.5, fontWeight: '500' }}>Continue </Text>
                </TouchableOpacity>
            </View>

        </Modal>
    );
}

const styles = StyleSheet.create({
    myAlert: {
        flex: 0,
        top: '35%',
        width: '75%',
        height: '22%',
        alignSelf: 'center',
        elevation: spacing * 3,
        borderRadius: spacing * 0.8,
        backgroundColor: colors.white
    },

    mainText: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: spacing * 0.05
    },

    btn: {
        width: spacing * 11.7,
        height: spacing * 3.1,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: spacing * 5,
        top: 1,
        flexDirection: 'row'
    }
})

export default OrderAlert;