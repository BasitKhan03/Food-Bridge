import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { differenceInDays, addDays } from 'date-fns';
import { Feather } from '@expo/vector-icons';

import DrawerView from '../components/DrawerView';
import SubHeaderNav from '../components/SubHeaderNav';
import Spinner from '../components/Spinner';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/FirebaseConfig';

import colors from '../config/colors';
import spacing from '../config/spacing';

export default function MyListingsScreen({ navigation, user }) {
    const [validFoodData, setValidFoodData] = useState([]);
    const [expiredFoodData, setExpiredFoodData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const readData = async () => {
            setLoading(true);
            const foodDataCollectionRef = collection(db, 'foodData');
            const q = query(foodDataCollectionRef,
                where('userId', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const currentDate = new Date();
                const foodData = querySnapshot.docs.map(doc => {
                    const foodItem = { id: doc.id, ...doc.data() };
                    const listingDate = foodItem.listingDate.toDate();
                    const listingPeriod = foodItem.listingPeriod;
                    const expirationDate = new Date(listingDate.getTime() + (listingPeriod * 24 * 60 * 60 * 1000));

                    return {
                        ...foodItem,
                        isExpired: expirationDate < currentDate
                    };
                });

                const validFoodData = foodData.filter(item => !item.isExpired);
                const expiredFoodData = foodData.filter(item => item.isExpired);

                setValidFoodData(validFoodData);
                setExpiredFoodData(expiredFoodData);
                setLoading(false);
            } else {
                setValidFoodData([]);
                setExpiredFoodData([]);
                setLoading(false);
            }
        };

        readData();
    }, [user]);

    useFocusEffect(
        React.useCallback(() => {
            const readData = async () => {
                setLoading(true);
                const foodDataCollectionRef = collection(db, 'foodData');
                const q = query(foodDataCollectionRef,
                    where('userId', '==', user.uid)
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const currentDate = new Date();
                    const foodData = querySnapshot.docs.map(doc => {
                        const foodItem = { id: doc.id, ...doc.data() };
                        const listingDate = foodItem.listingDate.toDate();
                        const listingPeriod = foodItem.listingPeriod;
                        const expirationDate = new Date(listingDate.getTime() + (listingPeriod * 24 * 60 * 60 * 1000));

                        return {
                            ...foodItem,
                            isExpired: expirationDate < currentDate
                        };
                    });

                    const validFoodData = foodData.filter(item => !item.isExpired);
                    const expiredFoodData = foodData.filter(item => item.isExpired);

                    setValidFoodData(validFoodData);
                    setExpiredFoodData(expiredFoodData);
                    setLoading(false);
                } else {
                    setValidFoodData([]);
                    setExpiredFoodData([]);
                    setLoading(false);
                }
            };

            readData();
        }, [user])
    );

    return (
        <>
            <DrawerView style={styles.drawerView}>
                <View style={{ zIndex: 1000 }}>
                    <SubHeaderNav navigation={navigation} title={'My Listings'} />
                </View>

                {loading && <View style={styles.container}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', height: '75%', width: '100%' }}>
                        <Spinner />
                    </View>
                </View>}

                {!loading && <View style={styles.container}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} scrollEventThrottle={16}>

                        {validFoodData.length > 0 || expiredFoodData.length > 0 ? (

                            <View>
                                {validFoodData.length > 0 && (
                                    <View style={{ marginTop: spacing * 3.5, marginBottom: expiredFoodData.length > 0 ? spacing * 0.5 : spacing * 16 }}>
                                        <View style={{ marginLeft: spacing * 2.5 }}>
                                            <Text style={styles.heading}>Current Items</Text>
                                        </View>

                                        <View style={styles.hr} />

                                        <View style={{ marginTop: spacing * 1.7 }}>
                                            {validFoodData
                                                .slice()
                                                .sort((a, b) => {
                                                    const listingDateA = a.listingDate.toDate();
                                                    const listingDateB = b.listingDate.toDate();
                                                    const expirationDateA = addDays(listingDateA, a.listingPeriod);
                                                    const expirationDateB = addDays(listingDateB, b.listingPeriod);
                                                    return expirationDateA - expirationDateB;
                                                })
                                                .map((item, index) => {
                                                    const listingDate = new Date(item.listingDate.seconds * 1000);
                                                    const listingPeriod = Number(item.listingPeriod);
                                                    const expirationDate = addDays(listingDate, listingPeriod);
                                                    const daysLeft = differenceInDays(expirationDate, new Date());

                                                    return (
                                                        <View style={styles.itemContainer} key={index}>
                                                            <TouchableOpacity style={styles.item} onPress={() => { navigation.navigate('itemEdit', { item: item, user: user, screen: 'My Listings' }) }}>
                                                                <View>
                                                                    <Image source={{ uri: item.imageURL }} style={styles.itemImg} />
                                                                </View>
                                                                <View style={styles.itemBox}>
                                                                    <Text style={styles.itemName}>{item.title}</Text>
                                                                    <Text style={styles.itemCategory}>{item.selectedTag}</Text>
                                                                    <Text style={[styles.itemExpiry, { fontSize: 12.5 }]}>Valid for <Text style={{ fontSize: 12.2 }}>{daysLeft + 1}</Text> {daysLeft > 1 ? 'days' : 'day'}</Text>
                                                                </View>
                                                                <View style={styles.quantityBox}>
                                                                    <Text style={styles.itemQuantity}>{`x${item.quantity}`}</Text>
                                                                </View>
                                                                <View style={styles.symbolBox}>
                                                                    <Feather name="unlock" size={14.5} color={colors.gray} />
                                                                </View>
                                                            </TouchableOpacity>
                                                        </View>
                                                    )
                                                })}
                                        </View>
                                    </View>
                                )}

                                {expiredFoodData.length > 0 && (
                                    <View style={{ marginTop: spacing * 4, marginBottom: spacing * 15 }}>
                                        <View style={{ marginLeft: spacing * 2.5 }}>
                                            <Text style={styles.heading}>Expired Items</Text>
                                        </View>

                                        <View style={[styles.hr, { borderBottomColor: colors.red }]} />

                                        <View style={{ marginTop: spacing * 1.6 }}>
                                            {expiredFoodData.map((item, index) => (
                                                <View style={[styles.itemContainer, { elevation: spacing, shadowColor: colors.whiteSmoke, borderWidth: 0.2, borderColor: colors.gray }]} key={index}>
                                                    <View style={styles.item}>
                                                        <View>
                                                            <Image source={{ uri: item.imageURL }} style={styles.itemImg} />
                                                        </View>
                                                        <View style={styles.itemBox}>
                                                            <Text style={styles.itemName}>{item.title}</Text>
                                                            <Text style={styles.itemCategory}>{item.selectedTag}</Text>
                                                            <Text style={styles.itemExpiry}>Expired</Text>
                                                        </View>
                                                        <View style={styles.quantityBox}>
                                                            <Text style={styles.itemQuantity}>{`x${item.quantity}`}</Text>
                                                        </View>
                                                        <View style={styles.symbolBox}>
                                                            <Feather name="lock" size={15} color={colors.darkGray} />
                                                        </View>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>

                        ) : (

                            <View style={{ width: '95%', height: 240, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: spacing * 13.5 }}>
                                <Image source={require('../assets/no-items.png')} style={{ width: '100%', height: '100%' }} />
                                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.gray, top: -3.7 }}>No items listed yet!</Text>
                            </View>

                        )}
                    </ScrollView>
                </View>}
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
        bottom: 14,
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

    symbolBox: {
        position: 'absolute',
        top: 20,
        right: 22
    },
})