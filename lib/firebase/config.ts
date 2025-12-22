import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

// Firebase configuration - uses environment variables for production
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDqhM42m3frmjHTD78GEYP2_GYJYEGyNJ8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "attendence-f72d7.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "attendence-f72d7",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "attendence-f72d7.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "70105143544",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:70105143544:web:ab67bb71e73cdc210a430d",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-SSCKVP0G1R"
};

// Lazy initialization - only initialize when needed
let app: FirebaseApp | null = null;

export const getFirebaseApp = () => {
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
};

// For backwards compatibility, also export app directly
export { firebaseConfig };
export default firebaseConfig;
