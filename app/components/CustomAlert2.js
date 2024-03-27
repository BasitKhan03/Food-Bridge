import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from "react-native-modal";

import colors from '../config/colors';
import spacing from '../config/spacing';

function CustomAlert2({ opt, ...props }) {

    const renderModal = () => {
        if (opt === '1') {
            return (
                <Modal style={styles.myAlert} animationType="fade" transparent={true} visible={props.showAlert} onBackdropPress={props.toggleAlert} onRequestClose={props.toggleAlert} onBackButtonPress={props.toggleAlert}>

                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.mainText}>{props.msg1}</Text>
                        <Text style={{ marginBottom: spacing * 1.75, fontSize: 13.5 }}>{props.msg2}</Text>

                        <View style={{ width: '80%', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                            <TouchableOpacity style={styles.btn} onPress={props.toggleAlert}>
                                <Text style={{ color: colors.white, fontSize: 13.5, fontWeight: '500' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, { backgroundColor: props.mode === 'delete' ? colors.red : colors.twitterBlue }]} onPress={() => { props.toggleAlert(); props.update(); }}>
                                <Text style={{ color: colors.white, fontSize: 13.5, fontWeight: '500' }}>Okay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            );

        }

        else if (opt === '2') {
            return (
                <Modal style={styles.myAlert} animationType="fade" transparent={true} visible={props.showAlert}>

                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.mainText}>{props.msg1}</Text>
                        <Text style={{ marginBottom: spacing * 1.75, fontSize: 13.2 }}>{props.msg2}</Text>

                        <View style={{ width: '80%', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                            <TouchableOpacity style={styles.btn} onPress={() => { props.toggleAlert(); props.clean(); }}>
                                <Text style={{ color: colors.white, fontSize: 13.5, fontWeight: '500' }}>Later</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btn} onPress={() => { props.toggleAlert(); props.navigation.replace('home'); }}>
                                <Text style={{ color: colors.white, fontSize: 13.5, fontWeight: '500' }}>Now</Text>
                            </TouchableOpacity>
                        </View>
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
        width: spacing * 8,
        height: spacing * 3.2,
        backgroundColor: colors.twitterBlue,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: spacing * 5,
        top: spacing * 0.3,
        flexDirection: 'row'
    }
})

export default CustomAlert2;