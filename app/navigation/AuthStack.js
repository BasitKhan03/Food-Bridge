import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack({ setJustSignedUp }) {
    return (
        <Stack.Navigator initialRouteName='welcome'>
            <Stack.Screen name="welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }}>
                {props => <SignupScreen {...props} setJustSignedUp={setJustSignedUp} />}
            </Stack.Screen>
        </Stack.Navigator>
    )
}
