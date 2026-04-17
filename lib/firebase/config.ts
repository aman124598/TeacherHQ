import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

// Firebase configuration - uses environment variables (required)
// Next.js uses process.env.NEXT_PUBLIC_*, Expo uses Constants.expoConfig?.extra?
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// --- Cross-Platform Environment Injection ---
// For React Native (Expo), if process.env is empty, we try to get from Expo Constants
if (!firebaseConfig.apiKey) {
    try {
        // Dynamic import to avoid breaking web builds
        const Constants = require('expo-constants').default;
        const extra = Constants.expoConfig?.extra || {};
        if (extra.firebaseApiKey) {
            firebaseConfig.apiKey = extra.firebaseApiKey;
            firebaseConfig.authDomain = extra.firebaseAuthDomain;
            firebaseConfig.projectId = extra.firebaseProjectId;
            firebaseConfig.storageBucket = extra.firebaseStorageBucket;
            firebaseConfig.messagingSenderId = extra.firebaseMessagingSenderId;
            firebaseConfig.appId = extra.firebaseAppId;
            firebaseConfig.measurementId = extra.firebaseMeasurementId;
        }
    } catch (e) {
        // Not in an Expo environment or expo-constants not available
    }
}

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
