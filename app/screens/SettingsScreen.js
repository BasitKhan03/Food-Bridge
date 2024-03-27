import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Keyboard, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AntDesign, Entypo, Feather, Ionicons, MaterialIcons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

import DrawerView from '../components/DrawerView';
import SubHeaderNav from '../components/SubHeaderNav';
import Spinner from '../components/Spinner';
import CustomAlert2 from '../components/CustomAlert2';
import CustomAlert3 from '../components/CustomAlert3';

import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db, auth, storage } from '../firebase/FirebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

import colors from '../config/colors';
import spacing from '../config/spacing';

export default function SettingsScreen({ navigation }) {
    const [editProfile, setEditProfile] = useState(true);
    const [userLoggedUid, setUserLoggedUid] = useState(null);
    const [userData, setUserData] = useState([]);
    const [image, setImage] = useState(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showAlert1, setShowAlert1] = useState(false);
    const [showAlert2, setShowAlert2] = useState(false);
    const [showAlert3, setShowAlert3] = useState(false);
    const [phoneErr, setPhoneErr] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [customError, setCustomError] = useState('');
    const [error, setError] = useState({
        currentPasswordErr: false,
        newPasswordErr: false,
        confirmPasswordErr: false
    });

    const refPhone = useRef();
    const refAddress = useRef();
    const refCity = useRef();
    const refNewPass = useRef();
    const refConPass = useRef();

    const cities = [
        { label: 'City', value: '' },
        { label: 'Karachi', value: 'Karachi' },
        { label: 'Islamabad', value: 'Islamabad' },
        { label: 'Lahore', value: 'Lahore' }
    ];

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    useEffect(() => {
        const checkLogin = () => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserLoggedUid(user.uid);
                } else {
                    setUserLoggedUid([]);
                    console.log('No user logged in (Settings)');
                }
            });
        }

        checkLogin();
    }, []);

    useEffect(() => {
        const getUserData = async () => {
            setLoading(true);
            const docRef = collection(db, 'userData');
            const q = query(docRef, where('uid', '==', userLoggedUid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    setUserData(doc.data());
                    setLoading(false);
                });
            }
        }
        getUserData();
    }, [userLoggedUid]);

    // ----|| Function for handling gallery permission from user ||---->
    const requestPermission = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
            }
        }
    };

    // ----|| useEffect function that calls requestPermission() function when this component is mounted ||---->
    useEffect(() => {
        requestPermission();
    }, []);

    // ----|| Function for selecting image from gallery using ImagePicker ||---->
    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 4],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        }
        catch (error) {
            console.log(error);
            setImage(null);
        }
    }

    const handleSubmit = async () => {
        Keyboard.dismiss();

        if (phone !== '') {
            if (phone.length !== 11) {
                setPhoneErr(true);
            } else {
                toggleAlert();
            }
        }

        else {
            toggleAlert();
        }
    }

    const updateChanges = async () => {
        try {
            setLoading1(true);

            const updatedUserData = {};

            if (name !== '') {
                updatedUserData.name = name.trim();
            }

            if (phone !== '') {
                updatedUserData.phone = phone;
            }

            if (address !== '') {
                updatedUserData.address = address.trim();
            }

            if (city !== '') {
                updatedUserData.city = city;
            }

            if (image !== null) {
                const response = await fetch(image);
                const blob = await response.blob();
                const fileName = image.split('/').pop();
                const storageRef = ref(storage, `userImages/${fileName}`);
                await uploadBytes(storageRef, blob);
                const downloadURL = await getDownloadURL(storageRef);
                updatedUserData.imageURL = downloadURL;
            }

            const userQuery = query(collection(db, 'userData'), where('uid', '==', userLoggedUid));
            const querySnapshot = await getDocs(userQuery);

            if (!querySnapshot.empty) {
                const documentRef = doc(db, 'userData', querySnapshot.docs[0].id);
                await updateDoc(documentRef, updatedUserData);
            }

            setLoading1(false);
            console.log('Document updated');
            setShowAlert1(true);

        } catch (error) {
            console.log(error.message);
        }
    }

    const handlePasswordChange = async () => {
        if (currentPassword === '' || newPassword === '' || confirmPassword === '') {
            if (currentPassword === '') {
                setError(prevState => ({ ...prevState, currentPasswordErr: true }));
            }
            if (newPassword === '') {
                setError(prevState => ({ ...prevState, newPasswordErr: true }));
            }
            if (confirmPassword === '') {
                setError(prevState => ({ ...prevState, confirmPasswordErr: true }));
            }
        }

        if (newPassword !== '' && newPassword.length < 6) {
            setCustomError('New password should be at least 6 characters');
            return;
        }

        if ((newPassword !== '' && confirmPassword !== '') && newPassword !== confirmPassword) {
            setCustomError('Password do not match');
            return;
        }

        else if (currentPassword !== '' && newPassword !== '' && confirmPassword !== '') {
            Keyboard.dismiss();
            setCustomError('');
            setShowAlert2(true);
        }
    }

    const updatePassword = async () => {
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);

        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, currentPassword);

            reauthenticateWithCredential(user, credential)
                .then(() => {
                    updatePassword(user, newPassword)
                        .then(() => {
                            console.log('Password changed successfully');
                            setShowAlert3(true);
                        })
                        .catch((error) => {
                            console.log('Error updating password:', error.message);
                            setCustomError('Server error. Try again later');
                        });
                })
                .catch((error) => {
                    console.log('Error reauthenticating user:', error.message);
                    setCustomError('Incorrect password entered');
                });
        }
        catch (error) {
            console.log(error.message);
        }
    }

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                console.log('Logged out (Settings)');
                navigation.navigate('welcome');
            })
            .catch((err) => { console.log(err) });
    }

    const toggleAlert = () => {
        setShowAlert(!showAlert);
    };

    const toggleAlert1 = () => {
        setShowAlert1(!showAlert1);
    };

    const toggleAlert2 = () => {
        setShowAlert2(!showAlert2);
    };

    const toggleAlert3 = () => {
        setShowAlert3(!showAlert3);
    };

    const clean = () => {
        setImage(null);
        setName('');
        setPhone('');
        setPhoneErr(false);
        setAddress('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPhoneErr(false);
        setCustomError('');
        setError(prevState => ({ ...prevState, currentPasswordErr: false }));
        setError(prevState => ({ ...prevState, newPasswordErr: false }));
        setError(prevState => ({ ...prevState, confirmPasswordErr: false }));
    }

    useFocusEffect(
        React.useCallback(() => {
            setImage(null);
            setName('');
            setPhone('');
            setPhoneErr(false);
            setAddress('');
            setShowAlert(false);
            setShowAlert1(false);
            setShowAlert2(false);
            setLoading1(false);
            setLoading(false);
            setEditProfile(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setCustomError('');
            setError(prevState => ({ ...prevState, currentPasswordErr: false }));
            setError(prevState => ({ ...prevState, newPasswordErr: false }));
            setError(prevState => ({ ...prevState, confirmPasswordErr: false }));
        }, [])
    )

    return (
        <>
            <DrawerView style={styles.drawerView}>

                <View>
                    <SubHeaderNav navigation={navigation} title={'Account Settings'} />
                </View>

                <View style={styles.container}>

                    <View style={styles.profileImage}>

                        {editProfile &&
                            <TouchableOpacity onPress={pickImage}>
                                {image ?
                                    <View>
                                        <View style={styles.userImageBorder}>
                                            <Image source={{ uri: image }} style={styles.userImage} />
                                        </View>
                                        <View style={styles.add}>
                                            <Entypo name="plus" size={19} color={colors.white} />
                                        </View>
                                    </View>
                                    :
                                    <View>
                                        <View style={styles.userImageIcon}>
                                            <AntDesign name="user" size={37} color={colors.primary} />
                                        </View>
                                        <View style={styles.add}>
                                            <Entypo name="plus" size={19} color={colors.white} />
                                        </View>
                                    </View>
                                }
                            </TouchableOpacity>
                        }

                        {!editProfile &&
                            <View>
                                <Image source={require('../assets/password.png')} style={{ width: 160, height: 160, top: -25, marginBottom: -spacing * 6 }} />
                            </View>
                        }


                    </View>

                    <View style={styles.optionsBox}>
                        <View style={[styles.options, { width: '48%', backgroundColor: editProfile ? colors.secondary : colors.light }]}>
                            <TouchableOpacity style={[styles.optionsBtn, { marginLeft: spacing * 0.9 }]} onPress={() => { setEditProfile(true); clean(); }}>
                                <Feather name="edit" size={16.5} color={editProfile ? colors.white : colors.gray} style={{ left: -8 }} />
                                <Text style={[styles.optionsText, { color: editProfile ? colors.white : colors.dark, fontWeight: editProfile ? '700' : '600' }]}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.options, { width: '52%', backgroundColor: !editProfile ? colors.secondary : colors.light }]}>
                            <TouchableOpacity style={styles.optionsBtn} onPress={() => { setEditProfile(false); clean(); }}>
                                <Feather name="key" size={17} color={!editProfile ? colors.white : colors.gray} style={{ left: -8 }} />
                                <Text style={[styles.optionsText, { left: -3, color: !editProfile ? colors.white : colors.dark, fontWeight: !editProfile ? '700' : '600' }]}>Change Password</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.card}>

                        {showAlert && <CustomAlert2 msg1='Do you want to save changes?' msg2='Select!' showAlert={showAlert} toggleAlert={toggleAlert} update={updateChanges} opt='1' />}

                        {showAlert1 && <CustomAlert2 msg1='Changes successfully saved!' msg2='Reload to see your changes!' showAlert={showAlert1} toggleAlert={toggleAlert1} navigation={navigation} clean={clean} opt='2' />}


                        {showAlert2 && <CustomAlert2 msg1='Do you want to save changes?' msg2='Select!' showAlert={showAlert2} toggleAlert={toggleAlert2} update={updatePassword} opt='1' />}

                        {showAlert3 && <CustomAlert3 msg1='Password successfully changed!' msg2='Login again!' showAlert={showAlert3} toggleAlert={toggleAlert3} handleLogout={handleLogout} opt='1' />}


                        {loading && <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: spacing * 14 }}>
                            <Spinner />
                        </View>}


                        {loading1 && <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: spacing * 12, position: 'absolute', width: '100%', zIndex: 1005 }}>
                            <Spinner />
                        </View>}

                        {!loading &&
                            <ScrollView contentContainerStyle={{ flexGrow: 1 }} scrollEventThrottle={16} keyboardShouldPersistTaps="handled" style={{ marginTop: spacing * 2.8 }}>

                                {editProfile &&
                                    <View>
                                        <View style={styles.inputBox}>
                                            <View style={styles.inputHeadingContainer}>
                                                <AntDesign name="user" size={18.5} color={colors.primary} />
                                                <Text style={styles.inputHeadingText}>Full Name</Text>
                                            </View>

                                            <View style={styles.inputContainer}>
                                                <TextInput style={styles.input} placeholder={userData.name} placeholderTextColor={colors.gray} onChangeText={(newName) => { setName(newName); }} onSubmitEditing={() => { refPhone.current.focus(); Keyboard.dismiss; }} blurOnSubmit={false} value={name} editable={!loading1} />
                                            </View>
                                        </View>

                                        <View style={styles.inputBox}>
                                            <View style={styles.inputHeadingContainer}>
                                                <Feather name="phone" size={16.5} color={colors.primary} />
                                                <Text style={styles.inputHeadingText}>Phone Number</Text>
                                            </View>

                                            <View style={styles.inputContainer}>
                                                <TextInput style={styles.input} placeholder={userData.phone} placeholderTextColor={colors.gray} keyboardType="number-pad" onChangeText={(newPhone) => { setPhone(newPhone.trim()); setPhoneErr(false); }} ref={refPhone} onSubmitEditing={() => { refAddress.current.focus(); Keyboard.dismiss; }} blurOnSubmit={false} value={phone} editable={!loading1} />
                                            </View>

                                            <View style={{ flexDirection: 'row', marginLeft: spacing * 3.3 }}>
                                                {phoneErr && <MaterialIcons style={{ top: 2, right: -2 }} name="error-outline" size={14} color={colors.red} />}
                                                {phoneErr && <Text style={{ marginLeft: spacing * 0.5, top: 1, color: colors.red, fontSize: 11.5 }}>Phone number should be 11 digits long</Text>}
                                            </View>
                                        </View>

                                        <View style={styles.inputBox}>
                                            <View style={styles.inputHeadingContainer}>
                                                <Ionicons name="location-outline" size={18.5} color={colors.primary} />
                                                <Text style={styles.inputHeadingText}>Address</Text>
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <TextInput style={styles.input} placeholder={userData.address} placeholderTextColor={colors.gray} onChangeText={(newAddress) => { setAddress(newAddress); }} ref={refAddress} onSubmitEditing={() => { refCity.current.focus(); Keyboard.dismiss; }} blurOnSubmit={true} value={address} editable={!loading1} />
                                            </View>
                                        </View>

                                        <View style={styles.picker}>
                                            <Picker
                                                ref={refCity}
                                                selectedValue={city === '' ? userData.city : city}
                                                onValueChange={(itemValue, itemIndex) => { setCity(itemValue); }}
                                                style={{ width: '100%', color: colors.gray }}
                                            >
                                                {cities.map((cityItem) => (
                                                    <Picker.Item
                                                        key={cityItem.value}
                                                        label={cityItem.label}
                                                        value={cityItem.value}
                                                        selected={city === cityItem.value}
                                                        style={{ fontSize: 14, color: city === cityItem.value ? colors.dark : colors.gray }}
                                                    />
                                                ))}
                                            </Picker>
                                        </View>

                                        <View style={[{ marginTop: spacing * 1.5 }, isKeyboardVisible ? { marginBottom: spacing * 30 } : { marginBottom: spacing * 2 }]}>
                                            <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={(name === '' && phone === '' && address === '' && city === '' && image === null) || loading1} >
                                                <Text style={styles.btnText}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                }

                                {!editProfile &&
                                    <View>
                                        {customError !== '' &&
                                            <View style={{ flexDirection: 'row', top: -1, marginBottom: spacing * 0.4, alignSelf: 'center', alignItems: 'center' }}>
                                                <Feather name="alert-triangle" style={{ left: -7 }} size={14} color={colors.darkRed} />
                                                <Text style={{ color: colors.darkRed, fontSize: 13 }}>{customError}</Text>
                                            </View>
                                        }

                                        <View style={styles.inputBox}>
                                            <View style={styles.inputHeadingContainer}>
                                                <MaterialCommunityIcons name="lock-outline" size={18} color={colors.primary} />
                                                <Text style={styles.inputHeadingText}>Current Password</Text>
                                            </View>

                                            <View style={styles.inputContainer}>
                                                <TextInput style={styles.input}
                                                    placeholder='Enter current password'
                                                    onChangeText={(pass) => { setCurrentPassword(pass.trim()); setError(prevState => ({ ...prevState, currentPasswordErr: false })); }}
                                                    onSubmitEditing={() => { refNewPass.current.focus(); Keyboard.dismiss; setShowCurrentPassword(false); }}
                                                    onFocus={() => { setShowNewPassword(false); setShowConfirmPassword(false); }}
                                                    blurOnSubmit={false}
                                                    value={currentPassword}
                                                    secureTextEntry={showCurrentPassword ? false : true}
                                                    autoCapitalize='none' />
                                                {error.currentPasswordErr && <MaterialIcons style={{ top: 7, right: 8 }} name="error-outline" size={15} color={colors.red} />}
                                                {!error.currentPasswordErr && <Octicons name={showCurrentPassword === false ? 'eye-closed' : 'eye'} size={16} color={colors.gray} style={{ top: 6, right: 10 }} onPress={() => setShowCurrentPassword(!showCurrentPassword)} />}
                                            </View>
                                        </View>

                                        <View style={styles.inputBox}>
                                            <View style={styles.inputHeadingContainer}>
                                                <Feather name="lock" size={16} color={colors.primary} />
                                                <Text style={styles.inputHeadingText}>New Password</Text>
                                            </View>

                                            <View style={styles.inputContainer}>
                                                <TextInput style={styles.input}
                                                    placeholder='Enter new password'
                                                    onChangeText={(newPass) => { setNewPassword(newPass.trim()); setError(prevState => ({ ...prevState, newPasswordErr: false })); }}
                                                    ref={refNewPass}
                                                    onSubmitEditing={() => { refConPass.current.focus(); Keyboard.dismiss; setShowNewPassword(false); }}
                                                    onFocus={() => { setShowConfirmPassword(false); setShowCurrentPassword(false); }}
                                                    blurOnSubmit={false}
                                                    value={newPassword}
                                                    secureTextEntry={showNewPassword ? false : true}
                                                    autoCapitalize='none' />
                                                {error.newPasswordErr && <MaterialIcons style={{ top: 7, right: 8 }} name="error-outline" size={15} color={colors.red} />}
                                                {!error.newPasswordErr && <Octicons name={showNewPassword === false ? 'eye-closed' : 'eye'} size={16} color={colors.gray} style={{ top: 6, right: 10 }} onPress={() => setShowNewPassword(!showNewPassword)} />}
                                            </View>
                                        </View>

                                        <View style={styles.inputBox}>
                                            <View style={styles.inputHeadingContainer}>
                                                <Feather name="lock" size={16} color={colors.primary} />
                                                <Text style={styles.inputHeadingText}>Confirm Password</Text>
                                            </View>

                                            <View style={styles.inputContainer}>
                                                <TextInput style={styles.input}
                                                    placeholder='Enter password again'
                                                    onChangeText={(confirmPass) => { setConfirmPassword(confirmPass.trim()); setError(prevState => ({ ...prevState, confirmPasswordErr: false })); }} ref={refConPass}
                                                    onSubmitEditing={() => { Keyboard.dismiss; setShowNewPassword(false); setShowConfirmPassword(false); setShowCurrentPassword(false); }}
                                                    onFocus={() => { setShowNewPassword(false); setShowCurrentPassword(false); }}
                                                    blurOnSubmit={true}
                                                    value={confirmPassword}
                                                    secureTextEntry={showConfirmPassword ? false : true}
                                                    autoCapitalize='none' />
                                                {error.confirmPasswordErr && <MaterialIcons style={{ top: 7, right: 8 }} name="error-outline" size={15} color={colors.red} />}
                                                {!error.confirmPasswordErr && <Octicons name={showConfirmPassword === false ? 'eye-closed' : 'eye'} size={16} color={colors.gray} style={{ top: 6, right: 10 }} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
                                            </View>
                                        </View>

                                        <View style={[{ marginTop: spacing * 1.5 }, isKeyboardVisible ? { marginBottom: spacing * 30 } : { marginBottom: spacing * 2 }]}>
                                            <TouchableOpacity style={styles.btn} onPress={handlePasswordChange} disabled={(currentPassword === '' && newPassword === '' && confirmPassword === '') || loading1} >
                                                <Text style={styles.btnText}>Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                }

                            </ScrollView>
                        }
                    </View>
                </View>
            </DrawerView>
        </>
    )
}

