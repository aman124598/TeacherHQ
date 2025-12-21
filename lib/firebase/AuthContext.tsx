"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth_, onAuthStateChanged, getUserData, logOut, handleGoogleRedirectResult, User, UserData } from './auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Handle client-side mounting to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
    // Handle Google redirect result on mount
    handleGoogleRedirectResult().catch(console.warn);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isMounted) return;

    const unsubscribe = onAuthStateChanged(getAuth_(), async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch user data from Firestore with error handling
        try {
          let data = await getUserData(firebaseUser.uid);
          
          // If user doesn't exist in Firestore, create them
          if (!data) {
            console.log('User not in Firestore, creating document...');
            const { createUserIfNotExists } = await import('@/lib/firebase/firestore');
            const newUserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: 'teacher' as const,
            };
            await createUserIfNotExists(newUserData);
            data = newUserData;
          }
          
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set basic user data from Firebase Auth if Firestore fails
          setUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: 'teacher',
          });
        }
        
        // Redirect to dashboard if on login page
        if (pathname === '/' || pathname === '/signup') {
          router.push('/dashboard');
        }
      } else {
        setUser(null);
        setUserData(null);
        
        // Redirect to login if not on public pages
        const publicPaths = ['/', '/signup', '/forgot-password'];
        if (!publicPaths.includes(pathname)) {
          router.push('/');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isMounted, router, pathname]);

  const handleSignOut = async () => {
    try {
      await logOut();
      setUser(null);
      setUserData(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading state only after mounting to avoid hydration mismatch
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};
