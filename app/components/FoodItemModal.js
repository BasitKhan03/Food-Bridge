import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity, ScrollView, Keyboard, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome5, Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Modal from "react-native-modal";
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { WaveIndicator } from 'react-native-indicators';

import CameraModal from './CameraModal';

import { db, storage } from '../firebase/FirebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import colors from '../config/colors';
import spacing from '../config/spacing';

function FoodItemModal(props) {
    const scrollViewRef = useRef(null);

    const [image, setImage] = useState(null);
    const [cameraImage, setCameraImage] = useState(null);
    const [imageURL, setImageURL] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [pickup, setPickup] = useState('');
    const [location, setLocation] = useState('');
    const [city, setCity] = useState('');
    const [listingPeriod, setListingPeriod] = useState('');

    const [quantity1, setQuantity1] = useState(true);
    const [quantity2, setQuantity2] = useState(false);
    const [quantity3, setQuantity3] = useState(false);
    const [quantity4, setQuantity4] = useState(false);
    const [quantity5, setQuantity5] = useState(false);

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [imageModal, setImageModal] = useState(false);
    const [cameraModal, setCameraModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState({
        image: false,
        title: false,
        des: false,
        tag: false,
        quantity: false,
        category: false,
        pickup: false,
        location: false,
        city: false,
        listing: false
    })

    // ----|| useRef references of TextInputs in food item modal ||---->
    const refDescription = useRef();
    const refTag = useRef();
    const refCategory = useRef();
    const refLocation = useRef();
    const refCity = useRef();

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

    // ----|| Function for handling gallery permission from user ||---->
    const requestPermission = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
            }
        }
    };

    // ----|| useEffect function that calls requestPermission() function when this component is mounted ||---->
    useEffect(() => {
        requestPermission();
    }, []);

    // ----|| Function for selecting image from gallery using ImagePicker ||---->
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
                setError(prevState => ({ ...prevState, image: false }));
            }
        }
        catch (error) {
            setImage(null);
            setError(prevState => ({ ...prevState, image: true }));
        }
    }

    // ----|| Function for saving captured image to gallery ||---->
    const saveImage = async () => {
        if (cameraImage) {
            try {
                await MediaLibrary.createAssetAsync(cameraImage);
            }
            catch (err) {
                console.log(err);
            }
        }
    };

    // ----|| Function for uploading item data to Firebase ||---->
    const handleItemUpload = async () => {
        try {
            setLoading(true);
            const response = await fetch(image);
            const blob = await response.blob();
            const fileName = image.split('/').pop();
            const storageRef = ref(storage, `foodImages/${fileName}`);
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            setImageURL(downloadURL);

            const foodId = new Date().getTime() + Math.floor(Math.random() * 1000);

            const foodData = {
                userId: props.userLoggedUid,
                foodId,
                imageURL: downloadURL,
                title,
                description,
                selectedTag,
                selectedCategory,
                quantity: quantity,
                pickup,
                location,
                city,
                listingPeriod,
                listingDate: new Date(),
                status: 'available'
            }

            const docRef = await addDoc(collection(db, 'foodData'), foodData);

            const myFoodData = {
                userId: props.userLoggedUid,
                foodId,
                title,
                quantity: quantity === 1 ? 1 : quantity,
                listingPeriod,
                listingDate: new Date(),
                notificationSent: false,
                status: 'available'
            }

            const docRef1 = await addDoc(collection(db, 'myFoodItem'), myFoodData);
            setLoading(false);
            handleModalClose();
            props.toggleAlert();
        }

        catch (error) {
            console.log(error.message);
        }
    };

    // ----|| Function for uploading notification to Firebase ||---->
    const handleNotificationUpload = async () => {
        try {
            const notificationData = {
                userId: props.userLoggedUid,
                name: title,
                quantity: quantity,
                message: `Your item '${title}' has been successfully listed for ${listingPeriod} days`,
                category: 'Add',
                isRead: false,
                date: new Date()
            }

            const docRef = await addDoc(collection(db, 'notification'), notificationData);
        }
        catch (err) {
            console.log(err);
        }
    };

    // ----|| Function for handling submit button ||---->
    const handleSubmit = () => {
        Keyboard.dismiss();

        if (image !== null && title !== '' && description !== '' && selectedTag !== '' && selectedCategory !== '' && quantity !== '' && pickup !== '' && location !== '' && city !== '' && listingPeriod !== '') {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
            handleItemUpload();
            handleNotificationUpload();
            saveImage();
        }

        else {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });

            if (image === null || image === undefined || image === '') {
                setError(prevState => ({ ...prevState, image: true }));
            } else {
                setError(prevState => ({ ...prevState, image: false }));
            }

            if (title === '') {
                setError(prevState => ({ ...prevState, title: true }));
            } else {
                setError(prevState => ({ ...prevState, title: false }));
            }

            if (description === '') {
                setError(prevState => ({ ...prevState, des: true }));
            } else {
                setError(prevState => ({ ...prevState, des: false }));
            }

            if (selectedTag === '') {
                setError(prevState => ({ ...prevState, tag: true }));
            } else {
                setError(prevState => ({ ...prevState, tag: false }));
            }

            if (quantity === '' && !quantity1 && !quantity2 && !quantity3 && !quantity4 && !quantity5) {
                setError(prevState => ({ ...prevState, quantity: true }));
            } else {
                setError(prevState => ({ ...prevState, quantity: false }));
            }

            if (selectedCategory === '') {
                setError(prevState => ({ ...prevState, category: true }));
            } else {
                setError(prevState => ({ ...prevState, category: false }));
            }

            if (pickup === '') {
                setError(prevState => ({ ...prevState, pickup: true }));
            } else {
                setError(prevState => ({ ...prevState, pickup: false }));
            }

            if (location === '') {
                setError(prevState => ({ ...prevState, location: true }));
            } else {
                setError(prevState => ({ ...prevState, location: false }));
            }

            if (city === '') {
                setError(prevState => ({ ...prevState, city: true }));
            } else {
                setError(prevState => ({ ...prevState, city: false }));
            }

            if (listingPeriod === '') {
                setError(prevState => ({ ...prevState, listing: true }));
            } else {
                setError(prevState => ({ ...prevState, listing: false }));
            }
        }
    }

    // ----|| Function for closing food item modal ||---->
    const handleModalClose = () => {
        setImage(null);
        setImageURL('');
        setTitle('');
        setDescription('');
        setSelectedTag('');
        setQuantity('');
        setSelectedCategory('');
        setPickup('');
        setLocation('');
        setCity('');
        setListingPeriod('');

        setQuantity1(true);
        setQuantity2(false);
        setQuantity3(false);
        setQuantity4(false);
        setQuantity5(false);

        const newErrorState = {
            image: false,
            title: false,
            des: false,
            tag: false,
            category: false,
            quantity: false,
            pickup: false,
            location: false,
            city: false,
            listing: false
        };

        setError(newErrorState);
        props.toggleModal(false);
    };

    // ----|| Function for toggling add image options modal ||---->
    const toggleImageModal = () => {
        setImageModal(!imageModal);
    };

    // ----|| Function for toggling camera modal ||---->
    const toggleCameraModal = () => {
        setCameraModal(!cameraModal);
    };

    return (
        <View>
            <Modal style={styles.modal} isVisible={props.modalVisibility} onBackdropPress={!loading ? handleModalClose : undefined} onBackButtonPress={!loading ? handleModalClose : undefined} animationOut="slideOutDown" backdropTransitionOutTiming={10} statusBarTranslucent={true} propagateSwipe={true} transparent={true} onRequestClose={!loading ? handleModalClose : undefined} onDismiss={!loading ? handleModalClose : undefined}>

                {loading && <View style={{ height: 50, width: 50, position: 'absolute', top: '40%', zIndex: 1000, alignSelf: 'center' }}>
                    <WaveIndicator color={colors.darkOrange} size={52} />
                </View>}

                {/* ------------------------------------------| CAMERA MODAL |----------------------------------------- */}

                <Modal style={styles.cameraModal} animationType="fade" transparent={true} visible={cameraModal} onBackdropPress={toggleCameraModal} onRequestClose={toggleCameraModal} onBackButtonPress={toggleCameraModal}>
                    <View style={styles.cameraModalContainer}>
                        <CameraModal toggleCameraModal={toggleCameraModal} navigation={props.navigation} setImage={setImage} setCameraImage={setCameraImage} />
                    </View>
                </Modal>

                {/* X-------------------------------------------------------------------------------------------------X */}

                {/* ----------------------------------------| ADD IMAGE MODAL |---------------------------------------- */}

                <Modal style={styles.imageModal} animationType="slide" transparent={true} visible={imageModal} onBackdropPress={toggleImageModal} onRequestClose={toggleImageModal} onBackButtonPress={toggleImageModal}>
                    <View>
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

                {/* X-------------------------------------------------------------------------------------------------X */}

                <View style={styles.line} />
                <Text style={styles.heading}>Donate a food item</Text>
                <View style={styles.hr} />

                <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
                    <View style={styles.container}>

                        {/* ----------------------------------------| FOOD ITEM IMAGE |---------------------------------------- */}

                        <View>
                            <View style={styles.inputImgContainer}>
                                <TouchableOpacity style={{ flexDirection: 'row', width: '100%', justifyContent: 'center' }} onPress={toggleImageModal} disabled={loading}>
                                    <MaterialCommunityIcons name="image-plus" style={{ marginLeft: - spacing * 0.5 }} size={32} color={colors.darkOrange} />
                                    <Text style={styles.inputImgText}>{image ? 'Change Image?' : 'Add an image'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {error.image && <MaterialIcons style={{ marginLeft: spacing * 3.2, top: -2 }} name="error-outline" size={13} color={colors.red} />}
                                {error.image && <Text style={{ marginLeft: spacing * 0.4, top: -2, color: colors.red, fontSize: 12 }}>Please add an image</Text>}
                            </View>
                        </View>

                        {/* X-------------------------------------------------------------------------------------------------X */}

                        {/* ----------------------------------------| FOOD ITEM TITLE |---------------------------------------- */}

                        <View style={{ marginTop: spacing }}>
                            <Text style={styles.inputText}>Title</Text>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.input} placeholder='e.g. Rice with curry...' onChangeText={(newTitle) => {
                                    setTitle(newTitle.trim());
                                    setError(prevState => ({ ...prevState, title: false }));
                                }} onSubmitEditing={() => { refDescription.current.focus(); Keyboard.dismiss; }} blurOnSubmit={false} editable={!loading} />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {error.title && <MaterialIcons style={{ marginLeft: spacing * 3.2, top: -4 }} name="error-outline" size={13} color={colors.red} />}
                                {error.title && <Text style={{ marginLeft: spacing * 0.4, top: -4, color: colors.red, fontSize: 12 }}>Please enter the title</Text>}
                            </View>
                        </View>

                        {/* X-------------------------------------------------------------------------------------------------X */}

                        {/* -------------------------------------| FOOD ITEM DESCRIPTION |------------------------------------- */}

                        <View style={{ marginTop: spacing }}>
                            <Text style={styles.inputText}>Description</Text>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.input} placeholder='e.g. 2 x boxes of rice...' onChangeText={(newDes) => {
                                    setDescription(newDes.trim());
                                    setError(prevState => ({ ...prevState, des: false }));
                                }} ref={refDescription} onSubmitEditing={() => { refTag.current.focus(); Keyboard.dismiss; }} editable={!loading} />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {error.des && <MaterialIcons style={{ marginLeft: spacing * 3.2, top: -4 }} name="error-outline" size={13} color={colors.red} />}
                                {error.des && <Text style={{ marginLeft: spacing * 0.4, top: -4, color: colors.red, fontSize: 12 }}>Please enter the description</Text>}
                            </View>
                        </View>

                        {/* X-------------------------------------------------------------------------------------------------X */}

                        {/* -----------------------------------------| FOOD ITEM TAG |----------------------------------------- */}

                        <View style={{ marginTop: spacing }}>
                            <Text style={styles.inputText}>Tag</Text>

                            <View style={styles.picker}>
                                <Picker
                                    selectedValue={selectedTag}
                                    ref={refTag}
                                    onValueChange={(itemValue, itemIndex) => {
                                        setSelectedTag(itemValue);
                                        setError(prevState => ({ ...prevState, tag: false }));
                                    }} style={{ width: '100%', color: colors.gray }} enabled={!loading}>
                                    <Picker.Item style={{ fontSize: 14.2, color: colors.gray }} label="Select a tag" value="" />
                                    <Picker.Item style={{ fontSize: 14.2 }} label="General" value="General" />
                                    <Picker.Item style={{ fontSize: 14.2 }} label="Veggies" value="Veggies" />
                                    <Picker.Item style={{ fontSize: 14.2 }} label="Chicken" value="Chicken" />
                                    <Picker.Item style={{ fontSize: 14.2 }} label="Meat" value="Meat" />
                                    <Picker.Item style={{ fontSize: 14.2 }} label="Sea Food" value="Sea Food" />
                                    <Picker.Item style={{ fontSize: 14.2 }} label="Bakery" value="Bakery" />
                                    <Picker.Item style={{ fontSize: 14.2 }} label="Fruits" value="Fruits" />
                                </Picker>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {error.tag && <MaterialIcons style={{ marginLeft: spacing * 3.2, top: -4 }} name="error-outline" size={13} color={colors.red} />}
                                {error.tag && <Text style={{ marginLeft: spacing * 0.4, top: -4, color: colors.red, fontSize: 12 }}>Please select a tag</Text>}
                            </View>
                        </View>

                        {/* X-------------------------------------------------------------------------------------------------X */}

                        {/* ---------------------------------------| FOOD ITEM QUANTITY |-------------------------------------- */}

                        <View style={{ marginTop: spacing }}>
                            <Text style={styles.inputText}>Quantity</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: spacing * 1.3, marginHorizontal: spacing, marginBottom: spacing * 0.5 }}>
                                <TouchableOpacity style={[styles.quantityBtn, quantity1 && styles.selected]}
                                    onPress={() => {
                                        setQuantity(1);
                                        setQuantity1(true);
                                        setQuantity2(false);
                                        setQuantity3(false);
                                        setQuantity4(false);
                                        setQuantity5(false);
                                        setError(prevState => ({ ...prevState, quantity: false }));
                                    }} disabled={loading}>
                                    <Text style={styles.quantityBtnText}>1</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.quantityBtn, quantity2 && styles.selected]}
                                    onPress={() => {
                                        setQuantity(2);
                                        setQuantity1(false);
                                        setQuantity2(true);
                                        setQuantity3(false);
                                        setQuantity4(false);
                                        setQuantity5(false);
                                        setError(prevState => ({ ...prevState, quantity: false }));
                                    }} disabled={loading}>
                                    <Text style={styles.quantityBtnText}>2</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.quantityBtn, quantity3 && styles.selected]}
                                    onPress={() => {
                                        setQuantity(3);
                                        setQuantity1(false);
                                        setQuantity2(false);
                                        setQuantity3(true);
                                        setQuantity4(false);
                                        setQuantity5(false);
                                        setError(prevState => ({ ...prevState, quantity: false }));
                                    }} disabled={loading}>
                                    <Text style={styles.quantityBtnText}>3</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.quantityBtn, quantity4 && styles.selected]}
                                    onPress={() => {
                                        setQuantity(4);
                                        setQuantity1(false);
                                        setQuantity2(false);
                                        setQuantity3(false);
                                        setQuantity4(true);
                                        setQuantity5(false);
                                        setError(prevState => ({ ...prevState, quantity: false }));
                                    }} disabled={loading}>
                                    <Text style={styles.quantityBtnText}>4</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.quantityBtn, quantity5 && styles.selected]}
                                    onPress={() => {
                                        setQuantity(5);
                                        setQuantity1(false);
                                        setQuantity2(false);
                                        setQuantity3(false);
                                        setQuantity4(false);
                                        setQuantity5(true);
                                        setError(prevState => ({ ...prevState, quantity: false }));
                                    }} disabled={loading}>
                                    <Text style={styles.quantityBtnText}>5</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.input} placeholder='Other' keyboardType='numeric'
                                    onTextInput={() => {
                                        setQuantity1(false)
                                        setQuantity2(false)
                                        setQuantity3(false)
                                        setQuantity4(false)
                                        setQuantity5(false)
                                    }} onChangeText={(newQuantity) => {
                                        setQuantity(newQuantity);
                                        setError(prevState => ({ ...prevState, quantity: false }));
                                    }} onSubmitEditing={() => { refCategory.current.focus(); Keyboard.dismiss; }} editable={!loading} />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {error.quantity && <MaterialIcons style={{ marginLeft: spacing * 3.2, top: -4 }} name="error-outline" size={13} color={colors.red} />}
                                {error.quantity && <Text style={{ marginLeft: spacing * 0.4, top: -4, color: colors.red, fontSize: 12 }}>Please select or enter the quantity</Text>}
                            </View>
                        </View>

                        {/* X-------------------------------------------------------------------------------------------------X */}

                        {/* ---------------------------------------| FOOD ITEM CATEGORY |-------------------------------------- */}

                        <View style={{ marginTop: spacing }}>
                            <Text style={styles.inputText}>Category</Text>

                            <View style={styles.picker}>
                                <Picker
                                    ref={refCategory}
                                    selectedValue={selectedCategory}
                                    onValueChange={(itemValue, itemIndex) => {
                                        setSelectedCategory(itemValue);
                                        setError(prevState => ({ ...prevState, category: false }));
                                    }} style={{ width: '100%', color: colors.gray }} enabled={!loading}>
                                    <Picker.Item style={{ fontSize: 14.2, color: colors.gray }} label="Select a category" value="" />
                                    <Picker.Item style={{ fontSize: 14.2 }} label="Open food" value="open" />
                                    <Picker.Item style={{ fontSize: 14.2 }} label="Canned item" value="can" />
                                    <Picker.Item style={{ fontSize: 14.2 }} label="Drink" value="drink" />
                                </Picker>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {error.category && <MaterialIcons style={{ marginLeft: spacing * 3.2, top: -4 }} name="error-outline" size={13} color={colors.red} />}
                                {error.category && <Text style={{ marginLeft: spacing * 0.4, top: -4, color: colors.red, fontSize: 12 }}>Please select a category</Text>}
                            </View>
                        </View>

                        {/* X-------------------------------------------------------------------------------------------------X */}

                        {/* -------------------------------------| FOOD ITEM PICK-UP TIME |------------------------------------ */}

                        <View style={{ marginTop: spacing }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Entypo name="time-slot" size={20} style={{ marginLeft: spacing * 3.11 }} color={colors.blue} />
                                <Text style={[styles.inputText, styles.iconText]}>Pick-up times</Text>
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.input} placeholder='e.g. Today from 4-6 pm...' onChangeText={(newPickup) => {
                                    setPickup(newPickup.trim());
                                    setError(prevState => ({ ...prevState, pickup: false }));
                                }} onSubmitEditing={() => { refLocation.current.focus(); Keyboard.dismiss; }} blurOnSubmit={false} editable={!loading} />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {error.pickup && <MaterialIcons style={{ marginLeft: spacing * 3.2, top: -4 }} name="error-outline" size={13} color={colors.red} />}
                                {error.pickup && <Text style={{ marginLeft: spacing * 0.4, top: -4, color: colors.red, fontSize: 12 }}>Please enter the pick-up time</Text>}
                            </View>
                        </View>

                        {/* X-------------------------------------------------------------------------------------------------X */}

                        <View style={[styles.hr, styles.hr2]} />

                        {/* ---------------------------------------| FOOD ITEM LOCATION |-------------------------------------- */}

                        <View style={{ marginTop: spacing }}>
                            <View style={{ flexDirection: 'row' }}>
                                <FontAwesome5 name="map-marker-alt" size={22} style={{ marginLeft: spacing * 3.11 }} color={colors.red} />
                                <Text style={[styles.inputText, styles.iconText]}>Your Location (approx)</Text>
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.input} placeholder='Enter your location' onChangeText={(newLocation) => {
                                    setLocation(newLocation.trim());
                                    setError(prevState => ({ ...prevState, location: false }));
                                }} ref={refLocation} onSubmitEditing={() => { refCity.current.focus(); Keyboard.dismiss; }} blurOnSubmit={false} editable={!loading} />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {error.location && <MaterialIcons style={{ marginLeft: spacing * 3.2, top: -4 }} name="error-outline" size={13} color={colors.red} />}
                                {error.location && <Text style={{ marginLeft: spacing * 0.4, top: -4, color: colors.red, fontSize: 12 }}>Please enter your location</Text>}
                            </View>
                            <View style={[styles.picker, { height: spacing * 4 }]}>
                                <Picker
                                    ref={refCity}
                                    selectedValue={city}
                                    onValueChange={(itemValue, itemIndex) => {
                                        setCity(itemValue);
                                        setError(prevState => ({ ...prevState, city: false }));
                                    }} style={{ width: '100%', color: colors.gray }} enabled={!loading}>
                                    <Picker.Item style={{ fontSize: 14.2, color: colors.gray }} label="City" value="" />
                                    <Picker.Item style={{ fontSize: 14.2 }} label="Karachi" value="Karachi" />
                                    <Picker.Item style={{ fontSize: 14.2 }} label="Islamabad" value="Islamabad" />
                                    <Picker.Item style={{ fontSize: 14.2 }} label="Lahore" value="Lahore" />
                                </Picker>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {error.city && <MaterialIcons style={{ marginLeft: spacing * 3.2, top: -4 }} name="error-outline" size={13} color={colors.red} />}
                                {error.city && <Text style={{ marginLeft: spacing * 0.4, top: -4, color: colors.red, fontSize: 12 }}>Please enter your city</Text>}
                            </View>
                        </View>

                        {/* X-------------------------------------------------------------------------------------------------X */}

                        {/* ------------------------------------| FOOD ITEM LISTING PERIOD |----------------------------------- */}

                        <View style={{ marginTop: spacing * 1.3 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Entypo name="calendar" size={20} style={{ marginLeft: spacing * 3.11 }} color={colors.gray} />
                                <Text style={[styles.inputText, styles.iconText]}>List for</Text>
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.input} placeholder='Enter no. of days' keyboardType='numeric' onChangeText={(newList) => {
                                    setListingPeriod(newList);
                                    setError(prevState => ({ ...prevState, listing: false }));
                                }} editable={!loading} />
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {error.listing && <MaterialIcons style={{ marginLeft: spacing * 3.2, top: -4 }} name="error-outline" size={13} color={colors.red} />}
                                {error.listing && <Text style={{ marginLeft: spacing * 0.4, top: -4, color: colors.red, fontSize: 12 }}>Please enter the listing period</Text>}
                            </View>
                        </View>

                        {/* X-------------------------------------------------------------------------------------------------X */}

                        {/* -----------------------------------------| SUBMIT BUTTON |----------------------------------------- */}

                        <View style={isKeyboardVisible ? { marginTop: spacing, marginBottom: spacing * 25 } : { marginTop: spacing, marginBottom: spacing * 3 }}>
                            <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
                                <Text style={styles.btnText}>Submit</Text>
                            </TouchableOpacity>
                        </View>

                        {/* X-------------------------------------------------------------------------------------------------X */}

                    </View>
                </ScrollView>
            </Modal>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        height: '100%',
        width: '100%',
        borderTopLeftRadius: spacing * 1.9,
        borderTopRightRadius: spacing * 1.9
    },
    line: {
        alignSelf: 'center',
        width: spacing * 4.2,
        height: 4,
        backgroundColor: colors.whiteSmoke,
        position: 'absolute',
        top: - spacing * 1.2,
        borderRadius: spacing
    },
    modal: {
        margin: 0,
        marginTop: spacing * 15,
        flex: 1,
        height: spacing * 69,
        width: '100%',
        justifyContent: 'flex-end',
        backgroundColor: colors.white,
        borderTopLeftRadius: spacing * 1.8,
        borderTopRightRadius: spacing * 1.8
    },

    heading: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.dark,
        textAlign: 'center',
        marginTop: spacing * 2.7,
        marginBottom: spacing * 0.3
    },

    hr: {
        width: '80%',
        borderBottomColor: colors.primary,
        borderBottomWidth: 0.6,
        marginVertical: spacing * 0.8,
        marginBottom: spacing * 1.8,
        alignSelf: 'center'
    },
    hr2: {
        marginTop: spacing * 2,
        marginBottom: spacing * 1,
        borderBottomWidth: 0.45,
        borderBottomColor: '#E0E0E0',
        borderBottomColor: colors.primary
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
    inputImgContainer: {
        flexDirection: 'row',
        width: '84%',
        height: spacing * 6,
        marginVertical: spacing * 0.8,
        borderColor: colors.gray,
        borderWidth: 0.3,
        borderRadius: spacing * 0.4,
        paddingHorizontal: spacing,
        paddingVertical: spacing * 0.5,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    input: {
        color: colors.darkLight,
        fontSize: 14.5,
        width: '100%'
    },
    inputText: {
        color: colors.dark,
        fontSize: 14.5,
        fontWeight: "500",
        marginLeft: spacing * 2.9,
        width: '100%'
    },
    inputImgText: {
        color: colors.gray,
        fontSize: 13.5,
        fontWeight: "500",
        marginLeft: spacing * 1.2,
        alignSelf: 'center'
    },
    picker: {
        width: '84%',
        height: spacing * 4.2,
        marginVertical: spacing * 0.8,
        borderColor: colors.gray,
        borderWidth: 0.3,
        borderRadius: spacing * 0.4,
        alignSelf: 'center',
        justifyContent: 'center'
    },

    quantityBtn: {
        width: spacing * 4.5,
        height: spacing * 3.5,
        backgroundColor: colors.light,
        borderRadius: spacing * 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityBtnText: {
        fontSize: 13.5
    },
    selected: {
        borderColor: colors.darkLight,
        borderWidth: 0.7
    },

    iconText: {
        marginLeft: spacing * 0.8
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
        flex: 0,
        margin: 0,
        borderRadius: spacing,
        backgroundColor: colors.white,
        height: spacing * 14.5,
        width: '100%',
        alignSelf: 'center',
        elevation: spacing * 2,
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        borderTopColor: colors.gray,
        borderTopWidth: 0.18
    },
    imageModalText: {
        color: colors.darkLight,
        fontSize: 15.3,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: spacing * 1.5,
    },
    imageBtn: {
        width: '45%',
        height: 46,
        paddingHorizontal: spacing * 3.1,
        backgroundColor: colors.twitterBlue,
        borderRadius: spacing * 2,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        color: colors.white,
        marginTop: spacing
    },
    imageBtnText: {
        color: colors.gray,
        fontSize: 13,
        fontWeight: "600"
    },

    cameraModal: {
        flex: 0,
        width: '100%',
        height: '100%',
    },

    cameraModalContainer: {
        position: 'absolute',
        left: -18,
        top: -18,
        width: '100%',
        height: '100%',
    }
})

export default FoodItemModal;