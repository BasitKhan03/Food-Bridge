import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import HeaderNav from '../components/HeaderNav';
import NotificationModal from '../components/NotificationModal';
import SearchBar from '../components/SearchBar';
import Categories from '../components/Categories';
import Spinner from '../components/Spinner';
import CustomAlert from '../components/CustomAlert';
import Food from '../components/Food';
import FoodItemModal from '../components/FoodItemModal';
import FloatingButton from '../components/FloatingButton';
import BottomTab from '../components/BottomTab';
import LevelupModal from '../components/LevelupModal';
import DrawerView from '../components/DrawerView';

import { doc, addDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase/FirebaseConfig';
import { onAuthStateChanged } from "firebase/auth";

import colors from '../config/colors';
import spacing from '../config/spacing';

export default function HomeScreen({ navigation, setUser, setNotificationData, setUserLevel }) {
    const [activeCategory, setActiveCategory] = useState(0);
    const [isModalVisible, setModalVisible] = useState(false);
    const [search, setSearch] = useState('');
    const [foodData, setFoodData] = useState([]);
    const [userLoggedUid, setUserLoggedUid] = useState(null);
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [nameLoading, setNameLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [notification, setNotification] = useState([]);
    const [scroll, setScroll] = useState(false);
    const [levelup, setLevelup] = useState('');
    const [showLevelupModal, setShowLevelupModal] = useState(false);

    // ----|| Function for checking the scroll position of screen to set the shadow of HeaderNav ||---->
    const handleScroll = (event) => {
        const { contentOffset } = event.nativeEvent;
        const pageYOffset = contentOffset.y;
        pageYOffset > 30 ? setScroll(true) : setScroll(false);
    };

    // ----|| Function for checking if user is currently logged-in ||---->
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

    // ----|| Function for retrieving username of logged-in account ||---->
    useEffect(() => {
        const getUsername = async () => {
            setNameLoading(true);
            setLoading(true);
            const docRef = collection(db, 'userData');
            const q = query(docRef, where('uid', '==', userLoggedUid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    setUserData(doc.data());
                    setUser(doc.data());
                    setNameLoading(false);
                });
            }
        }
        getUsername();
    }, [userLoggedUid, setUser]);

    // ----|| Function for retrieving user level of logged-in account ||---->
    useEffect(() => {
        const getUserLevel = async () => {
            const docRef = collection(db, 'userScores');
            const q = query(docRef, where('uid', '==', userLoggedUid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {

                    const userData = doc.data();
                    const userLevel = userData.level;

                    setUserLevel(userLevel);
                });
            }
        };

        getUserLevel();
    }, [userLoggedUid, setUserLevel]);

    // ----|| Function for retrieving food items from Firebase ||---->
    useEffect(() => {
        const readData = async () => {
            setLoading(true);
            const foodDataCollectionRef = collection(db, 'foodData');
            const currentDate = new Date();

            const querySnapshot = await getDocs(foodDataCollectionRef);

            const data = querySnapshot.docs
                .map((doc) => {
                    const foodItem = doc.data();
                    const listingDate = foodItem.listingDate.toDate();
                    const listingPeriod = foodItem.listingPeriod;

                    const expirationDate = new Date(listingDate.getTime() + listingPeriod * 24 * 60 * 60 * 1000);

                    if (expirationDate >= currentDate && foodItem.city === userData.city && foodItem.status === 'available') {
                        return foodItem;
                    }
                    return null;
                })
                .filter((item) => item !== null);

            setFoodData(data);
            setLoading(false);
        };

        if (userData.city) {
            readData();
        }

    }, [userData]);

    // ----|| Function for checking if any food item is expired and if found then uploading a notification to Firebase ||---->
    useEffect(() => {
        const readData = async () => {
            const myFoodItemCollectionRef = collection(db, 'myFoodItem');
            const currentDate = new Date();

            const querySnapshot = await getDocs(
                query(
                    myFoodItemCollectionRef,
                    where('userId', '==', userLoggedUid),
                    where('notificationSent', '==', false)
                )
            );

            const data = querySnapshot.docs
                .map((doc) => {
                    const foodItem = doc.data();
                    const listingDate = foodItem.listingDate.toDate();
                    const listingPeriod = foodItem.listingPeriod;

                    const expirationDate = new Date(listingDate.getTime() + (listingPeriod * 24 * 60 * 60 * 1000));

                    if (expirationDate < currentDate) {
                        return { id: doc.id, ...foodItem };
                    }
                    return null;
                })
                .filter((item) => item !== null);

            data.forEach(async (item) => {
                try {
                    const notificationData = {
                        userId: userLoggedUid,
                        name: item.title,
                        quantity: item.quantity,
                        message: `Your item '${item.title}' has been removed`,
                        category: 'Expired',
                        isRead: false,
                        date: new Date()
                    };

                    const docRef = await addDoc(collection(db, 'notification'), notificationData);

                    const myFoodItemDocRef = doc(db, 'myFoodItem', item.id);
                    await updateDoc(myFoodItemDocRef, { notificationSent: true });
                } catch (err) {
                    console.log(err);
                }
            });
        };

        readData();
    }, [userLoggedUid]);

    // useFocusEffect(
    //     React.useCallback(() => {
    //         const readData = async () => {
    //             const myFoodItemCollectionRef = collection(db, 'myFoodItem');
    //             const currentDate = new Date();

    //             const querySnapshot = await getDocs(
    //                 query(
    //                     myFoodItemCollectionRef,
    //                     where('userId', '==', userLoggedUid),
    //                     where('notificationSent', '==', false)
    //                 )
    //             );

    //             const data = querySnapshot.docs
    //                 .map((doc) => {
    //                     const foodItem = doc.data();
    //                     const listingDate = foodItem.listingDate.toDate();
    //                     const listingPeriod = foodItem.listingPeriod;

    //                     const expirationDate = new Date(listingDate.getTime() + (listingPeriod * 24 * 60 * 60 * 1000));

    //                     if (expirationDate < currentDate) {
    //                         return { id: doc.id, ...foodItem };
    //                     }
    //                     return null;
    //                 })
    //                 .filter((item) => item !== null);

    //             data.forEach(async (item) => {
    //                 try {
    //                     const notificationData = {
    //                         userId: userLoggedUid,
    //                         name: item.title,
    //                         quantity: item.quantity,
    //                         message: `Your item '${item.title}' has been removed`,
    //                         category: 'Delete',
    //                         isRead: false,
    //                         date: new Date()
    //                     };

    //                     const docRef = await addDoc(collection(db, 'notification'), notificationData);

    //                     const myFoodItemDocRef = doc(db, 'myFoodItem', item.id);
    //                     await updateDoc(myFoodItemDocRef, { notificationSent: true });
    //                 } catch (err) {
    //                     console.log(err);
    //                 }
    //             });
    //         };

    //         readData();
    //     }, [userLoggedUid])
    // );

    // ----|| Function for retrieving notifications from Firebase (runs after every 1 minute) ||---->
    useEffect(() => {
        const getNotification = async () => {
            try {
                const docRef = collection(db, 'notification');
                const q = query(docRef, where('userId', '==', userLoggedUid), where('isRead', '==', false));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const notificationData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setNotification(notificationData);
                    setNotificationData(notificationData);
                }
                else {
                    setNotification([]);
                    setNotificationData([]);
                }
            }
            catch (err) {
                console.error(err);
            }
        }

        getNotification();

        const interval = setInterval(() => {
            getNotification();
        }, 60000);

        return () => {
            clearInterval(interval);
        };

    }, [userLoggedUid, setNotificationData])

    useFocusEffect(
        React.useCallback(() => {
            const getNotification = async () => {
                const docRef = collection(db, 'notification');
                const q = query(docRef, where('userId', '==', userLoggedUid), where('isRead', '==', false));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const notificationData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setNotification(notificationData);
                    setNotificationData(notificationData);
                }
                else {
                    setNotification([]);
                    setNotificationData([]);
                }
            };

            getNotification();
        }, [userLoggedUid, setNotificationData])
    );

    // ----|| Function for automatically closing alert box after 10 seconds ||---->
    useEffect(() => {
        let timer;

        if (showAlert) {
            timer = setTimeout(() => {
                setShowAlert(false);
            }, 10000);
        }

        return () => clearTimeout(timer);
    }, [showAlert]);

    // ----|| Function for toggling food item modal ||---->
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    // ----|| Function for toggling alert box ||---->
    const toggleAlert = () => {
        setShowAlert(!showAlert);
    };

    // ----|| Function for toggling notification box ||---->
    const toggleNotification = () => {
        setShowNotification(!showNotification);
    };

    // ----|| Function for opening drawer menu ||---->
    const openDrawer = () => {
        navigation.openDrawer();
    };

    useEffect(() => {
        const checkLevelup = async () => {
            const docRef = collection(db, 'userScores');
            const q = query(docRef, where('uid', '==', userLoggedUid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach(async (doc) => {
                    const userData = doc.data();
                    const score = userData.score;
                    let levelup = '';

                    if (score >= 50 && score < 100 && userData.showedFor < 2) {
                        levelup = 2;
                        await updateDoc(doc.ref, { level: 2, showedFor: 2 });
                        setShowLevelupModal(true);
                    } else if (score >= 100 && score < 200 && userData.showedFor < 3) {
                        levelup = 3;
                        await updateDoc(doc.ref, { level: 3, showedFor: 3 });
                        setShowLevelupModal(true);
                    } else if (score >= 200 && score < 350 && userData.showedFor < 4) {
                        levelup = 4;
                        await updateDoc(doc.ref, { level: 4, showedFor: 4 });
                        setShowLevelupModal(true);
                    } else if (score >= 350 && score < 550 && userData.showedFor < 5) {
                        levelup = 5;
                        await updateDoc(doc.ref, { level: 5, showedFor: 5 });
                        setShowLevelupModal(true);
                    } else if (score >= 550 && score < 800 && userData.showedFor < 6) {
                        levelup = 6;
                        await updateDoc(doc.ref, { level: 6, showedFor: 6 });
                        setShowLevelupModal(true);
                    }

                    if (levelup > 0) {
                        const notificationData = {
                            userId: userLoggedUid,
                            name: 'Level up',
                            message: `Congratulations! You have reached Level ${levelup}`,
                            category: 'Level',
                            isRead: false,
                            date: new Date(),
                        };

                        await addDoc(collection(db, 'notification'), notificationData);
                    }

                    setLevelup(levelup);
                });
            }
        };

        checkLevelup();

    }, [userLoggedUid]);

    const toggleLevelupAlert = () => {
        setShowLevelupModal(!showLevelupModal);
    };

    useEffect(() => {
        let timer;

        if (showLevelupModal) {
            timer = setTimeout(() => {
                setShowLevelupModal(false);
            }, 10000);
        }

        return () => clearTimeout(timer);
    }, [showLevelupModal]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);

        const readData = async () => {
            const foodDataCollectionRef = collection(db, 'foodData');
            const currentDate = new Date();

            const querySnapshot = await getDocs(foodDataCollectionRef);

            const data = querySnapshot.docs
                .map((doc) => {
                    const foodItem = doc.data();
                    const listingDate = foodItem.listingDate.toDate();
                    const listingPeriod = foodItem.listingPeriod;

                    const expirationDate = new Date(listingDate.getTime() + listingPeriod * 24 * 60 * 60 * 1000);

                    if (expirationDate >= currentDate && foodItem.city === userData.city && foodItem.status === 'available') {
                        return foodItem;
                    }
                    return null;
                })
                .filter((item) => item !== null);

            setFoodData(data);
            setRefreshing(false);
        };

        if (userData.city) {
            readData();
        }
    }, [userData]);

    return (
        <>
            <View style={{ flex: 1 }}>

                <DrawerView style={styles.drawerView}>

                    <View style={[scroll ? styles.scroll : null]}>
                        <HeaderNav scroll={scroll} username={userData.name} nameLoading={nameLoading} showNotification={showNotification} toggleNotification={toggleNotification} notification={notification} openDrawer={openDrawer} />
                    </View>

                    {showNotification && <NotificationModal showNotification={showNotification} toggleNotification={toggleNotification} notification={notification} navigation={navigation} userLoggedUid={userLoggedUid} />}

                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} onScroll={handleScroll} scrollEventThrottle={16} refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#D17842"]} />}>

                        <View style={styles.container}>

                            <View style={styles.taglineContainer}>
                                <Text style={styles.tagline}>
                                    Let's find food near you ...
                                </Text>
                            </View>

                            <SearchBar setSearch={setSearch} search={search} />
                            <Categories activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

                            {loading && <Spinner />}

                            {showLevelupModal && <LevelupModal msg1="You've reached" msg2="Congratulations!" showAlert={showLevelupModal} toggleAlert={toggleLevelupAlert} levelup={levelup} />}

                            {showAlert && <CustomAlert msg1='Item successfully listed!' msg2='Thank You!' showAlert={showAlert} toggleAlert={toggleAlert} />}

                            <Food loading={loading} activeCategory={activeCategory} setActiveCategory={setActiveCategory} data={foodData} searchText={search} navigation={navigation} />
                        </View>

                    </ScrollView>

                    <BottomTab navigation={navigation} active='home' />

                    <FloatingButton toggleModal={toggleModal} />

                    <FoodItemModal modalVisibility={isModalVisible} toggleModal={toggleModal} navigation={navigation} toggleAlert={toggleAlert} userLoggedUid={userLoggedUid} />

                </DrawerView>


            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        padding: spacing * 2,
        paddingTop: - spacing * 0.1
    },

    taglineContainer: {
        width: "70%",
        marginTop: spacing * 2.2,
        marginLeft: spacing
    },
    tagline: {
        fontSize: spacing * 2.9,
        fontWeight: "700",
        color: colors.black
    },

    scroll: {
        backgroundColor: colors.white,
        elevation: spacing,
        shadowColor: colors.darkLight,
        zIndex: 1000
    },

    drawerView: {
        flex: 1,
        backgroundColor: colors.white,
        overflow: 'hidden'
    }
})