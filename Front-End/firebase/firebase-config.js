//import { getAuth } from "firebase/auth";
//export const auth = getAuth(app);
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBY5guTgeYl3GyHJdtm4RZ1qarMi0LEJCQ",
  authDomain: "devcursos-b3589.firebaseapp.com",
  projectId: "devcursos-b3589",
  storageBucket: "devcursos-b3589.firebasestorage.app",
  messagingSenderId: "43442166167",
  appId: "1:43442166167:web:08c153d4a8b298a66dccd2",
  measurementId: "G-M8TJM8D220"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);