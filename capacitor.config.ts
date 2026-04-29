import type { CapacitorConfig } from '@capacitor/cli';
import * as fs from 'fs';
import * as path from 'path';

// Attempt to read auth domain from .env.local
let authDomain = 'attendence-f72d7.firebaseapp.com'; // Fallback to know standard domain
try {
  const envContent = fs.readFileSync(path.resolve(__dirname, '.env.local'), 'utf-8');
  const match = envContent.match(/NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=(.*)/);
  if (match && match[1]) {
    authDomain = match[1].trim();
  }
} catch (e) {
  // Ignore file read error
}

const config: CapacitorConfig = {
  appId: 'com.app.teacherhq',
  appName: 'TeacherHQ',
  webDir: 'out',
  server: {
    // Enable this for live reload during development
    // url: 'http://YOUR_LOCAL_IP:3000',
    // cleartext: true
  },
  plugins: {
    FirebaseAuthentication: {
      providers: ['google.com'],
      skipNativeAuth: false,
      authDomain: authDomain,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      showSpinner: true,
      spinnerColor: '#3b82f6',
    }
  }
};

export default config;
