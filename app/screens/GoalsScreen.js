import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, Dimensions, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import Spinner from '../components/Spinner';
import BottomTab from '../components/BottomTab';

import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/FirebaseConfig';

import colors from '../config/colors';
import spacing from '../config/spacing';

const screenHeight = Dimensions.get('window').height;
const calculatedBodyHeight = screenHeight - 100;

export default function GoalsScreen({ navigation, user }) {
    const [goals, setGoals] = useState([]);
    const [activeGoal, setActiveGoal] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Fetch daily goals
                const goalsCollectionRef = collection(db, 'dailyGoals');
                const querySnapshot = await getDocs(goalsCollectionRef);
                const goalsData = querySnapshot.docs.map(doc => doc.data());
                setGoals(goalsData);

                // Get today's date
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

                // Filter goals for today
                const filteredGoals = goalsData.filter(goal => goal.day === today);

                // Save active goal to Firestore if it doesn't exist
                if (filteredGoals.length > 0) {
                    const activeGoal = filteredGoals[0];

                    const goalQuery = query(collection(db, 'myGoals'), where('userID', '==', user.uid), where('gid', '==', activeGoal.gid));
                    const querySnapshot = await getDocs(goalQuery);
                    if (querySnapshot.empty) {
                        await addDoc(collection(db, 'myGoals'), {
                            ...activeGoal,
                            userID: user.uid,
                            completed: false
                        });
                        console.log('Document saved successfully.');
                    } else {
                        console.log('Document already exists.');
                    }
                }

                // Count the number of completed documents for the user
                const completedGoalQuery = query(collection(db, 'myGoals'), where('userID', '==', user.uid), where('completed', '==', true));
                const completedSnapshot = await getDocs(completedGoalQuery);
                const numCompleted = completedSnapshot.size;

                // If there are 7 completed documents, delete them
                if (numCompleted === 7) {
                    completedSnapshot.forEach(async doc => {
                        await deleteDoc(doc.ref);
                    });
                    console.log('Deleted 7 completed documents for user:', user.uid);
                }

                // Fetch active goal for today
                const goalQueryToday = query(collection(db, 'myGoals'), where('userID', '==', user.uid), where('day', '==', today));
                const querySnapshotToday = await getDocs(goalQueryToday);
                if (!querySnapshotToday.empty) {
                    const goalsToday = [];
                    querySnapshotToday.forEach(doc => {
                        goalsToday.push(doc.data());
                    });
                    setActiveGoal(goalsToday);
                } else {
                    console.log('No active goal found for today.');
                    setActiveGoal([]);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    useFocusEffect(
        React.useCallback(() => {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            const fetchActiveGoal = async () => {
                try {
                    const goalQuery = query(collection(db, 'myGoals'),
                        where('userID', '==', user.uid),
                        where('day', '==', today));
                    const querySnapshot = await getDocs(goalQuery);
                    if (!querySnapshot.empty) {
                        const goals = [];
                        querySnapshot.forEach((doc) => {
                            goals.push(doc.data());
                        });
                        setActiveGoal(goals);
                    } else {
                        console.log('No active goal found for today.');
                        setActiveGoal([]);
                    }
                } catch (error) {
                    console.error('Error fetching active goal: ', error);
                }
            };

            fetchActiveGoal();
        }, [user])
    );

    return (
        <>
            <View style={styles.container}>

                <View style={styles.header}>
                    <View style={styles.box}>
                        <TouchableOpacity onPress={() => { navigation.navigate('home') }} style={{ top: 1.7, marginLeft: spacing }}>
                            <Ionicons name="arrow-back" size={spacing * 2.7} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.box}>
                        <Text style={styles.title}>Daily Goals</Text>
                    </View>

                    <View style={styles.box}>
                        <View style={{ top: -0.5, marginRight: spacing }}>
                            <Feather name="target" size={21} color={colors.darkRed} />
                        </View>
                    </View>
                </View>

                <View style={styles.body}>
                    <View style={styles.cards}>

                        <View style={styles.card1} />
                        <View style={styles.card2} />

                        <View style={styles.card3}>

                            {loading && <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: spacing }}><Spinner /></View>}

                            {activeGoal.map((currentGoal) => (!loading &&

                                <View key={currentGoal.gid} style={{ width: '100%', height: '100%', alignItems: 'center', }}>

                                    <View style={styles.topSection}>
                                        <View style={styles.topBox1}>
                                            <Text style={{ fontWeight: '700', color: colors.dark, fontSize: 14.2 }}>{currentGoal.difficulty}</Text>
                                        </View>

                                        <View style={styles.topBox2}>
                                            <MaterialCommunityIcons name="star-three-points" size={16.5} color={colors.darkOrange} />
                                            <Text style={{ fontWeight: '700', color: colors.primary, fontSize: 14.5, top: -0.5 }}>+{currentGoal.points}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.midSection}>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={styles.heading}>{currentGoal.title}</Text>
                                            <Text style={styles.description}>{currentGoal.description}</Text>
                                        </View>

                                        <View style={[styles.hr, { marginTop: spacing * 1.8 }]} />

                                        <View style={{ marginLeft: spacing * 2.4, marginTop: spacing * 2.5 }}>
                                            <Text style={styles.sdgHeading}>{currentGoal.SDGnumber}:</Text>
                                            <Text style={styles.sdg}>{currentGoal.SDG}</Text>
                                        </View>

                                        <View style={[styles.hr, { marginTop: spacing * 2.65 }]} />
                                    </View>

                                    <View style={styles.bottomSection}>
                                        <View style={{ alignItems: 'center' }}>
                                            {!currentGoal.completed ? (
                                                <TouchableOpacity style={styles.btn} onPress={() => {
                                                    navigation.navigate('goalConfirm', {
                                                        SDGdescription: currentGoal.SDGdescription,
                                                        points: currentGoal.points,
                                                        goalID: currentGoal.gid,
                                                        userID: user.uid
                                                    });
                                                }}>
                                                    <Text style={styles.btnText}>I've done this!</Text>
                                                </TouchableOpacity>

                                            ) : (

                                                <View style={styles.completed}>
                                                    <Text style={[styles.btnText, { color: '#F2E6D0' }]}>Completed !</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                </View>
                            ))}

                            {activeGoal.length === 0 && !loading &&
                                <View style={{ zIndex: 10, position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', top: -20 }}>
                                    <Image source={require('../assets/target.png')} style={{ width: 90, height: 90, left: 7 }} />
                                    <Text style={{ color: colors.white, fontSize: 16.5, fontWeight: '700', textAlign: 'center', marginTop: spacing * 1.4 }}>No Goals Yet!</Text>
                                </View>
                            }
                        </View>
                    </View>

                    <View style={{ top: 28 }}>
                        <BottomTab navigation={navigation} active='goals' />
                    </View>
                </View>
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
        paddingTop: spacing * 3.4,
        paddingBottom: spacing * 0.3,
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
        height: calculatedBodyHeight,
    },

    cards: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        top: -spacing
    },

    card1: {
        width: '78%',
        height: '75.3%',
        backgroundColor: '#BFAE99',
        borderRadius: spacing * 2,
        elevation: spacing,
        shadowColor: colors.darkGray,
        zIndex: 1,
        position: 'absolute',
        top: 70
    },
    card2: {
        width: '83%',
        height: '72.5%',
        backgroundColor: '#F2E6D0',
        borderRadius: spacing * 2,
        elevation: spacing,
        shadowColor: colors.darkGray,
        alignItems: 'center',
        zIndex: 2,
        position: 'absolute',
        top: 70
    },
    card3: {
        width: '87%',
        height: '70%',
        // backgroundColor: '#1B2936',
        // backgroundColor: '#213440',
        backgroundColor: '#242D40',
        borderRadius: spacing * 2,
        elevation: spacing,
        shadowColor: colors.darkGray,
        alignItems: 'center',
        zIndex: 3,
        position: 'absolute',
        top: 70
    },

    topSection: {
        flexDirection: 'row',
        width: '100%',
        marginTop: spacing * 3,
        zIndex: 5,
        justifyContent: 'space-around'
    },
    topBox1: {
        width: 70,
        height: 33,
        backgroundColor: colors.gold,
        borderRadius: spacing * 0.8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    topBox2: {
        width: 80,
        height: 34,
        backgroundColor: colors.white,
        borderRadius: spacing * 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingLeft: spacing * 0.85,
        paddingRight: spacing
    },

    midSection: {
        width: '95%',
        marginTop: spacing * 4.3
    },
    heading: {
        fontSize: 19,
        fontWeight: '700',
        color: colors.white
    },
    description: {
        marginTop: spacing * 2.5,
        paddingHorizontal: spacing * 1.3,
        paddingRight: spacing * 0.8,
        fontWeight: '400',
        fontSize: 14,
        color: colors.light
    },
    hr: {
        width: '88%',
        borderBottomColor: '#F2E6D0',
        borderBottomWidth: 0.45,
        alignSelf: 'center'
    },
    sdgHeading: {
        fontSize: 14.5,
        fontWeight: '700',
        color: colors.white
    },
    sdg: {
        color: colors.whiteSmoke,
        top: 3.5,
        fontSize: 13.5
    },

    bottomSection: {
        width: '95%',
        marginTop: spacing * 3,
        position: 'absolute',
        bottom: spacing * 3.9
    },
    btn: {
        width: '87%',
        backgroundColor: '#F2E6D0',
        paddingVertical: spacing * 1.1,
        borderRadius: spacing,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnText: {
        color: colors.dark,
        fontWeight: '600',
        fontSize: 15.2
    },
    completed: {
        width: '87%',
        borderWidth: 1,
        borderColor: '#BFAE99',
        borderStyle: 'dashed',
        backgroundColor: '#213440',
        paddingVertical: spacing * 1.2,
        borderRadius: spacing,
        alignItems: 'center',
        justifyContent: 'center'
    }
})