const styles = StyleSheet.create({
    drawerView: {
        flex: 1,
        backgroundColor: colors.white,
        overflow: 'hidden'
    },

    container: {
        width: '100%',
        height: '100%',
    },

    profileImage: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: spacing * 3.5,
        elevation: spacing,
        shadowColor: colors.gray
    },
    userImageBorder: {
        width: 110,
        height: 110,
        borderRadius: spacing * 10,
        backgroundColor: colors.light,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        elevation: spacing * 4,
        shadowColor: colors.whiteSmoke,
        zIndex: 1001
    },
    userImageIcon: {
        width: 100,
        height: 100,
        borderRadius: spacing * 10,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: spacing * 4,
        shadowColor: colors.light,
        borderWidth: 0.4,
        borderColor: colors.secondary
    },
    userImage: {
        width: 105,
        height: 105,
        borderRadius: spacing * 10,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001
    },
    add: {
        width: 28,
        height: 28,
        borderRadius: spacing * 10,
        backgroundColor: colors.red,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        right: -6,
        bottom: 10,
        zIndex: 1100,
    },

    optionsBox: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: spacing * 3.5,
        width: '85%',
        alignSelf: 'center',
        backgroundColor: colors.light,
        borderRadius: spacing * 10,
    },
    options: {
        paddingVertical: spacing * 1.1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: spacing * 10,
    },
    optionsBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginLeft: spacing * 0.5
    },
    optionsText: {
        fontSize: 13.2,
        fontWeight: '600'
    },

    card: {
        width: '100%',
        height: '100%',
    },
    inputBox: {
        marginTop: spacing * 1.6
    },
    inputHeadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing * 3.6,
        marginBottom: spacing * 0.3
    },
    inputHeadingText: {
        marginLeft: spacing * 0.7,
        fontSize: 13.5,
        fontWeight: '600',
        color: colors.darkLight
    },
    inputContainer: {
        flexDirection: 'row',
        width: '80%',
        marginVertical: spacing * 0.5,
        backgroundColor: colors.white,
        borderRadius: spacing * 0.8,
        paddingHorizontal: spacing * 0.8,
        paddingVertical: spacing * 0.7,
        alignSelf: 'center',
        borderWidth: 0.4,
        borderColor: colors.whiteSmoke,
    },
    input: {
        color: colors.dark,
        fontSize: 14,
        marginLeft: spacing,
        width: '90%'
    },

    btn: {
        width: '80%',
        paddingVertical: spacing,
        backgroundColor: colors.primary,
        borderRadius: spacing * 5,
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        color: colors.white,
        marginTop: spacing * 1.2
    },
    btnText: {
        color: colors.white,
        fontSize: 15.8,
        fontWeight: "700"
    },

    picker: {
        width: '80%',
        height: spacing * 4.3,
        marginVertical: spacing * 0.5,
        backgroundColor: colors.white,
        marginTop: spacing * 0.7,
        borderColor: colors.gray,
        paddingHorizontal: spacing * 0.3,
        paddingVertical: spacing * 0.7,
        borderWidth: 0.4,
        borderRadius: spacing * 0.8,
        alignSelf: 'center',
        justifyContent: 'center',
        borderColor: colors.whiteSmoke,
    },
})