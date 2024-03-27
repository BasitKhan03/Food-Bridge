import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Text, ScrollView, Image } from 'react-native';

import SubHeaderNav from '../components/SubHeaderNav';
import DrawerView from '../components/DrawerView';
import Spinner from '../components/Spinner';

import { doc, updateDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/FirebaseConfig';

import colors from '../config/colors';
import spacing from '../config/spacing';

export default function NotificationScreen({ navigation, route, user, notificationData, setNotificationData }) {

    // const { notificationData } = route.params;
    // const { userLoggedUid } = route.params;
    const [notification, setNotification] = useState([]);
    const [loading, setLoading] = useState(false);

    const userLoggedUid = user.uid;

    useFocusEffect(
        React.useCallback(() => {
            const markNotificationsAsRead = async () => {
                try {
                    for (const notification of notificationData) {
                        const notificationDocRef = doc(db, 'notification', notification.id);
                        const notificationDocSnapshot = await getDoc(notificationDocRef);

                        if (!notificationDocSnapshot.exists() || notificationDocSnapshot.data().isRead) {
                            continue;
                        }

                        await updateDoc(notificationDocRef, { isRead: true });
                    }
                } catch (err) {
                    console.log(err);
                }
            };

            markNotificationsAsRead();
        }, [notificationData])
    );

    useFocusEffect(
        React.useCallback(() => {
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
                        setNotificationData(notificationData);
                    }
                    else {
                        setNotificationData([]);
                    }
                }
                catch (err) {
                    console.error(err);
                }
            }

            getNotification();
        }, [setNotificationData])
    );

    useEffect(() => {
        const getNotification = async () => {
            setLoading(true);
            const docRef = collection(db, 'notification');
            const q = query(docRef, where('userId', '==', userLoggedUid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const notificationData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setNotification(notificationData);
                setLoading(false);
            }

            setLoading(false);
        }

        getNotification();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const getNotification = async () => {
                setLoading(true);
                const docRef = collection(db, 'notification');
                const q = query(docRef, where('userId', '==', userLoggedUid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const notificationData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setNotification(notificationData);
                    setLoading(false);
                }

                setLoading(false);
            }

            getNotification();
        }, [])
    );

    function getRelativeDay(timestamp) {
        const currentDate = new Date();
        const notificationDate = timestamp.toDate(); // Convert Firebase timestamp to JavaScript Date object

        // Calculate the time difference in milliseconds
        const timeDiff = currentDate.getTime() - notificationDate.getTime();

        // Calculate the time difference in days
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

        if (daysDiff === 0) {
            return 'Today';
        } else if (daysDiff === 1) {
            return 'Yesterday';
        } else if (daysDiff <= 7) {
            return `Last week`;
        } else if (daysDiff <= 31) {
            return 'Last month';
        } else {
            return 'Earlier';
        }
    }

    const groupedNotifications = {};

    // Group notifications by relative time
    notification.forEach((notif) => {
        const relativeTime = getRelativeDay(notif.date);

        if (!groupedNotifications[relativeTime]) {
            groupedNotifications[relativeTime] = [];
        }

        groupedNotifications[relativeTime].push(notif);
    });

    function getSortOrder(relativeTime) {
        if (relativeTime === 'Today') {
            return 1;
        } else if (relativeTime === 'Yesterday') {
            return 2;
        } else if (relativeTime === 'Last week') {
            return 3;
        } else if (relativeTime === 'Last month') {
            return 4;
        } else if (relativeTime === 'Earlier') {
            return 5;
        } else {
            return 6;
        }
    }

    function getRelativeTime(timestamp) {
        const currentDate = new Date();
        const notificationDate = timestamp.toDate(); // Convert Firebase timestamp to JavaScript Date object

        // Calculate the time difference in milliseconds
        const timeDiff = currentDate.getTime() - notificationDate.getTime();

        // Calculate the time difference in minutes, hours, and days
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            if (minutesDiff < 60) {
                return `${minutesDiff} min ago`;
            } else {
                return `${hoursDiff} hr ago`;
            }
        }
    }

    const sortedNotifications = Object.entries(groupedNotifications).sort((a, b) => {
        const timeA = getSortOrder(a[0]);
        const timeB = getSortOrder(b[0]);

        return timeA - timeB;
    }).map(([relativeTime, notifications]) => {
        const sortedNotifications = notifications.sort((a, b) => {
            const timeA = a.date.toDate().getTime();
            const timeB = b.date.toDate().getTime();

            return timeB - timeA; // Sort in descending order based on timestamp
        });

        return [relativeTime, sortedNotifications];
    });

    return (
        <>
            <DrawerView style={styles.drawerView}>
                <View style={[{ height: '100%', width: '100%' }, notification.length > 0 ? null : styles.bg]}>
                    <View style={{ zIndex: 1000 }}>
                        <SubHeaderNav navigation={navigation} title={'Notifications'} />
                    </View>

                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} scrollEventThrottle={16}>
                        <View style={styles.container} >

                            {loading && <View style={{ marginTop: spacing * 20 }}>
                                <Spinner />
                            </View>}

                            {notification.length > 0 ? (

                                sortedNotifications.map(([relativeTime, notifications]) => (
                                    <View key={relativeTime}>
                                        <View style={styles.dayBox}>
                                            <Text style={styles.dayText}>{relativeTime}</Text>
                                        </View>

                                        {notifications.map((notification) => (
                                            <View key={notification.id}>
                                                <View style={styles.notificationBox}>
                                                    <View style={styles.imageBox}>
                                                        <Image
                                                            source={require('../assets/notification.png')}
                                                            style={{ width: 28, height: 28, top: -1 }}
                                                        />
                                                    </View>
                                                    <View style={styles.contentBox}>
                                                        <View style={{ marginBottom: spacing * 0.5, flexDirection: 'row', justifyContent: 'space-between' }}>
                                                            <Text style={styles.heading}>{notification.name}</Text>
                                                            {getRelativeDay(notification.date) === 'Today' && (
                                                                <Text style={[styles.notificationDateText, { fontSize: 12.5 }]}>{getRelativeTime(notification.date)}</Text>
                                                            )}
                                                            {getRelativeDay(notification.date) === 'Yesterday' && (
                                                                <Text style={[styles.notificationDateText, { fontSize: 12.1 }]}>{new Date(notification.date.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                                            )}
                                                            {getRelativeDay(notification.date) !== 'Today' && getRelativeDay(notification.date) !== 'Yesterday' && (
                                                                <Text style={styles.notificationDateText}>{new Date(notification.date.seconds * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).split(' ').reverse().join(' ')}
                                                                </Text>
                                                            )}
                                                        </View>
                                                        {(notification.category === 'Add' || notification.category === 'Expired') &&
                                                            <View>
                                                                <Text style={styles.msg}>{notification.message}</Text>
                                                                <Text style={{ marginTop: spacing * 0.6, fontWeight: '500', color: colors.darkLight }}>
                                                                    Quantity: <Text style={{ fontWeight: '400', color: colors.black }}>x{notification.quantity}</Text>
                                                                </Text>
                                                            </View>
                                                        }

                                                        {notification.category === 'Update' &&
                                                            <View>
                                                                <Text style={styles.msg}>{notification.message}</Text>
                                                                <Text style={{ marginTop: spacing * 0.6, fontWeight: '500', color: colors.darkLight, marginBottom: spacing * 0.2 }}>
                                                                    Updates:
                                                                </Text>
                                                                <Text style={{ fontWeight: '400', fontSize: 13.5, color: colors.black, marginBottom: spacing * 0.2, lineHeight: 18.5 }}>{Array.isArray(notification.fields) ? notification.fields.join('\n') : ''}</Text>
                                                            </View>
                                                        }

                                                        {notification.category === 'Delete' &&
                                                            <View style={{ marginBottom: spacing * 0.3 }}>
                                                                <Text style={styles.msg}>{notification.message}</Text>
                                                            </View>
                                                        }

                                                        {notification.category === 'Level' &&
                                                            <View style={{ marginBottom: spacing * 0.3 }}>
                                                                <Text style={[styles.msg, { lineHeight: 18.5 }]}>{notification.message}</Text>
                                                            </View>
                                                        }

                                                        {notification.category === 'Order' &&
                                                            <View style={{ marginBottom: spacing * 0.3 }}>
                                                                <Text style={[styles.msg, { lineHeight: 18.5 }]}>{notification.message}</Text>
                                                                <Text style={{ marginTop: spacing * 0.6, fontWeight: '500', color: colors.darkLight }}>
                                                                    Mode: <Text style={{ fontWeight: '400', color: colors.black }}>{notification.mode}</Text>
                                                                </Text>
                                                            </View>
                                                        }

                                                        {notification.category === 'Request' &&
                                                            <View style={{ marginBottom: spacing * 0.3 }}>
                                                                <Text style={styles.msg}>{notification.message}</Text>
                                                                <Text style={[styles.msg, { marginTop: spacing * 0.5 }]}>{notification.message2}</Text>
                                                            </View>
                                                        }

                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                ))
                            ) : (
                                !loading && <View style={{ justifyContent: 'center', alignItems: 'center', height: '72%', width: '100%' }}>
                                    <Image source={require('../assets/no-notifications.png')} style={{ width: 220, height: 220 }} />
                                    <View>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.gray, top: -8 }}>No notifications yet !</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                </View>
            </DrawerView>
        </>
    )
}

const styles = StyleSheet.create({
    drawerView: {
        flex: 1,
        backgroundColor: colors.light,
        overflow: 'hidden'
    },

    container: {
        height: '100%',
        width: '100%',
        marginTop: spacing * 1.5,
        marginBottom: spacing * 6
    },

    dayBox: {
        marginTop: spacing * 2,
        marginLeft: spacing * 2.2
    },
    dayText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.darkBlue,
        textDecorationLine: 'underline',
    },

    notificationBox: {
        width: '90%',
        paddingVertical: spacing * 1.6,
        backgroundColor: colors.white,
        alignSelf: 'center',
        marginTop: spacing * 1.5,
        borderRadius: spacing * 0.5,
        elevation: spacing * 0.2,
        shadowColor: colors.whiteSmoke,
        alignItems: 'center',
        flexDirection: 'row'
    },
    imageBox: {
        backgroundColor: '#f2f2f2',
        width: 50,
        height: 50,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: spacing * 1.8
    },
    contentBox: {
        marginLeft: spacing * 0.1,
        width: '72%',
        paddingRight: spacing
    },
    heading: {
        fontSize: 15.5,
        fontWeight: '500',
        color: colors.darkBlue2
    },
    msg: {
        fontSize: 13.5,
        paddingRight: spacing * 0.5
    },
    notificationDateText: {
        color: colors.gray,
        fontSize: 12.3,
        top: -4,
        right: 1
    },

    bg: {
        backgroundColor: colors.white,
    }
})
