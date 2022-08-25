// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzU3QyCfIDFJFhGrOAQQLpBfaiOOgl9Is",
  authDomain: "instagram-clone-32902.firebaseapp.com",
  projectId: "instagram-clone-32902",
  storageBucket: "instagram-clone-32902.appspot.com",
  messagingSenderId: "851136464963",
  appId: "1:851136464963:web:b6d3ec1ea6b56dfb652cf6"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const auth = getAuth()
const db = getFirestore();
const storage = getStorage();


export { auth, db, storage }