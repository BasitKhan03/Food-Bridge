import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from "react-native-modal";

import colors from '../config/colors';
import spacing from '../config/spacing';

function CustomAlert(props) {
    const [count, setCount] = useState(9);

    useEffect(() => {
        const timer = setInterval(() => {
            setCount(count => count - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <Modal style={styles.myAlert} animationType="fade" transparent={true} visible={props.showAlert} onBackdropPress={props.toggleAlert} onRequestClose={props.toggleAlert} onBackButtonPress={props.toggleAlert}>

            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.mainText}>{props.msg1}</Text>
                <Text style={{ marginBottom: spacing * 1.75, fontSize: 14 }}>{props.msg2}</Text>
                <TouchableOpacity style={styles.btn} onPress={props.toggleAlert}>
                    <Text style={{ color: colors.white, fontSize: 14.5, fontWeight: '500' }}>Continue </Text><Text style={{ color: colors.white, fontSize: 12.5, fontWeight: '500' }}>({count > 0 ? count : '0'})</Text>
                </TouchableOpacity>
            </View>

        </Modal>
    );
}

const styles = StyleSheet.create({
    myAlert: {
        flex: 0,
        top: '35%',
        width: '72%',
        height: '18%',
        alignSelf: 'center',
        elevation: spacing * 3,
        borderRadius: spacing * 0.8,
        backgroundColor: colors.white
    },

    mainText: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: spacing * 0.25
    },

    btn: {
        width: spacing * 11.7,
        height: spacing * 3.1,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: spacing * 5,
        top: spacing * 0.3,
        flexDirection: 'row'
    }
})

export default CustomAlert;