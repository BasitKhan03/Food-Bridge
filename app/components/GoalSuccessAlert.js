import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Modal from "react-native-modal";

import colors from '../config/colors';
import spacing from '../config/spacing';

function GoalSuccessAlert(props) {
    const [count, setCount] = useState(9);

    useEffect(() => {
        const timer = setInterval(() => {
            setCount(count => count - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <Modal style={styles.myAlert} animationType="fade" transparent={true} visible={props.showAlert}>

            <View style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                <Text style={styles.mainText}>{props.msg1}</Text>
                <Text style={{ marginBottom: spacing * 1.2, fontSize: 14, fontWeight: '500', color: colors.gray }}>{props.msg2}</Text>

                <View style={{ marginBottom: spacing * 1.7, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="star-three-points-outline" size={24.5} color={colors.darkOrange} />
                    <Text style={{ fontSize: 15.5, color: colors.primary, fontWeight: '600', marginLeft: spacing * 0.3 }}>+{props.points}</Text>
                </View>

                <TouchableOpacity style={styles.btn} onPress={() => { props.toggleAlert(); props.navigation.goBack(); }}>
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
        width: '84%',
        height: '23%',
        alignSelf: 'center',
        elevation: spacing * 3,
        borderRadius: spacing * 0.8,
        backgroundColor: colors.white
    },

    mainText: {
        fontSize: 14.5,
        fontWeight: '700',
        color: colors.darkBlue2,
        marginBottom: spacing * 0.2,
        marginTop: spacing * 1.1
    },

    btn: {
        width: 145,
        height: 33,
        backgroundColor: colors.blue,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: spacing * 5,
        top: spacing * 0.3,
        flexDirection: 'row',
        top: -2
    }
})

export default GoalSuccessAlert;