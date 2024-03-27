import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SwipeButton from '../components/SwipeButton';
import GoalSuccessAlert from '../components/GoalSuccessAlert';

import { updateDoc, doc, query, where, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/FirebaseConfig';

import colors from '../config/colors';
import spacing from '../config/spacing';


export default function GoalConfirmationScreen({ navigation, route }) {
    const { SDGdescription } = route.params;
    const { points } = route.params;
    const { goalID } = route.params;
    const { userID } = route.params;

    const [toggleState, setToggleState] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const handleToggle = (value) => {
        setToggleState(value);
        setShowAlert(true);
    };

    const toggleAlert = () => {
        setShowAlert(!showAlert);
    };

    useEffect(() => {
        let timer;

        if (showAlert) {
            timer = setTimeout(() => {
                setShowAlert(false);
                navigation.goBack();
            }, 10000);
        }

        return () => clearTimeout(timer);
    }, [showAlert]);

    useEffect(() => {
        const updateCompleted = async (goalId) => {
            try {
                const myGoalsCollectionRef = collection(db, 'myGoals');
                const q = query(myGoalsCollectionRef, where('gid', '==', goalId), where('userID', '==', userID));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const goalDoc = querySnapshot.docs[0];
                    const goalDocRef = doc(db, 'myGoals', goalDoc.id);

                    await updateDoc(goalDocRef, { completed: true });

                    console.log('Updated successfully.');

                    const userScoresCollectionRef = collection(db, 'userScores');
                    const userScoresQuerySnapshot = await getDocs(
                        query(userScoresCollectionRef, where('uid', '==', userID))
                    );

                    if (!userScoresQuerySnapshot.empty) {
                        const userScoreDoc = userScoresQuerySnapshot.docs[0];
                        const userScoreDocRef = doc(db, 'userScores', userScoreDoc.id);

                        const userScoreData = userScoreDoc.data();
                        const currentScore = userScoreData.score || 0;

                        await updateDoc(userScoreDocRef, { score: currentScore + points });

                        console.log('Score updated successfully.');
                    } else {
                        console.log('User score not found for userID:', userID);
                    }
                }
                else {
                    console.log('Goal not found with goalID:', goalId);
                }
            } catch (error) {
                console.log('Error updating: ', error);
            }
        };

        if (toggleState && goalID) {
            updateCompleted(goalID);
        }

    }, [goalID, toggleState, userID]);

    return (
        <>
            <View style={styles.container}>

                <View style={styles.header}>
                    <View style={styles.box}>
                        <TouchableOpacity onPress={() => { navigation.goBack() }} style={{ top: 1.7, marginLeft: spacing }}>
                            <Ionicons name="arrow-back" size={spacing * 2.75} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.body}>

                    <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: spacing * 0.3 }}>
                        <Image source={require('../assets/earth1.png')} style={{ width: 330, height: 330 }} />
                    </View>

                    {showAlert && <GoalSuccessAlert msg1="You've successfully completed the goal" msg2="Congratulations!" showAlert={showAlert} toggleAlert={toggleAlert} navigation={navigation} points={points} />}

                    <View style={{ width: '85%', alignItems: 'center', alignSelf: 'center', top: -2 }}>
                        <Text style={{ color: colors.white, fontStyle: 'italic', fontSize: 14.5 }}>"{SDGdescription}"</Text>
                    </View>

                    <View style={{ alignItems: 'center', marginTop: spacing * 5 }}>
                        <GestureHandlerRootView>
                            <SwipeButton onToggle={handleToggle} />
                        </GestureHandlerRootView>
                    </View>

                    <View style={{ alignItems: 'center', marginTop: spacing * 2 }}>
                        <Text style={{ color: colors.white, fontWeight: '500' }}>Swipe right to complete the goal</Text>
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
        backgroundColor: colors.twitterBlue
    },

    header: {
        backgroundColor: colors.twitterBlue,
        flexDirection: "row",
        justifyContent: "space-between",
        width: '100%',
        height: 70,
        padding: spacing * 2,
        paddingTop: spacing * 1.8,
        paddingBottom: spacing * 1.1,
        zIndex: 1005
    },
    box: {
        flexDirection: "row",
        alignItems: "center"
    },

    // swipeCont: {
    //     height: BUTTON_HEIGHT,
    //     width: BUTTON_WIDTH,
    //     padding: BUTTON_PADDING,
    //     backgroundColor: colors.white,
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     borderRadius: BUTTON_HEIGHT
    // },
    // swipeable: {
    //     height: SWIPEABLE_DIMESIONS,
    //     width: SWIPEABLE_DIMESIONS,
    //     borderRadius: SWIPEABLE_DIMESIONS,
    //     backgroundColor: colors.whiteSmoke,
    //     position: 'absolute',
    //     left: BUTTON_PADDING,
    //     zIndex: 3
    // },
    // swipeText: {
    //     alignSelf: 'center',
    //     fontSize: 14.2,
    //     fontWeight: '500',
    //     color: colors.secondary,
    //     zIndex: 2
    // },
    // colorWave: {
    //     position: 'absolute',
    //     left: 0,
    //     height: BUTTON_HEIGHT,
    //     borderRadius: BUTTON_HEIGHT,
    //     backgroundColor: colors.orange
    // }
})