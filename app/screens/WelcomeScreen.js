import React, { useState, useEffect } from 'react';
import { StyleSheet, ImageBackground, Text, TouchableOpacity, View, StatusBar } from 'react-native';

import { auth } from '../firebase/FirebaseConfig';
import { onAuthStateChanged, signOut } from "firebase/auth";

import colors from '../config/colors';
import spacing from '../config/spacing';

function WelcomeScreen({ navigation }) {
    const [userLogged, setUserLogged] = useState(null);

    useEffect(() => {
        const checkLogin = () => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserLogged(user);
                } else {
                    setUserLogged(null);
                    console.log('No user logged in (Welcome)');
                }
            });
        }

        checkLogin();
    }, []);

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                setUserLogged(null);
                console.log('Logged out (Welcome)');
            })
            .catch((err) => { console.log(err) });
    }

    return (
        <ImageBackground style={{ flex: 1 }} source={require('../assets/welcome-bg.jpeg')}>

            <StatusBar translucent backgroundColor="transparent" />

            <View style={{ flex: 1, backgroundColor: colors.black, opacity: 0.4 }} />

            <View style={styles.container}>
                <View>
                    {userLogged == null ?

                        <View>
                            <Text style={styles.title}>Share Food, Reduce Waste, Feed More</Text>
                            <Text style={styles.subText}>Join the community, share a meal, and make a difference with every bite.</Text>

                            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('login')}>
                                <Text style={styles.btnText}>Get Started</Text>
                            </TouchableOpacity>
                        </View>

                        :

                        <View>
                            <Text style={styles.title}>Share Food, Reduce Waste, Feed More</Text>
                            <Text style={styles.subText2}>Signed in as &nbsp;<Text style={{ fontWeight: '700', fontStyle: 'italic' }}>{userLogged.email}</Text></Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <TouchableOpacity style={styles.btn2} onPress={() => handleLogout()}>
                                    <Text style={[styles.btnText2, { color: colors.darkRed }]}>Logout</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.btn2} onPress={() => navigation.navigate('home')}>
                                    <Text style={[styles.btnText2, { color: colors.green }]}>Continue</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }

                </View>
            </View>

        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        height: "100%",
        zIndex: 2,
        width: "100%",
        justifyContent: "flex-end",
        paddingHorizontal: spacing * 2,
        paddingBottom: spacing * 5
    },

    title: {
        color: colors.white,
        fontWeight: "800",
        fontSize: spacing * 4.5,
        textTransform: "capitalize"
    },
    subText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: spacing * 1.7,
        marginTop: spacing * 0.5
    },
    subText2: {
        color: colors.white,
        fontWeight: "600",
        fontSize: spacing * 1.7,
        marginTop: spacing * 0.8,
        top: spacing * 0.6
    },

    btn: {
        padding: spacing * 2,
        backgroundColor: colors.white,
        borderRadius: spacing * 2,
        alignItems: "center",
        marginTop: spacing * 3,
        marginBottom: spacing * 0.5
    },
    btn2: {
        width: '45%',
        padding: spacing * 2,
        backgroundColor: colors.white,
        borderRadius: spacing * 2,
        alignItems: "center",
        marginTop: spacing * 3,
        marginBottom: spacing * 0.5
    },
    btnText: {
        color: colors.black,
        fontSize: spacing * 2,
        fontWeight: "700"
    },
    btnText2: {
        color: colors.black,
        fontSize: spacing * 1.8,
        fontWeight: "700"
    }
})

export default WelcomeScreen;