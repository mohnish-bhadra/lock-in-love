'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Initialize Firebase - only on client side
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

const initializeFirebase = () => {
  if (typeof window !== 'undefined' && !app) {
    try {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }
  return { app, auth, db };
};

// Get Firebase instances
const getFirebaseInstances = () => {
  if (!app || !auth || !db) {
    return initializeFirebase();
  }
  return { app, auth, db };
};

// Anonymous authentication helper
export const authenticateAnonymously = async () => {
  const { auth: authInstance } = getFirebaseInstances();
  if (!authInstance) {
    throw new Error('Firebase Auth not initialized');
  }
  
  try {
    const result = await signInAnonymously(authInstance);
    return result.user;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

// Export getter functions instead of direct exports
export const getAuthInstance = () => {
  const { auth: authInstance } = getFirebaseInstances();
  return authInstance;
};

export const getDbInstance = () => {
  const { db: dbInstance } = getFirebaseInstances();
  return dbInstance;
};

// Initialize on module load (client-side only)
if (typeof window !== 'undefined') {
  initializeFirebase();
}

export { auth, db };