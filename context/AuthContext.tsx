"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function mapFirebaseAuthError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "An unexpected authentication error occurred.";
  }

  const errCode = (error as { code?: string }).code || "";

  switch (errCode) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please verify and try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please log in instead.";
    case "auth/weak-password":
      return "Password is too weak. Please choose at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was canceled. Please try again.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Please wait a moment before trying again.";
    case "auth/network-request-failed":
      return "Network connection error. Please check your internet connection.";
    default:
      return (error as { message?: string }).message || "Authentication failed. Please try again.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const ensureAuth = () => {
    if (!auth || !isFirebaseConfigured) {
      throw new Error(
        "Firebase Authentication is not configured. Please add your Firebase configuration to .env.local."
      );
    }
  };

  const signInWithGoogle = async () => {
    ensureAuth();
    if (!auth) return;
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    ensureAuth();
    if (!auth) return;
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string
  ) => {
    ensureAuth();
    if (!auth) return;

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    // Update display name
    if (name.trim()) {
      await updateProfile(userCredential.user, {
        displayName: name.trim(),
      });
    }

    // Optionally send verification email
    try {
      await sendEmailVerification(userCredential.user);
    } catch (vErr) {
      console.warn("Could not send verification email:", vErr);
    }
  };

  const resetPassword = async (email: string) => {
    ensureAuth();
    if (!auth) return;
    await sendPasswordResetEmail(auth, email.trim());
  };

  const sendVerificationEmail = async () => {
    if (!user) throw new Error("No user is currently signed in.");
    await sendEmailVerification(user);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        sendVerificationEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
