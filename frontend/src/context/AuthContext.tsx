"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "../lib/firebase";
import { SyncStatus, SyncUser } from "../types/sync";

// ── Types ────────────────────────────────────────────────────────────────────

interface AuthContextType {
  /** The current Firebase user, or null if not signed in. */
  user: SyncUser | null;
  /** Whether Firebase auth is ready (initial state resolved). */
  authReady: boolean;
  /**
   * Current sync mode.
   * - "local-only": not signed in, all data stays in localStorage
   * - "syncing" | "synced" | "error": signed in and cloud sync is active
   */
  syncStatus: SyncStatus;
  setSyncStatus: (status: SyncStatus) => void;
  /** Whether the user has explicitly disconnected from cloud sync. */
  isDisconnected: boolean;
  /** Sign in with Google popup. */
  signInWithGoogle: () => Promise<void>;
  /** Send a magic link to the provided email address. */
  signInWithEmail: (email: string) => Promise<void>;
  /** Signs out of Firebase. localStorage is always preserved. */
  signOut: () => Promise<void>;
  /**
   * Disconnect from cloud sync without signing out.
   * The user stays signed in to Firebase but sync is paused.
   * Local data is untouched.
   */
  disconnect: () => void;
  /** Re-enable cloud sync after disconnecting. */
  reconnect: () => void;
  /** Whether Firebase is configured (env vars are present). */
  firebaseConfigured: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DISCONNECT_KEY = "taskflow_sync_disconnected";

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SyncUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("local-only");
  const [isDisconnected, setIsDisconnected] = useState<boolean>(() => {
    // Check persisted disconnect preference
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DISCONNECT_KEY) === "true";
  });

  const firebaseConfigured = isFirebaseConfigured();

  // Listen to Firebase auth state changes
  useEffect(() => {
    if (!firebaseConfigured) {
      setAuthReady(true);
      return;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        // Only go to "synced" if not disconnected
        if (!isDisconnected) {
          setSyncStatus("synced");
        }
      } else {
        setUser(null);
        setSyncStatus("local-only");
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseConfigured]);

  const signInWithGoogle = useCallback(async () => {
    if (!firebaseConfigured) return;
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // Auth state listener above will update user + syncStatus
    setIsDisconnected(false);
    localStorage.removeItem(DISCONNECT_KEY);
  }, [firebaseConfigured]);

  const signInWithEmail = useCallback(
    async (email: string) => {
      if (!firebaseConfigured) return;
      const auth = getFirebaseAuth();
      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Store email locally so we can complete sign-in on the same device
      localStorage.setItem("taskflow_email_for_signin", email);
    },
    [firebaseConfigured]
  );

  const signOut = useCallback(async () => {
    if (!firebaseConfigured) return;
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
    // localStorage tasks are NEVER cleared on sign-out
    setSyncStatus("local-only");
  }, [firebaseConfigured]);

  const disconnect = useCallback(() => {
    setIsDisconnected(true);
    setSyncStatus("local-only");
    localStorage.setItem(DISCONNECT_KEY, "true");
  }, []);

  const reconnect = useCallback(() => {
    setIsDisconnected(false);
    localStorage.removeItem(DISCONNECT_KEY);
    if (user) {
      setSyncStatus("synced");
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        syncStatus,
        setSyncStatus,
        isDisconnected,
        signInWithGoogle,
        signInWithEmail,
        signOut,
        disconnect,
        reconnect,
        firebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
