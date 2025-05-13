// /firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCdR98CbXKI9_ZIXiif-NnBNH6W-dOoDoY",
  authDomain: "spaa-7e449.firebaseapp.com",
  projectId: "spaa-7e449",
  storageBucket: "spaa-7e449.appspot.com",
  messagingSenderId: "520288870338",
  appId: "1:520288870338:android:9a46b2f6e86c8c2bac405b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);