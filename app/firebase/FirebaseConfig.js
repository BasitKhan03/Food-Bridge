import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
// import { getAuth } from 'firebase/auth'
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDz7qDj_5P4Jm0t1KoaOcpFxCT0NKdYLvY",
    authDomain: "food-bridge-1fecd.firebaseapp.com",
    projectId: "food-bridge-1fecd",
    storageBucket: "food-bridge-1fecd.appspot.com",
    appId: "1:903781008567:android:cdb4292ead02c7e8f87932",
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
// const auth = getAuth(app);

export { db, storage, auth };

