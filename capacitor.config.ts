import type { CapacitorConfig } from '@capacitor/cli';

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
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
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
