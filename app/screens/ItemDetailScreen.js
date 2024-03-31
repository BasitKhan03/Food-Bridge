import React, { useState, useEffect } from 'react';
import { Dimensions, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { Ionicons, Feather, AntDesign, Entypo } from "@expo/vector-icons";
// import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Modal from "react-native-modal";

import Spinner from '../components/Spinner';
import OrderAlert from '../components/OrderAlert';
import CustomAlert4 from '../components/CustomAlert4';

import { addDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase/FirebaseConfig';
import { onAuthStateChanged } from "firebase/auth";

import colors from '../config/colors';
import spacing from '../config/spacing';

const { height } = Dimensions.get("window");

export default function ItemDetailScreen({ navigation, route }) {
    const [modal, setModal] = useState(false);
    const [location, setLocation] = useState({
        latitude: 24.8607,
        longitude: 67.0011,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showAlert1, setShowAlert1] = useState(false);
    const [errAlert, setErrAlert] = useState(false);
    const [itemUser, setItemUser] = useState([]);
    const [userLoggedUid, setUserLoggedUid] = useState(null);
    const [userData, setUserData] = useState([]);

    const userLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                alert(errorMsg);
                return;
            }

            let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });

            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        }
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        userLocation();
    }, [])

    const data = route.params;

    if (route.params === undefined) {
        navigation.navigate('home');
    }

    useEffect(() => {
        const checkLogin = async () => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserLoggedUid(user.uid);
                } else {
                    setUserLoggedUid([]);
                    console.log('No user logged in (Home)');
                }
            });
        }

        checkLogin();
    }, []);

    useEffect(() => {
        const getUsername = async () => {
            const docRef = collection(db, 'userData');
            const q = query(docRef, where('uid', '==', userLoggedUid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    setUserData(doc.data());
                });
            }
        }
        getUsername();
    }, [userLoggedUid]);

    useEffect(() => {
        const getUserdata = async () => {
            const docRef = collection(db, 'userData');
            const q = query(docRef, where('uid', '==', data.userId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    setItemUser(doc.data());
                });
            }
        }
        getUserdata();
    }, []);

    const toggleModal = () => {
        setModal(!modal);
    };

    const toggleAlert = () => {
        setShowAlert(!showAlert);
    };

    const toggleAlert1 = () => {
        setShowAlert1(!showAlert1);
    };

    const toggleErrAlert = () => {
        setErrAlert(!errAlert);
    };

    const handleYourself = async () => {
        toggleModal();

        if (data.status !== 'available') {
            toggleErrAlert();
        }

        else {
            try {
                setLoading(true);

                const sourceLocation = data.location + ', ' + data.city;
                const sourcePhone = itemUser.phone;
                const sourceUID = data.userId;
                const destinationLocation = userData.address + ', ' + userData.city;
                const destinationPhone = userData.phone;
                const destinationUID = userData.uid;
                const destinationName = userData.name;
                const timings = data.pickup;
                const itemName = data.title;
                const itemCategory = data.selectedTag;
                const itemImg = data.imageURL;
                const itemQuantity = data.quantity;
                const active = true;

                const request = {
                    sourceLocation,
                    sourcePhone,
                    sourceUID,
                    destinationPhone,
                    destinationUID,
                    destinationName,
                    destinationLocation,
                    timings,
                    itemName,
                    itemCategory,
                    itemImg,
                    itemQuantity,
                    active,
                };

                await addDoc(collection(db, 'itemRequests'), request);

                // Additional logic or actions after successfully adding the request

                // Update status to 'unavailable' in foodData collection
                const foodDataRef = collection(db, 'foodData');
                const foodDataQuery = query(foodDataRef, where('foodId', '==', data.foodId));
                const foodDataSnapshot = await getDocs(foodDataQuery);
                foodDataSnapshot.forEach(async (doc) => {
                    await updateDoc(doc.ref, { status: 'unavailable' });
                });

                // Update status to 'unavailable' in myFoodItem collection
                const myFoodItemRef = collection(db, 'myFoodItem');
                const myFoodItemQuery = query(myFoodItemRef, where('foodId', '==', data.foodId));
                const myFoodItemSnapshot = await getDocs(myFoodItemQuery);
                myFoodItemSnapshot.forEach(async (doc) => {
                    await updateDoc(doc.ref, { status: 'unavailable' });
                });

                // Add notification for the user who placed the order
                const notificationData = {
                    userId: userLoggedUid,
                    name: data.title,
                    message: `Your order for '${data.title}' has been placed`,
                    mode: 'Self',
                    category: 'Order',
                    isRead: false,
                    date: new Date()
                };

                await addDoc(collection(db, 'notification'), notificationData);

                // Add notification for the user who owns the item
                const notificationData1 = {
                    userId: data.userId,
                    name: data.title,
                    message: `A request has been made for your item '${data.title}`,
                    message2: 'Your item will be picked up on your given time',
                    category: 'Request',
                    isRead: false,
                    date: new Date()
                };

                await addDoc(collection(db, 'notification'), notificationData1);

                setLoading(false);
                toggleAlert1();
                console.log('Item request processed successfully');
            } catch (error) {
                console.log('Error adding item request:', error);
            }
        }
    };

    const handleDelivery = async () => {
        toggleModal();

        if (data.status !== 'available') {
            toggleErrAlert();
        }

        else {
            try {
                setLoading(true);

                const sourceLocation = data.location + ', ' + data.city;
                const sourcePhone = itemUser.phone;
                const sourceUID = data.userId;
                const destinationLocation = userData.address + ', ' + userData.city;
                const destinationPhone = userData.phone;
                const destinationUID = userData.uid;
                const destinationName = userData.name;
                const timings = data.pickup;
                const itemName = data.title;
                const itemCategory = data.selectedTag;
                const itemImg = data.imageURL;
                const itemQuantity = data.quantity;
                const active = true;

                const request = {
                    sourceLocation,
                    sourcePhone,
                    sourceUID,
                    destinationPhone,
                    destinationUID,
                    destinationLocation,
                    destinationName,
                    timings,
                    itemName,
                    itemCategory,
                    itemImg,
                    itemQuantity,
                    active,
                };

                await addDoc(collection(db, 'itemRequests'), request);

                // Additional logic or actions after successfully adding the request

                // Update status to 'unavailable' in foodData collection
                const foodDataRef = collection(db, 'foodData');
                const foodDataQuery = query(foodDataRef, where('foodId', '==', data.foodId));
                const foodDataSnapshot = await getDocs(foodDataQuery);
                foodDataSnapshot.forEach(async (doc) => {
                    await updateDoc(doc.ref, { status: 'unavailable' });
                });

                // Update status to 'unavailable' in myFoodItem collection
                const myFoodItemRef = collection(db, 'myFoodItem');
                const myFoodItemQuery = query(myFoodItemRef, where('foodId', '==', data.foodId));
                const myFoodItemSnapshot = await getDocs(myFoodItemQuery);
                myFoodItemSnapshot.forEach(async (doc) => {
                    await updateDoc(doc.ref, { status: 'unavailable' });
                });

                // Add notification for the user who placed the order
                const notificationData = {
                    userId: userLoggedUid,
                    name: data.title,
                    message: `Your order for '${data.title}' has been placed`,
                    category: 'Order',
                    mode: 'Delivery',
                    isRead: false,
                    date: new Date()
                };

                await addDoc(collection(db, 'notification'), notificationData);

                // Add notification for the user who owns the item
                const notificationData1 = {
                    userId: data.userId,
                    name: data.title,
                    message: `A request has been made for your item '${data.title}`,
                    message2: 'Your item will be picked up on your given time',
                    category: 'Request',
                    isRead: false,
                    date: new Date()
                };

                await addDoc(collection(db, 'notification'), notificationData1);

                setLoading(false);
                toggleAlert();
                console.log('Item request processed successfully');
            } catch (error) {
                console.log('Error adding item request:', error);
            }
        }
    }

    return (
        <>
            <ScrollView>
                <View>
                    <ImageBackground style={styles.backImg} source={{ uri: data.imageURL }}>
                        <TouchableOpacity style={styles.btnImg} onPress={() => { navigation.navigate('home') }}>
                            <Ionicons name="arrow-back" size={spacing * 2.5} color={colors.gray} />
                        </TouchableOpacity>
                    </ImageBackground>

                    <View style={styles.wrapper}>

                        <Modal style={{ flex: 1, margin: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
                            animationType="fade"
                            animationDuration={100}
                            transparent={true}
                            visible={modal}
                            onBackdropPress={toggleModal}
                            onRequestClose={toggleModal}
                            onBackButtonPress={toggleModal}>

                            <View style={styles.modal}>
                                <Text style={styles.imageModalText}>Request</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TouchableOpacity style={{ flexDirection: 'column', alignItems: 'center', top: -5, marginRight: spacing * 4 }} onPress={handleDelivery}>
                                        <Image style={{ height: 50, width: 50, marginTop: 18, marginBottom: 5 }} source={require('../assets/delivery.png')} />
                                        <Text style={styles.imageBtnText}>Delivery</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={{ flexDirection: 'column', alignItems: 'center', top: 4 }} onPress={handleYourself}>
                                        <Image style={{ height: 50, width: 50, marginBottom: 5 }} source={require('../assets/walk.png')} />
                                        <Text style={styles.imageBtnText}>Yourself</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </Modal>

                        <View style={styles.container}>
                            <View style={styles.line}></View>

                            <View style={{ width: '70%' }}>
                                <View style={styles.bar}></View>
                                <View style={{ width: '90%', textAlign: 'center', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}><Text style={styles.heading}>{data.title}</Text></View>
                                <Text style={{ textAlign: 'center', color: colors.gray, fontSize: spacing * 1.6, marginTop: spacing * 0.5 }}>{data.selectedTag}</Text>
                            </View>

                            <View style={styles.line}></View>
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>

                            <View style={styles.quanitity}>
                                <Feather name="box" size={spacing * 1.7} color={colors.gray} />
                                <Text style={styles.quanitityText}>Quantity: x{data.quantity}</Text>
                            </View>

                            <View style={styles.time}>
                                <AntDesign name="clockcircleo" color={colors.gray} size={spacing * 1.5} />
                                <Text style={styles.timeText}>Listing period: {data.listingPeriod} days</Text>
                            </View>

                        </View>

                        <View style={{ marginTop: spacing * 2.5 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <AntDesign name="filetext1" size={20} color={colors.primary} style={{ top: 4, marginRight: spacing * 0.5 }} />
                                <Text style={styles.detail}>Description</Text>
                            </View>
                            <Text style={styles.detailText}>- {data.description}</Text>
                        </View>

                        {loading &&
                            <View style={{ position: 'absolute', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', top: spacing * 8 }}>
                                <Spinner />
                            </View>
                        }

                        {showAlert && <OrderAlert msg1='Your order has been placed' msg2='Wait!' msg3='Payment must be made to the rider' showAlert={showAlert} toggleAlert={toggleAlert} navigation={navigation} />}

                        {showAlert1 && <OrderAlert msg1='Your order has been placed!' msg2='Pick up your order' msg3='Respect the given timings' showAlert={showAlert1} toggleAlert={toggleAlert1} navigation={navigation} />}

                        {errAlert && <CustomAlert4 msg1='Cannot place the order!' msg2='Failed!' showAlert={errAlert} toggleAlert={toggleErrAlert} navigation={navigation} />}

                        <View style={{ marginTop: spacing * 2.5 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Ionicons name="bicycle" color={colors.primary} size={25} style={{ top: 1, marginRight: spacing * 0.5 }} />
                                <Text style={styles.detail}>Pick-up time</Text>
                            </View>
                            <Text style={styles.detailText}>- {data.pickup}</Text>
                        </View>

                        <View style={styles.hr} />

                        <View style={{ marginTop: spacing * 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                <Text style={styles.detail}>Location</Text>
                                <Entypo name="location" size={22} color={colors.red} style={{ top: 1, marginLeft: spacing * 0.7 }} />
                            </View>
                            <Text style={[styles.detailText, { textAlign: 'center', fontWeight: '400', fontSize: spacing * 1.5 }]}>Approx location of the item</Text>

                            <View style={{ height: spacing * 20, marginTop: spacing }}>
                                {/* <MapView style={styles.map} region={location} scrollEnabled={false} zoomEnabled={false}>
                                    <Marker coordinate={location} title='Marker' />
                                </MapView> */}
                                <Image style={styles.map} source={require('../assets/map2.jpg')} />
                            </View>

                            <View>
                                <Text style={{ color: colors.gray, fontWeight: '500', top: 3 }}>{data.location}, {data.city}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View>
                <View style={{ padding: spacing * 2, paddingVertical: spacing * 1.5, backgroundColor: colors.white }}>
                    <TouchableOpacity style={styles.btn} onPress={() => { toggleModal(); }}>
                        <Text style={styles.btnText}>Select this for</Text>
                        <Text style={styles.btnPriceText}> Rs. 10</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    backImg: {
        padding: spacing * 2,
        height: height / 2.5,
        padding: spacing * 2,
        paddingTop: spacing * 4,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    btnImg: {
        height: spacing * 4.2,
        width: spacing * 4.2,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: spacing * 2.5,
        top: 5
    },

    wrapper: {
        padding: spacing * 2,
        paddingTop: spacing * 3,
        marginTop: -spacing * 3,
        borderTopLeftRadius: spacing * 3,
        borderTopRightRadius: spacing * 3,
        backgroundColor: colors.white,
    },
    container: {
        flexDirection: "row",
        marginBottom: spacing * 2.3,
        alignItems: "center",
        justifyContent: "space-evenly",
    },

    bar: {
        alignSelf: 'center',
        width: spacing * 4.2,
        height: 3.5,
        backgroundColor: colors.whiteSmoke,
        position: 'absolute',
        top: - spacing * 1.65,
        borderRadius: spacing
    },

    heading: {
        fontSize: spacing * 3,
        color: colors.black,
        fontWeight: "700",
        textAlign: 'center'
    },

    line: {
        padding: spacing,
        paddingHorizontal: spacing * 2.5,
        backgroundColor: colors.darkOrange,
        flexDirection: "row",
        borderRadius: spacing,
        justifyContent: "center",
        alignItems: "center",
        top: -7
    },

    time: {
        padding: spacing,
        paddingHorizontal: spacing * 1,
        backgroundColor: colors.light,
        flexDirection: "row",
        borderRadius: spacing,
        justifyContent: "center",
        alignItems: "center",
    },
    timeText: {
        fontSize: spacing * 1.5,
        fontWeight: "600",
        marginLeft: spacing / 2,
        color: colors.gray,
    },

    quanitity: {
        padding: spacing,
        paddingHorizontal: spacing * 1,
        backgroundColor: colors.light,
        flexDirection: "row",
        borderRadius: spacing,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: -4,
        marginRight: 8
    },
    quanitityText: {
        fontSize: spacing * 1.5,
        fontWeight: "600",
        marginLeft: spacing / 2,
        color: colors.gray,
    },

    detail: {
        fontSize: spacing * 1.9,
        fontWeight: "700",
        color: colors.dark,
        marginBottom: spacing * 0.4,
    },
    detailText: {
        fontSize: spacing * 1.6,
        fontWeight: "400",
        color: colors.gray,
    },

    hr: {
        width: '100%',
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
        marginTop: spacing * 1.8,
        marginBottom: spacing * 1.2
    },

    map: {
        width: '100%',
        height: '100%'
    },

    btn: {
        width: "100%",
        padding: spacing * 2,
        paddingVertical: spacing * 1.8,
        backgroundColor: colors.dark,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: spacing * 2,
    },
    btnText: {
        fontSize: spacing * 1.8,
        color: colors.white,
        fontWeight: "700",
    },
    btnPriceText: {
        fontSize: spacing * 1.7,
        color: colors.orange,
        fontWeight: "700",
        marginLeft: spacing / 2,
    },

    modal: {
        flex: 1,
        backgroundColor: colors.white,
        height: spacing * 14.5,
        width: '100%',
        alignSelf: 'center',
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        elevation: spacing
    },
    imageModalText: {
        color: colors.darkLight,
        fontSize: 15.2,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: spacing * 1.5,
    },
    imageBtnText: {
        color: colors.gray,
        fontSize: 13,
        fontWeight: "600"
    },
})
