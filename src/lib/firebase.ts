import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyD placeholder',
  authDomain: 'malibu-bodies.firebaseapp.com',
  projectId: 'malibu-bodies',
  storageBucket: 'malibu-bodies.firebasestorage.app',
  messagingSenderId: '834565969987',
  appId: '1:834565969987:web:07ba065c8eb1b505c39cf6',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
