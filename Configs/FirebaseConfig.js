// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpEm3ova2MvTOTUM8aVsV7y50MejFGX24",
  authDomain: "quicart-shopping-platform.firebaseapp.com",
  projectId: "quicart-shopping-platform",
  storageBucket: "quicart-shopping-platform.appspot.com",
  messagingSenderId: "823232410152",
  appId: "1:823232410152:web:b830579437e7711113b1d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Instantiate Firestore object
const db = getFirestore(app);
export { db };

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export { auth };
