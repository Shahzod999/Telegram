import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chat-79954.firebaseapp.com",
  projectId: "chat-79954",
  storageBucket: "chat-79954.appspot.com",
  messagingSenderId: "951818317180",
  appId: "1:951818317180:web:af96a1d3389a90a30648f9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
