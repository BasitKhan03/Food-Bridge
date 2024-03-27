import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';

import spacing from '../config/spacing';
import colors from '../config/colors';

function Spinner() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={48} color={colors.primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        top: - spacing * 2
    }
})

export default Spinner;