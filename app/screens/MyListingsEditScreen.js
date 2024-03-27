import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, ImageBackground, TouchableOpacity, ScrollView, TextInput, Keyboard, Platform, StatusBar } from 'react-native';
import { Ionicons, AntDesign, MaterialCommunityIcons, Entypo, FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Modal from "react-native-modal";
import * as ImagePicker from 'expo-image-picker';

import CameraModal from '../components/CameraModal';
import Spinner from '../components/Spinner';
import CustomAlert2 from '../components/CustomAlert2';
import CustomAlert3 from '../components/CustomAlert3';

import { doc, updateDoc, addDoc, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../firebase/FirebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import colors from '../config/colors';
import spacing from '../config/spacing';

export default function MyListingsEditScreen({ route, navigation }) {
    const { item } = route.params;
    const { user } = route.params;

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [imageModal, setImageModal] = useState(false);
    const [cameraModal, setCameraModal] = useState(false);

    const [quantity1, setQuantity1] = useState(item.quantity === 1 ? true : false);
    const [quantity2, setQuantity2] = useState(item.quantity === 2 ? true : false);
    const [quantity3, setQuantity3] = useState(item.quantity === 3 ? true : false);
    const [quantity4, setQuantity4] = useState(item.quantity === 4 ? true : false);
    const [quantity5, setQuantity5] = useState(item.quantity === 5 ? true : false);

    const [image, setImage] = useState(null);
    const [cameraImage, setCameraImage] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(item.quantity);
    const [pickup, setPickup] = useState('');
    const [location, setLocation] = useState('');
    const [city, setCity] = useState('');
    const [listingPeriod, setListingPeriod] = useState('');

    const [showAlert, setShowAlert] = useState(false);
    const [showAlert1, setShowAlert1] = useState(false);
    const [showAlert2, setShowAlert2] = useState(false);
    const [showAlert3, setShowAlert3] = useState(false);
    const [loading, setLoading] = useState(false);

    const refDescription = useRef();
    const refQuantity = useRef();
    const refPickup = useRef();
    const refLocation = useRef();
    const refCity = useRef();

    const cities = [
        { label: 'City', value: '' },
        { label: 'Karachi', value: 'Karachi' },
        { label: 'Islamabad', value: 'Islamabad' },
        { label: 'Lahore', value: 'Lahore' }
    ];

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    useEffect(() => {
        const clean = () => {
            setImage(null);
            setTitle('');
            setDescription('');
            setQuantity(item.quantity);
            setPickup('');
            setLocation('');
            setCity('');
            setListingPeriod(''); 3
        };

        clean();
    }, [])

    const requestPermission = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
            }
        }
    };

    useEffect(() => {
        requestPermission();
    }, []);

    const pickImage = async () => {
        try {
            toggleImageModal();

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 4],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        }
        catch (error) {
            setImage(null);
        }
    }

    const toggleCameraModal = () => {
        setCameraModal(!cameraModal);
    };

    const toggleImageModal = () => {
        setImageModal(!imageModal);
    };

    const toggleAlert = () => {
        setShowAlert(!showAlert);
    };

    const toggleAlert1 = () => {
        setShowAlert1(!showAlert1);
    };

    const handleSave = () => {
        Keyboard.dismiss();
        toggleAlert();
    };

    const updateChanges = async () => {
        try {
            setLoading(true);
            const updatedData = {};
            const updatedData1 = {};
            let updatedFields = [];

            if (image !== null) {
                const response = await fetch(image);
                const blob = await response.blob();
                const fileName = image.split('/').pop();
                const storageRef = ref(storage, `userImages/${fileName}`);
                await uploadBytes(storageRef, blob);
                const downloadURL = await getDownloadURL(storageRef);
                updatedData.imageURL = downloadURL;
            }

            if (title !== '') {
                updatedData.title = title.trim();
                updatedData1.title = title.trim();
                updatedFields.push('title');
            }

            if (description !== '') {
                updatedData.description = description.trim();
                updatedFields.push('description');
            }

            if (quantity !== '' && quantity !== null && quantity !== undefined && quantity !== item.quantity) {
                updatedData.quantity = quantity;
                updatedData1.quantity = quantity;
                updatedFields.push('quantity');
            }

            if (pickup !== '') {
                updatedData.pickup = pickup.trim();
                updatedFields.push('pickup');
            }

            if (location !== '' || city !== '') {
                if (location !== '') {
                    updatedData.location = location.trim();
                }
                if (city !== '') {
                    updatedData.city = city;
                }
                updatedFields.push('location');
            }

            if (listingPeriod !== '') {
                const databaseListingPeriod = parseInt(item.listingPeriod);
                const userListingPeriod = parseInt(listingPeriod);

                updatedData.listingPeriod = (databaseListingPeriod + userListingPeriod).toString();
                updatedData1.listingPeriod = (databaseListingPeriod + userListingPeriod).toString();

                updatedFields.push('listingPeriod');
            }

            const documentRef = doc(db, 'foodData', item.id);
            await updateDoc(documentRef, updatedData);

            const querySnapshot = await getDocs(query(collection(db, 'myFoodItem'), where('foodId', '==', item.foodId)));

            if (!querySnapshot.empty) {
                const documentRef1 = doc(db, 'myFoodItem', querySnapshot.docs[0].id);
                await updateDoc(documentRef1, updatedData1);

                console.log('Documents updated');
            } else {
                console.log('No matching document found');
            }


            const fieldMessages = {
                title: "- Title has been updated",
                description: "- Description has been updated",
                quantity: "- Quantity has been updated",
                pickup: "- Pickup has been updated",
                location: "- Location has been updated",
                listingPeriod: "- Listing period has been updated"
            };

            const notificationMessages = updatedFields
                .map(field => fieldMessages[field]);

            const notificationData = {
                userId: user.uid,
                name: item.title,
                message: `Your item '${item.title}' 's details have been updated`,
                fields: notificationMessages,
                category: 'Update',
                isRead: false,
                date: new Date()
            };

            const docRef = await addDoc(collection(db, 'notification'), notificationData);

            setLoading(false);
            setShowAlert1(true);
        }
        catch (error) {
            console.log(error);
        }
    };

    const toggleAlert2 = () => {
        setShowAlert2(!showAlert2);
    };

    const toggleAlert3 = () => {
        setShowAlert3(!showAlert3);
    };

    const handleDelete = () => {
        Keyboard.dismiss();
        toggleAlert2();
    };

    const deleteItem = async () => {
        try {
            setLoading(true);

            const documentRef = doc(db, 'foodData', item.id);
            await deleteDoc(documentRef);

            const querySnapshot = await getDocs(query(collection(db, 'myFoodItem'), where('foodId', '==', item.foodId)));

            if (!querySnapshot.empty) {
                const documentRef1 = doc(db, 'myFoodItem', querySnapshot.docs[0].id);
                await deleteDoc(documentRef1);

                console.log('Documents deleted successfully');
            }
            else {
                console.log('No matching document found');
            }

            const notificationData = {
                userId: user.uid,
                name: item.title,
                message: `Your item '${item.title}' has been deleted`,
                category: 'Delete',
                isRead: false,
                date: new Date()
            };

            const docRef = await addDoc(collection(db, 'notification'), notificationData);

            setLoading(false);
            setShowAlert3(true);
        }
        catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    return (
        <>
            <View style={styles.container}>

                <View style={styles.header}>
                    <View style={styles.box}>
                        <TouchableOpacity onPress={() => { !loading && navigation.goBack() }} style={{ top: 1.7, marginLeft: spacing }}>
                            <Ionicons name="arrow-back" size={spacing * 2.7} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.box}>
                        <Text style={styles.title}>Edit Item</Text>
                    </View>

                    <View style={styles.box}>
                        <TouchableOpacity style={{ top: -0.5, marginRight: spacing }} onPress={handleDelete}>
                            <AntDesign name="delete" size={20} color={colors.darkRed} />
                        </TouchableOpacity>
                    </View>
                </View>

                {loading && <View style={{ width: '100%', height: '100%', position: 'absolute', top: -40, zIndex: 2 }}>
                    <Spinner />
                </View>}

                <View style={styles.body}>

                    <Modal style={styles.cameraModal} animationType="fade" transparent={true} visible={cameraModal} onBackdropPress={toggleCameraModal} onRequestClose={toggleCameraModal} onBackButtonPress={toggleCameraModal}>
                        <View style={styles.cameraModalContainer}>
                            <CameraModal toggleCameraModal={toggleCameraModal} navigation={navigation} setImage={setImage} setCameraImage={setCameraImage} />
                        </View>
                    </Modal>

                    <Modal style={{ flex: 1, margin: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                        animationType="fade"
                        animationDuration={100}
                        transparent={true}
                        visible={imageModal}
                        onBackdropPress={toggleImageModal}
                        onRequestClose={toggleImageModal}
                        onBackButtonPress={toggleImageModal}>

                        <View style={styles.imageModal}>
                            <Text style={styles.imageModalText}>Choose an action</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                <TouchableOpacity style={{ flexDirection: 'column', alignItems: 'center', top: -10 }} onPress={() => {
                                    toggleImageModal();
                                    toggleCameraModal();
                                }}>
                                    <Image style={{ height: spacing * 10.5, width: spacing * 10.5, marginBottom: -25 }} source={require('../assets/camera.png')} />
                                    <Text style={styles.imageBtnText}>Camera</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={{ flexDirection: 'column', alignItems: 'center', top: -6 }} onPress={pickImage}>
                                    <Image style={{ height: spacing * 8.5, width: spacing * 8.5, marginBottom: -13 }} source={require('../assets/gallery.png')} />
                                    <Text style={styles.imageBtnText}>Gallery</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </Modal>

                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>

                        <View style={{ marginTop: spacing * 3, marginBottom: spacing * 11 }}>

                            {showAlert && <CustomAlert2 msg1='Do you want to save changes?' msg2='Select!' showAlert={showAlert} update={updateChanges} toggleAlert={toggleAlert} opt='1' />}

                            {showAlert1 && <CustomAlert3 msg1='Changes successfully saved!' msg2='Continue!' showAlert={showAlert1} toggleAlert={toggleAlert1} navigation={navigation} opt='2' />}

                            {showAlert2 && <CustomAlert2 msg1='Do you want to delete this item?' msg2='Select!' showAlert={showAlert2} update={deleteItem} toggleAlert={toggleAlert2} opt='1' mode='delete' />}

                            {showAlert3 && <CustomAlert3 msg1='Item successfully deleted!' msg2='Continue!' showAlert={showAlert3} toggleAlert={toggleAlert3} navigation={navigation} opt='2' />}

                            <View>
                                <View style={styles.inputImgContainer}>
                                    <TouchableOpacity style={{ width: '100%', height: '100%', borderRadius: spacing * 0.5 }} activeOpacity={0.5} onPress={toggleImageModal}>
                                        <ImageBackground style={{ flex: 1, width: '100%', height: '100%', borderRadius: spacing * 0.5 }} resizeMode='cover' source={{ uri: image === null ? item.imageURL : image }} >

                                            <View style={{ width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: spacing * 0.5 }}>
                                                <MaterialCommunityIcons name="image-plus" style={{ marginLeft: - spacing * 0.5 }} size={30} color={colors.white} />
                                                <Text style={styles.inputImgText}>Change Image?</Text>
                                            </View>

                                        </ImageBackground>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{ marginTop: spacing * 1.4 }}>
                                <Text style={styles.inputText}>Title</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder={item.title} placeholderTextColor={colors.gray}
                                        onChangeText={(newTitle) => { setTitle(newTitle); }}
                                        onSubmitEditing={() => { refDescription.current.focus(); }}
                                        blurOnSubmit={false}
                                        value={title}
                                    />
                                </View>
                            </View>


                            <View style={{ marginTop: spacing }}>
                                <Text style={styles.inputText}>Description</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder={item.description} placeholderTextColor={colors.gray}
                                        onChangeText={(newDes) => { setDescription(newDes); }}
                                        ref={refDescription}
                                        onSubmitEditing={() => { refQuantity.current.focus(); }}
                                        blurOnSubmit={false}
                                        value={description}
                                    />
                                </View>
                            </View>


                            <View style={{ marginTop: spacing, marginBottom: spacing * 0.2 }}>
                                <Text style={styles.inputText}>Quantity</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: spacing * 1.3, marginHorizontal: spacing, marginBottom: spacing * 0.5 }}>
                                    <TouchableOpacity style={[styles.quantityBtn, quantity1 && styles.selected]} onPress={() => {
                                        setQuantity(1);
                                        setQuantity1(true);
                                        setQuantity2(false);
                                        setQuantity3(false);
                                        setQuantity4(false);
                                        setQuantity5(false);
                                    }}>
                                        <Text>1</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.quantityBtn, quantity2 && styles.selected]} onPress={() => {
                                        setQuantity(2);
                                        setQuantity1(false);
                                        setQuantity2(true);
                                        setQuantity3(false);
                                        setQuantity4(false);
                                        setQuantity5(false);
                                    }}>
                                        <Text>2</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.quantityBtn, quantity3 && styles.selected]} onPress={() => {
                                        setQuantity(3);
                                        setQuantity1(false);
                                        setQuantity2(false);
                                        setQuantity3(true);
                                        setQuantity4(false);
                                        setQuantity5(false);
                                    }}>
                                        <Text>3</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.quantityBtn, quantity4 && styles.selected]} onPress={() => {
                                        setQuantity(4);
                                        setQuantity1(false);
                                        setQuantity2(false);
                                        setQuantity3(false);
                                        setQuantity4(true);
                                        setQuantity5(false);
                                    }}>
                                        <Text>4</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.quantityBtn, quantity5 && styles.selected]} onPress={() => {
                                        setQuantity(5);
                                        setQuantity1(false);
                                        setQuantity2(false);
                                        setQuantity3(false);
                                        setQuantity4(false);
                                        setQuantity5(true);
                                    }}>
                                        <Text>5</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder={item.quantity > 5 ? item.quantity : 'other'} keyboardType='numeric'
                                        onChangeText={(newQuantity) => {
                                            setQuantity(newQuantity);
                                            setQuantity1(false);
                                            setQuantity2(false);
                                            setQuantity3(false);
                                            setQuantity4(false);
                                            setQuantity5(false);
                                        }}
                                        ref={refQuantity}
                                        onSubmitEditing={() => { refPickup.current.focus(); }}
                                        blurOnSubmit={false}
                                    />
                                </View>
                            </View>


                            <View style={{ marginTop: spacing, marginBottom: spacing * 0.2 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Entypo name="time-slot" size={17} style={{ marginLeft: spacing * 3.11 }} color={colors.blue} />
                                    <Text style={[styles.inputText, styles.iconText]}>Pick-up times</Text>
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder={item.pickup} placeholderTextColor={colors.gray}
                                        onChangeText={(newPickup) => { setPickup(newPickup); }}
                                        ref={refPickup}
                                        onSubmitEditing={() => { refLocation.current.focus(); }}
                                        blurOnSubmit={false}
                                        value={pickup}
                                    />
                                </View>
                            </View>


                            <View style={{ marginTop: spacing, marginBottom: spacing * 0.2 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <FontAwesome5 name="map-marker-alt" size={18} style={{ marginLeft: spacing * 3.11 }} color={colors.red} />
                                    <Text style={[styles.inputText, styles.iconText]}>Your location (approx)</Text>
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder={item.location} placeholderTextColor={colors.gray}
                                        onChangeText={(newLocation) => { setLocation(newLocation); }}
                                        ref={refLocation}
                                        onSubmitEditing={() => { refCity.current.focus(); }}
                                        blurOnSubmit={true}
                                        value={location}
                                    />
                                </View>
                                <View style={[styles.picker, { height: spacing * 3.9 }]}>
                                    <Picker
                                        ref={refCity}
                                        selectedValue={city === '' ? item.city : city}
                                        onValueChange={(itemValue, itemIndex) => { setCity(itemValue); }}
                                        style={{ width: '100%', color: colors.gray }}
                                    >
                                        {cities.map((cityItem) => (
                                            <Picker.Item
                                                key={cityItem.value}
                                                label={cityItem.label}
                                                value={cityItem.value}
                                                selected={city === cityItem.value}
                                                style={{ fontSize: 14, color: city === cityItem.value ? colors.dark : colors.gray }}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>


                            <View style={{ marginTop: spacing * 1.1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Entypo name="calendar" size={17} style={{ marginLeft: spacing * 3.11 }} color={colors.gray} />
                                    <Text style={[styles.inputText, styles.iconText]}>Extend time for</Text>
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.input} placeholder='Enter no. of days' keyboardType='numeric'
                                        onChangeText={(newList) => { setListingPeriod(newList.trim()); }}
                                        blurOnSubmit={true}
                                        value={listingPeriod}
                                    />
                                </View>
                            </View>


                            <View style={{ marginTop: spacing * 1.2, marginBottom: isKeyboardVisible ? spacing * 0.5 : spacing * 3 }}>
                                <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={image === null && title === '' && description === '' && (quantity === item.quantity || quantity === '' || quantity === 0) && pickup === '' && location === '' && city === '' && listingPeriod === ''}>
                                    <Text style={styles.btnText}>Save</Text>
                                </TouchableOpacity>
                            </View>

                        </View>

                    </ScrollView>

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
        height: 95,
        padding: spacing * 2,
        paddingTop: StatusBar.currentHeight * 1.2,
        paddingBottom: spacing * 1.1,
        elevation: spacing,
        shadowColor: colors.darkGray,
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

    inputImgContainer: {
        flexDirection: 'row',
        width: '84%',
        height: spacing * 6,
        marginVertical: spacing * 0.8,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: spacing * 0.5,
        borderColor: colors.gray,
        borderWidth: 0.3,
    },
    inputImgText: {
        color: colors.white,
        fontSize: 13.5,
        fontWeight: "700",
        marginLeft: spacing * 1.3,
        alignSelf: 'center'
    },

    inputContainer: {
        flexDirection: 'row',
        width: '84%',
        marginVertical: spacing * 0.8,
        borderColor: colors.gray,
        borderWidth: 0.3,
        borderRadius: spacing * 0.4,
        paddingHorizontal: spacing,
        paddingVertical: spacing * 0.5,
        alignSelf: 'center'
    },
    input: {
        color: colors.darkLight,
        fontSize: 14,
        width: '100%',
        paddingLeft: spacing * 0.5,
        paddingRight: spacing * 0.7
    },
    inputText: {
        color: colors.dark,
        fontSize: 14.2,
        fontWeight: "500",
        marginLeft: spacing * 3.1,
        width: '100%'
    },
    iconText: {
        marginLeft: spacing * 0.9
    },

    quantityBtn: {
        width: spacing * 4.5,
        height: spacing * 3.5,
        backgroundColor: colors.light,
        borderRadius: spacing * 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selected: {
        borderColor: colors.darkLight,
        borderWidth: 0.7
    },

    picker: {
        width: '84%',
        height: spacing * 4.2,
        marginVertical: spacing * 0.8,
        marginTop: spacing * 0.7,
        borderColor: colors.gray,
        borderWidth: 0.3,
        borderRadius: spacing * 0.4,
        alignSelf: 'center',
        justifyContent: 'center'
    },

    btn: {
        width: '83%',
        height: 46,
        backgroundColor: colors.primary,
        borderRadius: spacing * 5,
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        color: colors.white,
        marginTop: spacing * 1.2
    },
    btnText: {
        color: colors.white,
        fontSize: 15.5,
        fontWeight: "700"
    },

    imageModal: {
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

    cameraModal: {
        flex: 0,
        margin: 0,
        width: '100%',
        height: '100%',
    },

    cameraModalContainer: {
        width: '100%',
        height: '100%',
    }
})