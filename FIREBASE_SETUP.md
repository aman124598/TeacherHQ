# Firebase Configuration Guide

## Setup Instructions

To use Firebase Authentication in this project, you need to:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Give your project a name

### 2. Add a Web App

1. In your Firebase project, click the gear icon (Settings) > Project settings
2. Scroll down to "Your apps" section
3. Click on the web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the `firebaseConfig` object values

### 3. Enable Authentication

1. Go to Build > Authentication in the Firebase Console
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click on it, toggle "Enable", and save
   - **Google**: Click on it, toggle "Enable", add your project's email, and save

### 4. Set Up Firestore Database

1. Go to Build > Firestore Database
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose a location closest to your users

### 5. Configure Environment Variables

Create a `.env.local` file in the root of your project with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 6. Firestore Security Rules (Production)

For production, update your Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Attendance collection
    match /attendance/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 7. Restart Your Development Server

After adding the environment variables, restart your dev server:

```bash
npm run dev
```

## Features Implemented

- ✅ Email/Password Authentication
- ✅ Google Sign-In
- ✅ Password Reset
- ✅ User Profile Storage in Firestore
- ✅ Protected Routes
- ✅ Auto-redirect for authenticated/unauthenticated users
