import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGm3bzsCxYSARcgVn41ta_EOut9fauWr0",
  authDomain: "ecommerce-74229.firebaseapp.com",
  projectId: "ecommerce-74229",
  storageBucket: "ecommerce-74229.firebasestorage.app",
  messagingSenderId: "47160479095",
  appId: "1:47160479095:web:0dd3a844d5d5c3847ea572",
  measurementId: "G-47FYXTR59Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };