import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useSharedValue, useAnimatedStyle, withSpring, interpolate, interpolateColor, runOnJS } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import colors from '../config/colors';

const BUTTON_WIDTH = 295;
const BUTTON_HEIGHT = 60;
const BUTTON_PADDING = 10;
const SWIPEABLE_DIMESIONS = BUTTON_HEIGHT - 2 * BUTTON_PADDING;

const H_WAVE_RANGE = SWIPEABLE_DIMESIONS + 2 * BUTTON_PADDING;
const H_SWIPE_RANGE = BUTTON_WIDTH - 2 * BUTTON_PADDING - SWIPEABLE_DIMESIONS;

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const SwipeButton = ({ onToggle }) => {

    const [toggled, setToggled] = useState(false);
    const x = useSharedValue(0);

    const handleComplete = (isToggled) => {
        if (isToggled !== toggled) {
            setToggled(isToggled);
            onToggle(isToggled);
        }
    };

    const animatedGestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.completed = toggled;
        },

        onActive: (e, ctx) => {
            let newVal;

            if (ctx.completed) {
                newVal = H_SWIPE_RANGE + e.translationX;
            } else {
                newVal = e.translationX;
            }

            if (newVal >= 0 && newVal <= H_SWIPE_RANGE) {
                x.value = newVal;
            }
        },

        onEnd: () => {
            if (x.value < BUTTON_WIDTH / 2 - SWIPEABLE_DIMESIONS / 2) {
                x.value = withSpring(0);
                runOnJS(handleComplete)(false);
            }
            else {
                x.value = withSpring(H_SWIPE_RANGE);
                runOnJS(handleComplete)(true);
            }
        }
    });

    const InterpolateXInput = [0, H_SWIPE_RANGE];

    const AnimatedStyles = {
        swipeable: useAnimatedStyle(() => {
            return {
                transform: [{ translateX: x.value }],
                backgroundColor: interpolateColor(
                    x.value,
                    [0, BUTTON_WIDTH - SWIPEABLE_DIMESIONS - BUTTON_PADDING],
                    ['#06d6a0', '#fff'])
            }
        }),

        swipeText: useAnimatedStyle(() => {
            return {
                opacity: interpolate(x.value, InterpolateXInput, [0.8, 0]),
                transform: [{
                    translateX: interpolate(x.value, InterpolateXInput, [0, BUTTON_WIDTH / 2 - SWIPEABLE_DIMESIONS])
                }]
            }
        }),

        colorWave: useAnimatedStyle(() => {
            return {
                width: H_WAVE_RANGE + x.value,
                opacity: interpolate(x.value, InterpolateXInput, [0, 1])
            }
        })
    }

    return (
        <View style={styles.swipeCont}>
            <AnimatedLinearGradient colors={['#06d6a0', '#1b9aaa']} start={{ x: 0.0, y: 0.5 }} end={{ x: 1.0, y: 0.5 }} style={[styles.colorWave, AnimatedStyles.colorWave]} />
            <PanGestureHandler onGestureEvent={animatedGestureHandler}>
                <Animated.View style={[styles.swipeable, AnimatedStyles.swipeable]}></Animated.View>
            </PanGestureHandler>
            <Animated.Text style={[styles.swipeText, AnimatedStyles.swipeText]}>I confirm I've done this</Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    swipeCont: {
        height: BUTTON_HEIGHT,
        width: BUTTON_WIDTH,
        padding: BUTTON_PADDING,
        backgroundColor: colors.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BUTTON_HEIGHT
    },
    swipeable: {
        height: SWIPEABLE_DIMESIONS,
        width: SWIPEABLE_DIMESIONS,
        borderRadius: SWIPEABLE_DIMESIONS,
        backgroundColor: colors.whiteSmoke,
        position: 'absolute',
        left: BUTTON_PADDING,
        zIndex: 3
    },
    swipeText: {
        alignSelf: 'center',
        fontSize: 14.2,
        fontWeight: '500',
        color: colors.secondary,
        zIndex: 2
    },
    colorWave: {
        position: 'absolute',
        left: 0,
        height: BUTTON_HEIGHT,
        borderRadius: BUTTON_HEIGHT,
        backgroundColor: colors.orange
    }
})

export default SwipeButton;