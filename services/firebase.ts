
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
// Asegúrate de que estas credenciales sean correctas para tu proyecto
const firebaseConfig = {
  apiKey: "AIzaSyARBBxqnPTb7No2KmYNX1Wk8FOT7Wm_gF8",
  authDomain: "qlimpio-20408.firebaseapp.com",
  projectId: "qlimpio-20408",
  storageBucket: "qlimpio-20408.firebasestorage.app",
  messagingSenderId: "220835644558",
  appId: "1:220835644558:web:37b51ceb5ecfe5270df5df"
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore y exportarlo
// Esto permite usar 'db' en otras partes de la aplicación mediante: import { db } from './firebase.js';
export const db = getFirestore(app);
