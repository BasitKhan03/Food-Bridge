import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from "react-native-modal";

import colors from '../config/colors';
import spacing from '../config/spacing';

function LevelupModal(props) {
    const [count, setCount] = useState(9);

    useEffect(() => {
        const timer = setInterval(() => {
            setCount(count => count - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <Modal style={styles.myAlert} animationType="fade" transparent={true} visible={props.showAlert} onRequestClose={props.toggleAlert} onBackButtonPress={props.toggleAlert}>

            <View style={{ justifyContent: 'flex-start', alignItems: 'center', top: -2.5 }}>

                <Text style={styles.mainText}>{props.msg1}</Text>

                <View style={{ marginTop: spacing * 0.25, marginBottom: spacing * 1.2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15.2, color: colors.primary, fontWeight: '600', marginLeft: spacing * 0.5 }}>Level {props.levelup}</Text>
                </View>

                <Text style={{ marginBottom: spacing * 1.6, fontSize: 14.2, fontWeight: '500', color: colors.gray }}>{props.msg2}</Text>

                <TouchableOpacity style={styles.btn} onPress={() => { props.toggleAlert(); }}>
                    <Text style={{ color: colors.white, fontSize: 14, fontWeight: '500' }}>Continue </Text><Text style={{ color: colors.white, fontSize: 12.5, fontWeight: '500' }}>({count > 0 ? count : '0'})</Text>
                </TouchableOpacity>
            </View>

        </Modal>
    );
}

const styles = StyleSheet.create({
    myAlert: {
        flex: 0,
        top: '26%',
        width: '81.5%',
        height: '22%',
        alignSelf: 'center',
        elevation: spacing * 3,
        borderRadius: spacing * 0.8,
        backgroundColor: colors.white
    },

    mainText: {
        fontSize: 16.5,
        fontWeight: '700',
        color: colors.darkLight,
    },

    btn: {
        width: 145,
        height: 33,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: spacing * 5,
        top: spacing * 0.3,
        flexDirection: 'row',
        top: 1
    }
})

export default LevelupModal;