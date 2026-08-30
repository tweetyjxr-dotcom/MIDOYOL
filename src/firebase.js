import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWl0ifSNFUGc6gHZb_6_61CEfpXwKkFLU",
  authDomain: "midoyol.firebaseapp.com",
  projectId: "midoyol",
  storageBucket: "midoyol.firebasestorage.app",
  messagingSenderId: "591170675503",
  appId: "1:591170675503:web:738bb01a5fd9cb5a7837da",
  measurementId: "G-3BZGY5Z1R9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
