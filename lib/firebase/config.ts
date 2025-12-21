import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqhM42m3frmjHTD78GEYP2_GYJYEGyNJ8",
  authDomain: "attendence-f72d7.firebaseapp.com",
  projectId: "attendence-f72d7",
  storageBucket: "attendence-f72d7.firebasestorage.app",
  messagingSenderId: "70105143544",
  appId: "1:70105143544:web:ab67bb71e73cdc210a430d",
  measurementId: "G-SSCKVP0G1R"
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
