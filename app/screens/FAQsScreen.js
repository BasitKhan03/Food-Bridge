import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Text, Image, ImageBackground, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { Entypo } from '@expo/vector-icons';

import DrawerView from '../components/DrawerView';
import SubHeaderNav from '../components/SubHeaderNav';
import Spinner from '../components/Spinner';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/FirebaseConfig';

import colors from '../config/colors';
import spacing from '../config/spacing';

export default function FAQsScreen({ navigation }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(null);

    const rotation = useRef(new Animated.Value(0)).current;

    const toggleRotation = () => {
        Animated.timing(rotation, {
            toValue: active ? 0 : 1,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();
        setActive(!active);
    };

    useEffect(() => {
        const getFAQs = async () => {
            setLoading(true);

            const docRef = collection(db, 'FAQs');
            const querySnapshot = await getDocs(docRef);

            if (!querySnapshot.empty) {
                const newData = [];
                querySnapshot.forEach((doc) => {
                    newData.push(doc.data());
                });
                setData(newData);
            }

            setLoading(false);
        }

        getFAQs();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            setLoading(false);
            setActive(false);
            setCurrentIndex(null);
            toggleRotation();
        }, [])
    );

    const rotateInterpolation = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['90deg', '0deg'],
    });

    const rotateStyle = { transform: [{ rotate: rotateInterpolation }] };

    return (
        <>
            <DrawerView style={styles.drawerView}>
                <View>
                    <SubHeaderNav navigation={navigation} title={'FAQs'} />
                </View>

                <View style={styles.container}>

                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} scrollEventThrottle={16}>

                        {/* <ImageBackground style={{ top: 24, height: 250, alignItems: 'center' }}>
                        <Image source={require('../assets/faqs1.png')} style={{ width: '73%', height: '73%', left: 8 }} />
                    </ImageBackground> */}

                        {/* <ImageBackground style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={require('../assets/faqs2.jpg')} style={{ width: '80%', height: '80%' }} />
                    </ImageBackground> */}

                        <ImageBackground style={{ height: 200, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={require('../assets/faqs3.png')} style={{ width: '88%', height: '92%' }} />
                        </ImageBackground>

                        {loading && <View style={{ marginTop: spacing * 11.5 }}>
                            <Spinner />
                        </View>}

                        {!loading && <View style={{ width: '100%', marginTop: spacing * 2.5, marginBottom: spacing * 15 }}>
                            {data.sort((a, b) => a.id - b.id).map(({ id, question, answer }, index) => {
                                const isActive = index === currentIndex;

                                return (
                                    <TouchableOpacity
                                        key={id}
                                        onPress={() => {
                                            setCurrentIndex(isActive ? null : index);
                                            setActive(!active);
                                            toggleRotation();
                                        }}
                                        style={styles.cardContainer}
                                        activeOpacity={0.8}>

                                        <View style={styles.card}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={[styles.heading, { color: isActive ? colors.darkLight : colors.darkGray }]}>{question}</Text>
                                                <Animated.View style={[{ position: 'absolute', right: 16 }, rotateStyle]}>
                                                    <Entypo name="chevron-with-circle-right" size={14} color={isActive ? colors.primary : colors.dark} />
                                                </Animated.View>
                                            </View>

                                            {index === currentIndex && <View style={styles.answers}>
                                                <View style={styles.hr} />
                                                <Text style={styles.body}>{answer}</Text>
                                            </View>}
                                        </View>

                                    </TouchableOpacity>
                                );
                            })}
                        </View>}

                        {/* <View style={styles.chatbotContainer}>
                        <View>
                            <Text>Chatbot</Text>
                        </View>

                        <View style={styles.chatbot}>

                        </View>
                    </View> */}

                    </ScrollView>

                </View>

            </DrawerView>
        </>
    )
}

const styles = StyleSheet.create({
    drawerView: {
        flex: 1,
        backgroundColor: colors.white,
        overflow: 'hidden',
    },
    container: {
        width: '100%',
        height: '100%',
    },

    cardContainer: {
        flexGrow: 1,
        marginBottom: spacing * 1.5,
    },
    card: {
        flexGrow: 1,
        width: '88%',
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        borderRadius: spacing * 0.3,
        paddingVertical: spacing * 1.8,
        paddingHorizontal: spacing * 0.5,
        borderWidth: 0.3,
        borderColor: colors.primary,
    },
    heading: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.gray,
        marginLeft: spacing * 1.2,
        paddingRight: spacing * 4.8
    },
    body: {
        fontSize: 13.5,
        color: colors.darkBlue2,
        lineHeight: 18.4,
        marginLeft: spacing * 1.5,
        paddingRight: spacing * 2.2
    },

    hr: {
        width: '90%',
        alignSelf: 'center',
        marginVertical: spacing * 1.8,
        // borderBottomWidth: 1,
        // borderBottomColor: '#E0E0E0',
        borderBottomWidth: 0.25,
        borderBottomColor: colors.primary
    },
})