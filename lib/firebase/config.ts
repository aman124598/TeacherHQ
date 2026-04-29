import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

// Firebase configuration - cross-platform env lookup.
// Web (Next.js): NEXT_PUBLIC_*; Expo: EXPO_PUBLIC_*
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate required environment variables (Static check required for Next.js Webpack)
// Only warn on Web if missing, Native will handle its own errors
if (typeof window !== 'undefined' && !firebaseConfig.apiKey) {
  const missingVars = [];
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  if (missingVars.length > 0) {
    console.error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
  }
}

// Lazy initialization - only initialize when needed
let app: FirebaseApp | null = null;

export const getFirebaseApp = () => {
  if (!app) {
    try {
      if (getApps().length > 0) {
        app = getApp();
      } else {
        if (!firebaseConfig.apiKey) {
          console.error("Firebase Initialization Error: API Key is completely missing! This usually means your GitHub Actions didn't have access to your NEXT_PUBLIC repository secrets during compilation.");
        }
        app = initializeApp(firebaseConfig);
      }
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      // Return a dummy app to prevent hard crashes on client
      return {} as FirebaseApp;
    }
  }
  return app;
};

// For backwards compatibility, also export app directly
export { firebaseConfig };
export default firebaseConfig;
