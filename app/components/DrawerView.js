import React from 'react';
import { StyleSheet } from 'react-native';
import { useDrawerProgress } from '@react-navigation/drawer';
import Animated from 'react-native-reanimated';
import { interpolate, useAnimatedStyle } from 'react-native-reanimated';

function DrawerView({ children, style }) {
    const drawerProgress = useDrawerProgress();

    const viewStyles = useAnimatedStyle(() => {
        const scale = interpolate(
            drawerProgress.value,
            [0, 1],
            [1, 0.85]
        )

        const borderRadius = interpolate(
            drawerProgress.value,
            [0, 1],
            [0, 30]
        )

        return {
            transform: [{ scale }],
            borderRadius
        }
    })

    return (
        <Animated.View style={[styles.container, style, viewStyles]}>
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})

export default DrawerView;