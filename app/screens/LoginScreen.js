import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity, Keyboard, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { AntDesign, Octicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';

import { auth } from '../firebase/FirebaseConfig';
import { signInWithEmailAndPassword } from "firebase/auth";

import colors from '../config/colors';
import spacing from '../config/spacing';

function LoginScreen({ navigation }) {
    const [emailFocus, setEmailFocus] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    Keyboard.addListener('keyboardDidHide', () => {
        Keyboard.dismiss();
        setEmailFocus(false);
        setPasswordFocus(false);
        setShowPassword(false);
    });

    const refPassword = useRef();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [customError, setCustomError] = useState('');

    const [error, setError] = useState({
        emailErr: false,
        passwordErr: false,
    });

    const handleLogin = () => {
        Keyboard.dismiss();

        if (email === '') {
            setError(prevState => ({ ...prevState, emailErr: true }));
        }
        if (password === '') {
            setError(prevState => ({ ...prevState, passwordErr: true }));
        }

        else {
            try {
                signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {

                        setEmail('');
                        setPassword('');

                        console.log('Logged in successfully');
                        navigation.navigate('welcome');
                    })
                    .catch((err) => {
                        var error = err.message;

                        if (error === 'Firebase: Error (auth/invalid-email).') {
                            setCustomError('Please enter a valid email address');
                        } else {
                            setCustomError('Incorrect email or password');
                        }
                    });
            }
            catch (err) {
                console.error(err);
                return;
            }
        }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
                <View style={styles.container}>
                    <View style={styles.headingContainer}>
                        <Text style={styles.headingDark}>Hello Again!</Text>
                        <Text style={styles.headingLight}>Welcome back you've {'\n'} been missed!</Text>
                    </View>

                    <View style={styles.imageContainer}>
                        <Image style={styles.img} source={require('../assets/login-screen-img.png')} />
                    </View>

                    {customError !== '' &&
                        <View style={{ flexDirection: 'row', marginTop: spacing }}>
                            <Feather name="alert-triangle" style={{ left: -8 }} size={17} color={colors.red} />
                            <Text style={{ color: colors.red }}>{customError}</Text>
                        </View>
                    }

                    <View style={[styles.inputContainer, styles.topInputContainer]}>
                        <AntDesign name="user" size={22} style={{ top: 2 }} color={emailFocus ? colors.red : colors.dark} />
                        <TextInput style={styles.input} value={email} placeholder='Email Address' onFocus={() => {
                            setEmailFocus(true);
                            setPasswordFocus(false);
                            setShowPassword(false);
                            setCustomError('');
                        }} keyboardType="email-address" onSubmitEditing={() => { refPassword.current.focus(); Keyboard.dismiss; }} blurOnSubmit={false} onChangeText={(text) => { setEmail(text.trim()); setError(prevState => ({ ...prevState, emailErr: false })); }} autoCapitalize='none' />
                        {error.emailErr && <MaterialIcons style={{ top: 7, right: -2 }} name="error-outline" size={15} color={colors.red} />}
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="lock-outline" size={22} style={{ top: 2 }} color={passwordFocus ? colors.red : colors.dark} />
                        <TextInput style={[styles.input, styles.password]} value={password} placeholder='Password' onFocus={() => {
                            setPasswordFocus(true);
                            setEmailFocus(false);
                            setCustomError('');
                        }} secureTextEntry={showPassword ? false : true} ref={refPassword} onSubmitEditing={Keyboard.dismiss} onChangeText={(text) => { setPassword(text.trim()); setError(prevState => ({ ...prevState, passwordErr: false })); }} />
                        {error.passwordErr && <MaterialIcons style={{ top: 7, right: -2 }} name="error-outline" size={15} color={colors.red} />}
                        {!error.passwordErr && <Octicons name={showPassword === false ? 'eye-closed' : 'eye'} size={21} color={colors.gray} style={{ top: 3, right: 8 }} onPress={() => setShowPassword(!showPassword)} />}
                    </View>

                    <TouchableOpacity style={styles.btn} onPress={() => { handleLogin() }}>
                        <Text style={styles.btnText}>Sign in</Text>
                        <AntDesign name="login" size={18} color="white" style={{ top: 1, left: 10 }} />
                    </TouchableOpacity>

                    <Text style={styles.forgot}>Forgot Password?</Text>
                    <Text style={styles.or}>OR</Text>
                    <Text style={styles.siwText}>Sign in With</Text>

                    <View style={styles.iconContainer}>
                        <TouchableOpacity style={styles.icon} onPress={() => { promptAsync() }}>
                            <FontAwesome5 name="google" size={22} color={colors.red} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.icon}>
                            <FontAwesome5 name="facebook-f" size={22} style={{ top: 1 }} color='#4267B2' />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.icon}>
                            <FontAwesome5 name="twitter" size={22} style={{ top: 1 }} color='#00ACEE' />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.hr} />

                    <View style={{ paddingBottom: spacing }}>
                        <Text>Don't have an account?
                            <Text style={styles.signup} onPress={() => navigation.navigate('signup')}> Sign Up</Text>
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: colors.white,
        zIndex: 2
    },
    headingContainer: {
        marginTop: StatusBar.currentHeight * 1.6
    },
    headingDark: {
        color: colors.black,
        fontSize: 34,
        fontWeight: 'bold',
        marginBottom: spacing * 0.3,
        textAlign: 'center'
    },
    headingLight: {
        color: colors.dark,
        fontSize: 16,
        fontWeight: '300',
        textAlign: 'center'
    },

    imageContainer: {
        width: '75%',
        height: '25%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing * 0.5
    },
    img: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    },

    topInputContainer: {
        marginTop: spacing
    },
    inputContainer: {
        flexDirection: 'row',
        width: '84%',
        marginVertical: spacing * 0.8,
        backgroundColor: colors.white,
        borderRadius: spacing * 0.4,
        paddingHorizontal: spacing,
        paddingVertical: spacing,
        alignSelf: 'center',
        elevation: spacing * 0.5
    },
    input: {
        color: colors.dark,
        fontSize: 15,
        marginLeft: spacing,
        width: '80%'
    },
    password: {
        paddingRight: spacing * 2
    },

    btn: {
        width: '85%',
        height: 48,
        backgroundColor: colors.primary,
        borderRadius: spacing,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: spacing * 0.8,
        color: colors.white,
        marginTop: spacing * 1.4,
        flexDirection: 'row'
    },
    btnText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "700"
    },

    forgot: {
        color: colors.gray,
        marginTop: spacing * 1.3,
        marginBottom: spacing * 0.6,
        fontWeight: "500",
    },
    or: {
        color: colors.red,
        fontWeight: "bold",
        fontSize: 14,
        marginBottom: spacing * 0.4
    },
    siwText: {
        color: colors.gray,
        fontSize: 15,
    },
    iconContainer: {
        flexDirection: 'row'
    },
    icon: {
        width: 45,
        height: 45,
        margin: spacing,
        padding: spacing,
        borderRadius: spacing * 5,
        backgroundColor: colors.white,
        alignItems: 'center',
        elevation: spacing * 0.6
    },

    hr: {
        width: '80%',
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
        marginVertical: spacing * 0.8,
        marginBottom: spacing * 1.2
    },

    signup: {
        color: colors.gray,
        fontWeight: '500'
    }
})

export default LoginScreen;