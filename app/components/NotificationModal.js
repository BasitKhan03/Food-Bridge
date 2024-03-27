import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import Modal from "react-native-modal";

import colors from '../config/colors';
import spacing from '../config/spacing';

function NotificationModal(props) {

    const handlePress = () => {
        props.navigation.navigate('Notification', { notificationData: props.notification, userLoggedUid: props.userLoggedUid });
        props.toggleNotification();
    }

    return (
        <Modal style={styles.myNotification} animationType="fade" transparent={true} visible={props.showNotification} onBackdropPress={props.toggleNotification} onRequestClose={props.toggleNotification} onBackButtonPress={props.toggleNotification}>

            <View style={styles.container}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ margin: spacing * 2.5, marginTop: spacing * 2 }}>
                        <Text style={{ fontSize: 15.2, fontWeight: '700', color: colors.darkBlue }}>Notifications</Text>
                    </View>

                    <View style={{ margin: spacing * 2.5, marginTop: spacing * 2 }}>
                        <TouchableOpacity onPress={handlePress}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.twitterBlue, textDecorationLine: 'underline' }}>View all</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.hr} />

                {props.notification.length > 0 ? (
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{ marginHorizontal: spacing * 1.8, marginTop: -spacing * 1.2 }}>
                        {props.notification
                            .slice().sort((a, b) => b.date.toDate() - a.date.toDate())
                            .map((notification) => (
                                <View key={notification.id} style={{ width: '95%' }}>
                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', left: 2 }} onPress={handlePress} >
                                        {notification.category === 'Add' && <Image source={require('../assets/success.png')} style={{ width: 25, height: 25, marginRight: spacing }} />}

                                        {notification.category === 'Expired' && <Image source={require('../assets/failed.png')} style={{ width: 25, height: 25, marginRight: spacing }} />}

                                        {notification.category === 'Update' && <Image source={require('../assets/update.png')} style={{ width: 25, height: 25, marginRight: spacing }} />}

                                        {notification.category === 'Delete' && <Image source={require('../assets/delete.png')} style={{ width: 25, height: 25, marginRight: spacing }} />}

                                        {notification.category === 'Level' && <Image source={require('../assets/level-up.png')} style={{ width: 25, height: 25, marginRight: spacing * 1.1 }} />}

                                        {notification.category === 'Order' && <Image source={require('../assets/order.png')} style={{ width: 25, height: 25, marginRight: spacing * 1.1 }} />}

                                        {notification.category === 'Request' && <Image source={require('../assets/request.png')} style={{ width: 25, height: 25, marginRight: spacing * 1.1 }} />}

                                        <Text style={{ paddingRight: spacing * 3, fontSize: 13, color: colors.darkGray }}>{notification.message}</Text>
                                    </TouchableOpacity>
                                    <View style={styles.hr2} />
                                </View>
                            )
                            )}
                    </ScrollView>
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: spacing * 3.3, left: -4 }}>
                        <Image source={require('../assets/empty-box.png')} style={{ width: 36, height: 36, marginRight: spacing * 0.5 }} />
                        <Text style={{ top: 2.5, fontSize: 14, fontWeight: '500', color: colors.darkGray }}>No new notifications !</Text>
                    </View>
                )}

            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    myNotification: {
        flex: 0,
        top: '7%',
        width: '78%',
        height: '33%',
        alignSelf: 'flex-end',
        marginRight: spacing * 2.3,
        elevation: spacing * 2,
        borderRadius: spacing * 0.5,
        backgroundColor: colors.white
    },

    container: {
        width: '100%',
        height: '100%'
    },

    hr: {
        width: '85%',
        borderBottomWidth: 0.9,
        borderBottomColor: '#E0E0E0',
        marginVertical: spacing * 0.8,
        alignSelf: 'center',
        top: -spacing * 2.4
    },
    hr2: {
        width: '90%',
        borderBottomWidth: 0.8,
        borderBottomColor: '#E0E0E0',
        marginVertical: spacing * 1.3,
        alignSelf: 'center'
    },
})

export default NotificationModal;