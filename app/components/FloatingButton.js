import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

import colors from '../config/colors';
import spacing from '../config/spacing';

function FloatingButton(props) {
    return (
        <View>
            <TouchableOpacity style={styles.btn} onPress={props.toggleModal}>
                <Feather name="plus" size={28} color={colors.white} />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    btn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: spacing * 5.8,
        height: spacing * 5.8,
        position: 'absolute',
        bottom: spacing * 4.7,
        right: spacing * 2.2,
        backgroundColor: colors.primary,
        borderRadius: spacing * 10,
        elevation: spacing,
        marginBottom: spacing,
        zIndex: 1000
    }
})

export default FloatingButton;