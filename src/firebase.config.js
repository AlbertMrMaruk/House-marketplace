import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMwS-GQmuZQ-bt0kDlt1raq7bCyKApKa8",
  authDomain: "house-marketplace-4c4cb.firebaseapp.com",
  projectId: "house-marketplace-4c4cb",
  storageBucket: "house-marketplace-4c4cb.appspot.com",
  messagingSenderId: "447361066286",
  appId: "1:447361066286:web:64600fe910c242b97446bf",
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
