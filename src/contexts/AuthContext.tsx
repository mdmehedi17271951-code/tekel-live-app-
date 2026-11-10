import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  googleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  FirebaseUser,
  handleFirestoreError,
  OperationType 
} from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';
import { SAMPLE_USERS } from '../utils/mockData';
import { translations, Language } from '../utils/translations';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  currentUser: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  language: Language;
  theme: 'light' | 'dark';
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string, username: string) => Promise<void>;
  loginAsDemoUser: (user: UserProfile) => void;
  logout: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  t: (key: keyof typeof translations.bn) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['mdmehedi17271951@gmail.com', 'admin@tekel.live'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    // Check local storage for quick demo user or last saved state
    const saved = localStorage.getItem('tekel_demo_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to the first sample user (Admin Mehedi) for instant interactive experience
    return SAMPLE_USERS[0];
  });
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem('tekel_lang');
    return (savedLang as Language) || 'bn';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('tekel_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark'; // Dark theme default for modern sleek Android social aesthetic
  });

  // Apply dark mode class to root document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('tekel_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tekel_lang', lang);
  };

  const t = (key: keyof typeof translations.bn): string => {
    return translations[language][key] || translations.bn[key] || String(key);
  };

  // Helper to sync or create user in Firestore
  const syncFirestoreUserProfile = async (fbUser: FirebaseUser): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', fbUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      const isConfiguredAdmin = ADMIN_EMAILS.includes(fbUser.email || '');

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        const updated = {
          ...data,
          role: isConfiguredAdmin ? ('admin' as UserRole) : data.role,
          isVerified: isConfiguredAdmin ? true : data.isVerified,
        };
        setCurrentUser(updated);
        localStorage.setItem('tekel_demo_user', JSON.stringify(updated));
        return updated;
      } else {
        const rawHandle = (fbUser.displayName || fbUser.email?.split('@')[0] || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_');
        const username = `${rawHandle}_${Math.floor(Math.random() * 899 + 100)}`;

        const newProfile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'টেকেল ব্যবহারকারী',
          username: username,
          photoURL: fbUser.photoURL || SAMPLE_USERS[1].photoURL,
          bio: 'টেকেল লাইভে স্বাগতম! আমি নতুন যুক্ত হয়েছি। ✨',
          coverURL: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1000&auto=format&fit=crop&q=80',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          role: isConfiguredAdmin ? 'admin' : 'user',
          isVerified: isConfiguredAdmin,
          isBanned: false,
          createdAt: new Date().toISOString(),
        };

        await setDoc(userDocRef, newProfile);
        setCurrentUser(newProfile);
        localStorage.setItem('tekel_demo_user', JSON.stringify(newProfile));
        return newProfile;
      }
    } catch (err) {
      console.warn('Firestore user fetch failed, using fallback profile:', err);
      const fallback: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'টেকেল ব্যবহারকারী',
        username: (fbUser.email?.split('@')[0] || 'user').toLowerCase(),
        photoURL: fbUser.photoURL || SAMPLE_USERS[0].photoURL,
        followersCount: 1,
        followingCount: 0,
        postsCount: 0,
        role: ADMIN_EMAILS.includes(fbUser.email || '') ? 'admin' : 'user',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await syncFirestoreUserProfile(user);
      } else {
        // If not signed in via Firebase, check if demo user was chosen
        const savedDemo = localStorage.getItem('tekel_demo_user');
        if (savedDemo) {
          try {
            setCurrentUser(JSON.parse(savedDemo));
          } catch {
            setCurrentUser(SAMPLE_USERS[0]);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      if (res.user) {
        await syncFirestoreUserProfile(res.user);
      }
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await syncFirestoreUserProfile(res.user);
      }
    } catch (error: any) {
      console.error('Email Login Error:', error);
      throw error;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string, username: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        const isConfiguredAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
        const newProfile: UserProfile = {
          uid: res.user.uid,
          email: email,
          displayName: name,
          username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
          photoURL: SAMPLE_USERS[1].photoURL,
          bio: 'টেকেল লাইভে স্বাগতম! ✨',
          coverURL: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1000&auto=format&fit=crop&q=80',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          role: isConfiguredAdmin ? 'admin' : 'user',
          isVerified: isConfiguredAdmin,
          isBanned: false,
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, 'users', res.user.uid), newProfile);
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.CREATE, `users/${res.user.uid}`);
        }

        setCurrentUser(newProfile);
        localStorage.setItem('tekel_demo_user', JSON.stringify(newProfile));
      }
    } catch (error: any) {
      console.error('Signup Error:', error);
      throw error;
    }
  };

  const loginAsDemoUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('tekel_demo_user', JSON.stringify(user));
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setFirebaseUser(null);
    setCurrentUser(null);
    localStorage.removeItem('tekel_demo_user');
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
    setCurrentUser(updated);
    localStorage.setItem('tekel_demo_user', JSON.stringify(updated));

    if (firebaseUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, updates);
      } catch (err) {
        console.warn('Could not update Firestore profile:', err);
      }
    }
  };

  const isAdmin = currentUser?.role === 'admin' || (currentUser?.email ? ADMIN_EMAILS.includes(currentUser.email) : false);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentUser,
        loading,
        isAdmin,
        language,
        theme,
        setLanguage,
        toggleTheme,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        loginAsDemoUser,
        logout,
        updateProfileData,
        t,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
