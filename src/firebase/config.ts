import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC1rt9yQbwXhG8V8VOjwzKCXserkI3hwxE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'rendavous26.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'rendavous26',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'rendavous26.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '48136533143',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:48136533143:web:c8c4e7e7383fcc068e65d2',
};

export const isFirebaseConfigured = true;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
