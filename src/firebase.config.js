// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMwS-GQmuZQ-bt0kDlt1raq7bCyKApKa8",
  authDomain: "house-marketplace-4c4cb.firebaseapp.com",
  projectId: "house-marketplace-4c4cb",
  storageBucket: "house-marketplace-4c4cb.appspot.com",
  messagingSenderId: "447361066286",
  appId: "1:447361066286:web:64600fe910c242b97446bf",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();
