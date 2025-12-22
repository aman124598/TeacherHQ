"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { getAuth_, onAuthStateChanged, getUserData, logOut, handleGoogleRedirectResult, User, UserData } from './auth';
import { useRouter, usePathname } from 'next/navigation';
import { getOrganization, Organization } from './organizations';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  organization: Organization | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  organization: null,
  loading: true,
  signOut: async () => {},
  refreshUserData: async () => {},
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
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Use ref to always have current pathname value (avoids stale closure)
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Function to refresh user data (useful after org changes)
  const refreshUserData = async () => {
    if (user?.uid) {
      const data = await getUserData(user.uid);
      if (data) {
        setUserData(data as any);
        if (data.organizationId) {
          const org = await getOrganization(data.organizationId);
          setOrganization(org);
        }
      }
    }
  };

  // Handle client-side mounting and auth state
  useEffect(() => {
    setIsMounted(true);
    
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(getAuth_(), async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch user data from Firestore with error handling
        try {
          console.log('Fetching user data for:', firebaseUser.uid);
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
          
          console.log('User data loaded:', data);
          setUserData(data as any);

          // Fetch organization data if user has one
          if (data?.organizationId) {
            try {
              const org = await getOrganization(data.organizationId);
              setOrganization(org);
              console.log('Organization loaded:', org?.name);
            } catch (orgError) {
              console.warn('Could not load organization:', orgError);
            }
          }
          
          // Determine redirect destination
          const currentPath = pathnameRef.current;
          console.log('Current path:', currentPath);
          
          // Public paths that don't require auth or org
          const publicPaths = ['/', '/signup', '/forgot-password'];
          const onboardingPath = '/onboarding';
          const isJoinPath = currentPath.startsWith('/join/');
          
          if (publicPaths.includes(currentPath)) {
            // User is on public page - check if they need onboarding
            if (!data?.organizationId && !isJoinPath) {
              console.log('User has no organization, redirecting to onboarding');
              router.push('/onboarding');
            } else {
              console.log('Redirecting to dashboard');
              router.push('/dashboard');
            }
          } else if (currentPath !== onboardingPath && !data?.organizationId) {
            // User is on protected page but has no org - redirect to onboarding
            console.log('User has no organization, redirecting to onboarding');
            router.push('/onboarding');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set basic user data from Firebase Auth if Firestore fails
          setUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: 'teacher',
          } as any);
        }
      } else {
        console.log('No user, clearing state...');
        setUser(null);
        setUserData(null);
        setOrganization(null);
        
        // Redirect to login if not on public pages
        const currentPath = pathnameRef.current;
        const publicPaths = ['/', '/signup', '/forgot-password'];
        const isJoinPath = currentPath.startsWith('/join/');
        if (!publicPaths.includes(currentPath) && !isJoinPath) {
          console.log('Redirecting to /');
          router.push('/');
        }
      }
      setLoading(false);
    });
    
    // Handle Google redirect result after setting up listener
    handleGoogleRedirectResult()
      .then((result) => {
        if (result?.success && result?.user) {
          console.log('Google redirect result: user authenticated');
        }
      })
      .catch(console.warn);

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await logOut();
      setUser(null);
      setUserData(null);
      setOrganization(null);
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
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      organization,
      loading, 
      signOut: handleSignOut,
      refreshUserData,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

