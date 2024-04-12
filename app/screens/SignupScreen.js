import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, ScrollView, Image, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AntDesign, Octicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import { SkypeIndicator } from 'react-native-indicators';

import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/FirebaseConfig';
import { createUserWithEmailAndPassword } from "firebase/auth";

import colors from '../config/colors';
import spacing from '../config/spacing';

function SignupScreen({ navigation, setJustSignedUp }) {

    // ----|| useState hooks for input field icons ||---->
    const [nameFocus, setNameFocus] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);
    const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
    const [phoneFocus, setPhoneFocus] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
        Keyboard.dismiss();
        setNameFocus(false);
        setEmailFocus(false);
        setPasswordFocus(false);
        setShowPassword(false);
        setConfirmPasswordFocus(false);
        setShowConfirmPassword(false);
        setPhoneFocus(false);
    });

    // ----|| useRef hooks for input fields ||---->
    const refEmail = useRef();
    const refPassword = useRef();
    const refConfirmPassword = useRef();
    const refPhone = useRef();
    const refAddress = useRef();
    const refCity = useRef();

    // ----|| useState hooks for storing errors ||---->
    const [customError, setCustomError] = useState('');
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState({
        nameErr: false,
        emailErr: false,
        passwordErr: false,
        confirmPasswordErr: false,
        phoneErr: false,
        addressErr: false,
        cityErr: false
    });

    // ----|| useState hooks for storing input field values ||---->
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');

    // ----|| Function call when user presses 'Signup' button ||---->
    const handleSignup = async () => {
        if (name === '' || email === '' || password === '' || confirmPassword === '' || phone === '' || address === '' || city === '') {
            if (name === '') {
                setError(prevState => ({ ...prevState, nameErr: true }));
            }
            if (email === '') {
                setError(prevState => ({ ...prevState, emailErr: true }));
            }
            if (password === '') {
                setError(prevState => ({ ...prevState, passwordErr: true }));
            }
            if (confirmPassword === '') {
                setError(prevState => ({ ...prevState, confirmPasswordErr: true }));
            }
            if (phone === '') {
                setError(prevState => ({ ...prevState, phoneErr: true }));
            }
            if (address === '') {
                setError(prevState => ({ ...prevState, addressErr: true }));
            }
            if (city === '') {
                setError(prevState => ({ ...prevState, cityErr: true }));
            }
        }

        else if (password !== confirmPassword) {
            setCustomError('Password do not match');
            return;
        }

        else if (password.length < 6) {
            setCustomError('Password should be at least 6 characters');
            return;
        }

        else if (phone !== '' && phone.length != 11) {
            setCustomError('Phone number should be 11 digits long');
            return;
        }

        else {
            try {
                await createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredentials) => {
                        Keyboard.dismiss();
                        setLoading(true);
                        setJustSignedUp(true);
                        console.log('User created');

                        if (userCredentials?.user.uid) {
                            const docRef = addDoc(collection(db, 'userData'), {
                                name: name,
                                email: email.toLowerCase(),
                                password: password.trim(),
                                phone: phone,
                                address: address,
                                city: city,
                                date: new Date(),
                                imageURL: '',
                                uid: userCredentials?.user.uid
                            })
                            const docRef1 = addDoc(collection(db, 'userScores'), {
                                name: name,
                                uid: userCredentials?.user.uid,
                                score: 0,
                                level: 1,
                                showedFor: 1
                            })
                                .then(() => {
                                    setLoading(false);
                                    console.log('User data added to collection');
                                    setSuccess('Your account has been created successfully');

                                    setName('');
                                    setEmail('');
                                    setPassword('');
                                    setConfirmPassword('');
                                    setPhone('');
                                    setAddress('');
                                    setCity('');

                                    // auth.signOut().then(() => {
                                    //     setTimeout(() => {
                                    //         setSuccess(null);
                                    //         navigation.navigate('login');
                                    //     }, 2600);
                                    // }).catch((err) => {
                                    //     console.log(err);
                                    // });

                                    auth.signOut().then(() => {
                                        setSuccess(null);
                                        navigation.navigate('login');
                                    }).catch((err) => {
                                        console.log(err);
                                    });
                                })
                                .catch((err) => { console.log(err) })
                        }
                    })
                    .catch((err) => {
                        console.log('Firebase Error: ' + err.message);

                        Keyboard.dismiss();

                        if (err.message === 'Firebase: Error (auth/email-already-in-use).') {
                            setCustomError('Email address already in use');
                        } else if (err.message === 'Firebase: Error (auth/invalid-email).') {
                            setCustomError('Invalid email address');
                        } else if (err.message === 'Firebase: Password should be at least 6 characters (auth/weak-password).') {
                            setCustomError('Password should be at least 6 characters');
                        } else if (err.message === 'Firebase: Error (auth/missing-email).') {
                            setCustomError('Enter your email address');
                        } else if (err.message === 'Firebase: Error (auth/internal-error).') {
                            setCustomError('Server time-out. Please try again');
                            setTimeout(() => {
                                navigation.navigate('login');
                            }, 1000);
                        } else {
                            setCustomError(err.message);
                        }
                    });
            }
            catch (err) {
                console.log(err);
                return;
            }
        }
    }

    return (
        <>
            {success === null ? <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
                    <View style={styles.container}>
                        <View>
                            <Text style={styles.headingDark}>Create Your Account!</Text>
                            <Text style={styles.headingLight}>Never let good food go to waste!</Text>
                        </View>

                        {customError !== '' &&
                            <View style={{ flexDirection: 'row', marginTop: spacing, top: 3 }}>
                                <Feather name="alert-triangle" style={{ left: -8 }} size={17} color={colors.red} />
                                <Text style={{ color: colors.red }}>{customError}</Text>
                            </View>
                        }

                        <View style={[styles.inputContainer, styles.topInputContainer]}>
                            <AntDesign name="user" size={22} style={{ top: 2 }} color={nameFocus ? colors.red : colors.dark} />
                            <TextInput style={styles.input} placeholder='Full Name' onFocus={() => {
                                setNameFocus(true);
                                setEmailFocus(false);
                                setPasswordFocus(false);
                                setShowPassword(false);
                                setConfirmPasswordFocus(false);
                                setShowConfirmPassword(false);
                                setPhoneFocus(false);
                                setCustomError('');
                            }} onSubmitEditing={() => { refEmail.current.focus(); Keyboard.dismiss; }} blurOnSubmit={false} onChangeText={(text) => { setName(text); setError(prevState => ({ ...prevState, nameErr: false })); }} />
                            {error.nameErr && <MaterialIcons style={{ top: 7, right: -2 }} name="error-outline" size={15} color={colors.red} />}
                        </View>

                        <View style={styles.inputContainer}>
                            <AntDesign name="mail" size={22} style={{ top: 2 }} color={emailFocus ? colors.red : colors.dark} />
                            <TextInput style={styles.input} placeholder='Email Address' onFocus={() => {
                                setEmailFocus(true);
                                setNameFocus(false);
                                setPasswordFocus(false);
                                setShowPassword(false);
                                setConfirmPasswordFocus(false);
                                setShowConfirmPassword(false);
                                setPhoneFocus(false);
                                setCustomError('');
                            }} keyboardType="email-address" ref={refEmail} onSubmitEditing={() => { refPassword.current.focus(); Keyboard.dismiss; }} blurOnSubmit={false} onChangeText={(text) => { setEmail(text.trim()); setError(prevState => ({ ...prevState, emailErr: false })); }} autoCapitalize='none' />
                            {error.emailErr && <MaterialIcons style={{ top: 7, right: -2 }} name="error-outline" size={15} color={colors.red} />}
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="lock-outline" size={22} style={{ top: 2 }} color={passwordFocus ? colors.red : colors.dark} />
                            <TextInput style={[styles.input, styles.password]} placeholder='Password' onFocus={() => {
                                setPasswordFocus(true);
                                setNameFocus(false);
                                setEmailFocus(false);
                                setConfirmPasswordFocus(false);
                                setShowConfirmPassword(false);
                                setPhoneFocus(false);
                                setCustomError('');
                            }} secureTextEntry={showPassword ? false : true} ref={refPassword} onSubmitEditing={() => { refConfirmPassword.current.focus(); Keyboard.dismiss; }} blurOnSubmit={false} onChangeText={(text) => { setPassword(text.trim()); setError(prevState => ({ ...prevState, passwordErr: false })); }} />
                            {error.passwordErr && <MaterialIcons style={{ top: 7, right: -2 }} name="error-outline" size={15} color={colors.red} />}
                            {!error.passwordErr && <Octicons name={showPassword === false ? 'eye-closed' : 'eye'} size={21} color={colors.gray} style={{ top: 3, right: 8 }} onPress={() => setShowPassword(!showPassword)} />}
                        </View>

                        <View style={styles.inputContainer}>
                            <MaterialCommunityIcons name="lock-outline" size={22} style={{ top: 2 }} color={confirmPasswordFocus ? colors.red : colors.dark} />
                            <TextInput style={[styles.input, styles.password]} placeholder='Confirm Password' onFocus={() => {
                                setConfirmPasswordFocus(true);
                                setNameFocus(false);
                                setEmailFocus(false);
                                setPasswordFocus(false);
                                setShowPassword(false);
                                setPhoneFocus(false);
                                setCustomError('');
                            }} secureTextEntry={showConfirmPassword ? false : true} ref={refConfirmPassword} onSubmitEditing={() => { refPhone.current.focus(); Keyboard.dismiss; }} blurOnSubmit={false} onChangeText={(text) => { setConfirmPassword(text.trim()); setError(prevState => ({ ...prevState, confirmPasswordErr: false })); }} />
                            {error.confirmPasswordErr && <MaterialIcons style={{ top: 7, right: -2 }} name="error-outline" size={15} color={colors.red} />}
                            {!error.confirmPasswordErr && <Octicons name={showConfirmPassword === false ? 'eye-closed' : 'eye'} size={21} color={colors.gray} style={{ top: 3, right: 8 }} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
                        </View>

                        <View style={styles.inputContainer}>
                            <AntDesign name="phone" size={22} style={{ top: -1, left: -1, transform: [{ rotate: '90deg' }] }} color={phoneFocus ? colors.red : colors.dark} />
                            <TextInput style={styles.input} placeholder='Phone Number' onFocus={() => {
                                setPhoneFocus(true);
                                setNameFocus(false);
                                setEmailFocus(false);
                                setPasswordFocus(false);
                                setShowPassword(false);
                                setConfirmPasswordFocus(false);
                                setShowConfirmPassword(false);
                                setCustomError('');
                            }} keyboardType="number-pad" ref={refPhone} onSubmitEditing={() => { refAddress.current.focus(); Keyboard.dismiss; }} blurOnSubmit={false} onChangeText={(text) => { setPhone(text); setError(prevState => ({ ...prevState, phoneErr: false })); }} />
                            {error.phoneErr && <MaterialIcons style={{ top: 7, right: -2 }} name="error-outline" size={15} color={colors.red} />}
                        </View>

                        <Text style={styles.address}>Please enter your address</Text>

                        <View style={styles.inputContainer}>
                            <FontAwesome5 name="map-marker-alt" size={22} style={{ top: 2 }} color={colors.red} />
                            <TextInput style={styles.input} placeholder='Address' onFocus={() => { setCustomError('') }} ref={refAddress} onSubmitEditing={() => { refCity.current.focus(); Keyboard.dismiss; }} onChangeText={(text) => { setAddress(text); setError(prevState => ({ ...prevState, addressErr: false })); }} />
                            {error.addressErr && <MaterialIcons style={{ top: 7, right: -6 }} name="error-outline" size={15} color={colors.red} />}
                        </View>

                        <View style={{ width: '100%' }}>
                            <View style={styles.picker}>
                                <Picker
                                    ref={refCity}
                                    selectedValue={city}
                                    onValueChange={(itemValue, itemIndex) => {
                                        setCity(itemValue);
                                        setError(prevState => ({ ...prevState, cityErr: false }));
                                    }} style={{ width: '100%', color: city === '' ? '#A9A9AC' : colors.dark }}>
                                    <Picker.Item style={{ fontSize: 15, color: colors.gray }} label="City" value="" />
                                    <Picker.Item style={{ fontSize: 15 }} label="Karachi" value="Karachi" />
                                    <Picker.Item style={{ fontSize: 15 }} label="Islamabad" value="Islamabad" />
                                    <Picker.Item style={{ fontSize: 15 }} label="Lahore" value="Lahore" />
                                </Picker>
                                {error.cityErr && <Text style={{ position: 'absolute', top: 14, right: 14, backgroundColor: colors.white }}><MaterialIcons name="error-outline" size={15} color={colors.red} /> </Text>}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.btn} onPress={() => { handleSignup(); Keyboard.dismiss; }}>
                            <Text style={styles.btnText}>Sign up</Text>
                            <AntDesign name="login" size={18} color="white" style={{ top: 1, left: 10 }} />
                        </TouchableOpacity>

                        <View style={styles.hr} />

                        <View style={{ marginBottom: spacing * 3 }}>
                            <Text>Already have an account?
                                <Text style={styles.login} onPress={() => navigation.navigate('login')}> Log In</Text>
                            </Text>
                        </View>

                        {loading && (
                            <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '120%', backgroundColor: 'rgba(0, 0, 0, 0.2)', zIndex: 5000, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                                <View style={{ alignItems: 'center', top: -20 }}>
                                    <SkypeIndicator color="#ffffff" size={42} />
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>

                :

                <View style={styles.successContainer}>
                    <View style={styles.imgContainer}>
                        <Image style={styles.img} source={require('../assets/account-created.jpg')} />
                    </View>
                    <View style={{ width: '70%', alignItems: 'center' }}>
                        <Text style={styles.successMsg}>{success}</Text>
                    </View>
                </View>
            }
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: colors.white,
        zIndex: 2,
        paddingTop: StatusBar.currentHeight * 1.2,
        paddingBottom: spacing * 1.7
    },

    headingDark: {
        color: colors.black,
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: spacing * 0.3,
        textAlign: 'center'
    },
    headingLight: {
        color: colors.dark,
        fontSize: 15,
        fontWeight: '300',
        textAlign: 'center'
    },

    topInputContainer: {
        marginTop: spacing * 1.8
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
        marginLeft: spacing * 1.3,
        width: '80%'
    },
    password: {
        paddingRight: spacing * 2
    },
    address: {
        fontSize: 14,
        color: colors.gray,
        textAlign: 'center',
        marginTop: spacing * 1.3,
        marginBottom: spacing * 0.2
    },
    picker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '84%',
        height: spacing * 4.5,
        marginVertical: spacing * 0.8,
        borderRadius: spacing * 0.4,
        paddingLeft: spacing * 0.7,
        paddingVertical: spacing,
        alignSelf: 'center',
        backgroundColor: colors.white,
        elevation: spacing * 0.5
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
        marginTop: spacing,
        flexDirection: 'row'
    },
    btnText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "700"
    },

    or: {
        color: colors.red,
        fontWeight: "bold",
        fontSize: 14,
        marginTop: spacing * 1.1,
        marginBottom: spacing * 0.3
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
        marginTop: spacing * 0.9,
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
        marginVertical: spacing * 0.7,
        marginBottom: spacing * 1.2,
        marginTop: spacing * 2.4
    },

    login: {
        color: colors.gray,
        fontWeight: '500'
    },

    successContainer: {
        flex: 1,
        backgroundColor: colors.white,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    img: {
        width: '100%',
        height: '100%',
    },
    imgContainer: {
        width: '100%',
        height: '45%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing * 10
    },

    successMsg: {
        fontSize: 18,
        color: colors.secondary,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: spacing * 1.8
    }
})

export default SignupScreen;