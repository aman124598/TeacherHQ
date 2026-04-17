import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

// Firebase configuration - cross-platform env lookup.
// Web (Next.js): NEXT_PUBLIC_*; Expo: EXPO_PUBLIC_*
const env = (name: string) => process.env[name];

const firebaseConfig = {
  apiKey: env('NEXT_PUBLIC_FIREBASE_API_KEY') || env('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: env('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') || env('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: env('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || env('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: env('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') || env('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId:
    env('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') || env('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('NEXT_PUBLIC_FIREBASE_APP_ID') || env('EXPO_PUBLIC_FIREBASE_APP_ID'),
  measurementId: env('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID') || env('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID')
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
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
};

// For backwards compatibility, also export app directly
export { firebaseConfig };
export default firebaseConfig;
