import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, StatusBar } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

import Spinner from '../components/Spinner';
import BottomTab from '../components/BottomTab';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/FirebaseConfig';

import colors from '../config/colors';
import spacing from '../config/spacing';

export default function ItemRequestScreen({ navigation, user }) {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const readData = async () => {
            setLoading(true);
            const itemRequestsCollectionRef = collection(db, 'itemRequests');
            const q = query(itemRequestsCollectionRef, where('sourceUID', '==', user.uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const requestData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRequests(requestData);
                setLoading(false);
            } else {
                setRequests([]);
                setLoading(false);
            }
        };

        readData();
    }, [user]);

    useFocusEffect(
        React.useCallback(() => {
            const readData = async () => {
                setLoading(true);
                const itemRequestsCollectionRef = collection(db, 'itemRequests');
                const q = query(itemRequestsCollectionRef, where('sourceUID', '==', user.uid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const requestData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setRequests(requestData);
                    setLoading(false);
                } else {
                    setRequests([]);
                    setLoading(false);
                }
            };

            readData();
        }, [user])
    );

    return (
        <>
            <View style={styles.container}>

                <StatusBar translucent backgroundColor="transparent" />

                <View style={styles.header}>
                    <View style={styles.box}>
                        <TouchableOpacity onPress={() => { navigation.navigate('home') }} style={{ top: 1.7, marginLeft: spacing }}>
                            <Ionicons name="arrow-back" size={spacing * 2.7} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.box}>
                        <Text style={styles.title}>Item Requests</Text>
                    </View>

                    <View style={styles.box}>
                        <View style={{ top: -0.5, marginRight: spacing }}>
                            <Feather name="box" size={21} color={colors.darkRed} />
                        </View>
                    </View>
                </View>

                <View>
                    {loading && <View style={styles.body}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', height: '75%', width: '100%' }}>
                            <Spinner />
                        </View>
                    </View>}

                    {!loading && <View style={styles.body}>
                        <ScrollView contentContainerStyle={{ flexGrow: 1 }} scrollEventThrottle={16}>

                            {requests.length > 0 ? (<View>

                                <View style={{ marginTop: spacing * 3.5, marginBottom: spacing * 17 }}>
                                    <View style={{ marginLeft: spacing * 2.5 }}>
                                        <Text style={styles.heading}>Current Requests</Text>
                                    </View>

                                    <View style={styles.hr} />

                                    <View style={{ marginTop: spacing * 1.7 }}>
                                        {requests
                                            .map((item, index) => {
                                                return (
                                                    <View style={styles.itemContainer} key={index}>
                                                        <View style={styles.item}>
                                                            <View>
                                                                <Image source={{ uri: item.itemImg }} style={styles.itemImg} />
                                                            </View>
                                                            <View style={styles.itemBox}>
                                                                <Text style={styles.itemName}>{item.itemName}</Text>
                                                                <Text style={styles.itemCategory}>{item.itemCategory}</Text>
                                                                <Text style={[styles.itemExpiry, { fontSize: 12.5 }]}>Requested By: <Text style={{ fontSize: 12.2 }}>{item.destinationName}</Text></Text>
                                                            </View>
                                                            <View style={styles.quantityBox}>
                                                                <Text style={styles.itemQuantity}>{`x${item.itemQuantity}`}</Text>
                                                            </View>
                                                        </View>
                                                    </View>)
                                            })}
                                    </View>

                                </View>
                            </View>)
                                :
                                (<View style={{ width: '95%', height: 240, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: spacing * 13.5 }}>
                                    <Image source={require('../assets/no-items.png')} style={{ width: '100%', height: '100%' }} />
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.gray, top: -3.7 }}>No item requests made!</Text>
                                </View>)}
                        </ScrollView>
                    </View>}
                </View>

                <BottomTab navigation={navigation} active='itemRequest' />
            </View>
        </>
    )
}


const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.white
    },

    header: {
        backgroundColor: colors.white,
        flexDirection: "row",
        justifyContent: "space-between",
        width: '100%',
        height: 100,
        padding: spacing * 2,
        paddingTop: StatusBar.currentHeight,
        paddingBottom: spacing * 0.1,
        elevation: spacing * 1.5,
        shadowColor: colors.darkLight,
        zIndex: 1005
    },
    box: {
        flexDirection: "row",
        alignItems: "center"
    },
    title: {
        fontSize: 15.8,
        fontWeight: "700",
        color: colors.darkBlue
    },

    body: {
        width: '100%',
        height: '100%'
    },

    heading: {
        fontSize: 15.8,
        fontWeight: '700',
        color: colors.darkLight
    },
    hr: {
        width: '86%',
        alignSelf: 'center',
        // borderBottomWidth: 1,
        // borderBottomColor: '#E0E0E0',
        borderBottomWidth: 0.35,
        borderBottomColor: colors.twitterBlue,
        top: 3,
        left: -0.5
    },

    itemContainer: {
        width: '88%',
        borderRadius: spacing * 0.7,
        marginVertical: spacing * 1.2,
        elevation: spacing * 1.5,
        shadowColor: colors.gray,
        backgroundColor: colors.white,
        alignSelf: 'center',
        marginTop: spacing * 1.5,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemBox: {
        marginLeft: spacing * 1.5
    },
    itemImg: {
        width: spacing * 10,
        height: spacing * 10,
        borderRadius: spacing * 0.7,
        resizeMode: 'cover'
    },
    itemName: {
        fontSize: 15.2,
        fontWeight: "700",
        color: colors.darkBlue2,
    },
    itemCategory: {
        fontSize: 13.8,
        color: colors.gray,
    },
    quantityBox: {
        position: 'absolute',
        top: 20,
        right: 23
    },
    itemQuantity: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.darkGray,
        marginTop: spacing * 0.1,
    },
    itemExpiry: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.darkRed,
        marginTop: spacing * 1.1,
        left: 1
    },
})