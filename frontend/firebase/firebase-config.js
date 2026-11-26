import { initializeApp } from "firebase/app";
import {
  browserPopupRedirectResolver,
  browserSessionPersistence,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBY5guTgeYl3GyHJdtm4RZ1qarMi0LEJCQ",
  authDomain: "devcursos-b3589.firebaseapp.com",
  projectId: "devcursos-b3589",
  storageBucket: "devcursos-b3589.firebasestorage.app",
  messagingSenderId: "43442166167",
  appId: "1:43442166167:web:08c153d4a8b298a66dccd2",
  measurementId: "G-M8TJM8D220",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
try {
  // Remove as cópias legadas da aplicação e a sessão Firebase antes gravada no localStorage.
  localStorage.removeItem("devcursos_token");
  localStorage.removeItem("devcursos_user");
  localStorage.removeItem(`firebase:authUser:${firebaseConfig.apiKey}:${app.name}`);
} catch {
  // O navegador pode bloquear localStorage.
}
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserSessionPersistence],
  popupRedirectResolver: browserPopupRedirectResolver,
});

export const googleProvider = new GoogleAuthProvider();
