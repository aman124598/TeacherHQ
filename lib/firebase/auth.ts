import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseApp } from './config';

// Initialize Firebase services lazily
const getAuthInstance = () => getAuth(getFirebaseApp());
const getDbInstance = () => getFirestore(getFirebaseApp());
const getGoogleProvider = () => {
  const provider = new GoogleAuthProvider();
  // Add scopes if needed
  provider.addScope('profile');
  provider.addScope('email');
  return provider;
};

// User data interface
export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'teacher' | 'admin';
  department?: string;
  teacherId?: string;
  createdAt?: any;
  lastLoginAt?: any;
  // Organization fields
  organizationId?: string;
  organizationRole?: 'admin' | 'teacher';
  organizationName?: string;
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(getAuthInstance(), email, password);
    // Try to update last login, but don't fail if it doesn't work
    try {
      await updateUserLastLogin(userCredential.user.uid);
    } catch (e) {
      console.warn('Could not update last login time:', e);
    }
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, displayName: string, teacherId?: string, department?: string) => {
  try {
    const auth = getAuthInstance();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, { displayName });
    
    // Create user document in Firestore
    await createUserDocument(userCredential.user, { displayName, teacherId, department });
    
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Sign in with Google - uses different methods for web vs Capacitor
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google sign-in...'); // DEBUG LOG
    const auth = getAuthInstance();
    const provider = getGoogleProvider();
    
    // Check if running in Capacitor (mobile app)
    const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor;
    
    if (isCapacitor) {
      // Google popup/redirect doesn't work well in Capacitor WebView
      // Inform the user to use email/password login instead
      console.log('Capacitor detected - Google Sign-In requires native plugin');
      return { 
        success: false, 
        error: 'Google Sign-In is not available in the mobile app. Please use email/password to sign in, or use the web version for Google login.' 
      };
    }
    
    // Use popup for web - works better in browsers
    console.log('Using popup flow for web...');
    const result = await signInWithPopup(auth, provider);
    
    console.log('Google sign-in successful:', result.user.email); // DEBUG LOG
    
    // Create or update user document in Firestore
    try {
      const userDoc = await getDoc(doc(getDbInstance(), 'users', result.user.uid));
      if (!userDoc.exists()) {
        await createUserDocument(result.user);
      } else {
        await updateUserLastLogin(result.user.uid);
      }
    } catch (e) {
      console.warn('Could not update Firestore user data:', e);
    }
    
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('Google sign-in error:', error); // DEBUG LOG
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Legacy function for handling redirect result (kept for backwards compatibility)
export const handleGoogleRedirectResult = async () => {
  // With popup flow, this is no longer needed, but keep for compatibility
  return { success: false, user: null };
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(getAuthInstance());
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(getAuthInstance(), email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// Create user document in Firestore
const createUserDocument = async (user: User, additionalData?: { displayName?: string; teacherId?: string; department?: string }) => {
  const userRef = doc(getDbInstance(), 'users', user.uid);
  
  const userData: UserData = {
    uid: user.uid,
    email: user.email,
    displayName: additionalData?.displayName || user.displayName,
    photoURL: user.photoURL,
    role: 'teacher',
    teacherId: additionalData?.teacherId || '',
    department: additionalData?.department || '',
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };
  
  await setDoc(userRef, userData);
  return userData;
};

// Update user's last login
const updateUserLastLogin = async (uid: string) => {
  const userRef = doc(getDbInstance(), 'users', uid);
  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
  });
};

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  const userRef = doc(getDbInstance(), 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserData;
  }
  return null;
};

// Error message handler
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};

// Export auth getter for AuthContext
export const getAuth_ = getAuthInstance;
export { onAuthStateChanged };
export type { User };
