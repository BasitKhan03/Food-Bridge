import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, BackHandler } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Entypo, Ionicons } from '@expo/vector-icons';

import colors from '../config/colors';
import spacing from '../config/spacing';

const CameraModal = (props) => {
    const [hasCameraPersmission, setHasCameraPermission] = useState(null);
    const [image, setImage] = useState(null);
    const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);

    const cameraRef = useRef(null);

    useEffect(() => {
        const backAction = () => {
            props.navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        (async () => {
            MediaLibrary.requestPermissionsAsync();
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === 'granted');
        })();
    }, []);

    const takePicture = async () => {
        if (cameraRef) {
            try {
                const data = await cameraRef.current.takePictureAsync();
                setImage(data.uri);
            }
            catch (err) {
                console.log(err)
            }
        }
    }

    const done = async () => {
        if (image) {
            try {
                props.setImage(image);
                props.setCameraImage(image);
                setImage(null);
                props.toggleCameraModal();
            }
            catch (err) {
                console.log(err);
            }
        }
    }

    if (hasCameraPersmission === false) {
        return <Text>No access to camera</Text>
    }

    return (
        <View style={styles.container}>

            {!image ?
                <Camera
                    style={styles.camera}
                    type={Camera.Constants.Type.back}
                    flashMode={flash}
                    ratio={'16:9'}
                    pictureSize={'1920x1080'}
                    autoFocus={Camera.Constants.AutoFocus.on}
                    playSoundOnCapture={false}
                    ref={cameraRef}
                >

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing * 2, paddingLeft: spacing * 2.1, paddingRight: spacing * 2.5 }}>
                        <TouchableOpacity onPress={() => props.toggleCameraModal()}>
                            <Ionicons name="arrow-back" size={32} color={colors.white} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { flash === Camera.Constants.FlashMode.off ? setFlash(Camera.Constants.FlashMode.torch) : setFlash(Camera.Constants.FlashMode.off) }}>
                            <Entypo name="flash" size={32} color={flash === Camera.Constants.FlashMode.off ? colors.white : colors.gray} />
                        </TouchableOpacity>
                    </View>

                </Camera>

                :

                <Image source={{ uri: image }} style={styles.camera} />
            }

            <View style={{ height: '18%', backgroundColor: colors.darkBrown, justifyContent: 'center' }}>

                {image ?
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing * 7, paddingTop: spacing }}>
                        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }} onPress={() => setImage(null)} >
                            <Entypo name='retweet' size={32} color={colors.white} />
                            <Text style={[styles.txt, { marginLeft: spacing * 0.5 }]}>Re-take</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }} onPress={done} >
                            <Entypo name='check' size={32} color={colors.white} />
                            <Text style={styles.txt}>Done</Text>
                        </TouchableOpacity>
                    </View>
                    :
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity onPress={takePicture} style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Entypo name='circle' size={55} color={colors.white} />
                            <Text style={{ color: colors.white, marginTop: spacing }}>Take a picture</Text>
                        </TouchableOpacity>
                    </View>
                }

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkBrown,
        justifyContent: 'center',
        paddingBottom: spacing
    },
    camera: {
        flex: 1,
        borderRadius: spacing,
    },
    txt: {
        fontSize: 14.5,
        color: colors.white,
        marginTop: spacing * 0.7
    }
})

export default CameraModal;
