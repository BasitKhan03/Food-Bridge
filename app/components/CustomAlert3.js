import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from "react-native-modal";

import colors from '../config/colors';
import spacing from '../config/spacing';

function CustomAlert3({ opt, ...props }) {

    const renderModal = () => {
        if (opt === '1') {
            return (
                <Modal style={styles.myAlert} animationType="fade" transparent={true} visible={props.showAlert}>

                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.mainText}>{props.msg1}</Text>
                        <Text style={{ marginBottom: spacing * 1.8, fontSize: 13.5, top: 1 }}>{props.msg2}</Text>
                        <TouchableOpacity style={styles.btn} onPress={() => { props.toggleAlert(); props.handleLogout(); }}>
                            <Text style={{ color: colors.white, fontSize: 13.8, fontWeight: '500' }}>Continue </Text>
                        </TouchableOpacity>
                    </View>

                </Modal>
            );
        }

        else if (opt === '2') {
            return (
                <Modal style={styles.myAlert} animationType="fade" transparent={true} visible={props.showAlert}>

                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.mainText}>{props.msg1}</Text>
                        <Text style={{ marginBottom: spacing * 1.8, fontSize: 13.5, top: 1 }}>{props.msg2}</Text>
                        <TouchableOpacity style={styles.btn} onPress={() => { props.toggleAlert(); props.navigation.goBack(); }}>
                            <Text style={{ color: colors.white, fontSize: 13.8, fontWeight: '500' }}>Continue </Text>
                        </TouchableOpacity>
                    </View>

                </Modal>
            );
        }
    }

    return renderModal();
}

const styles = StyleSheet.create({
    myAlert: {
        flex: 0,
        top: '35%',
        width: '72%',
        height: '17.7%',
        alignSelf: 'center',
        elevation: spacing * 3,
        borderRadius: spacing * 0.8,
        backgroundColor: colors.white
    },

    mainText: {
        fontSize: 14.2,
        fontWeight: '600',
        marginBottom: spacing * 0.25
    },

    btn: {
        width: spacing * 11.7,
        height: spacing * 3.2,
        backgroundColor: colors.twitterBlue,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: spacing * 5,
        top: spacing * 0.2,
        flexDirection: 'row'
    }
})

export default CustomAlert3;