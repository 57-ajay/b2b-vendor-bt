"use client";
/**
 * Firebase Web SDK singletons for the vendor panel + customer intake.
 *
 * Next 16 removed `publicRuntimeConfig`, so client config must be inlined via
 * `NEXT_PUBLIC_*` env (see `.env.local.example`). Initialization is lazy and
 * guarded so the app still builds/loads when env is absent (CI, demos): callers
 * either check `isFirebaseConfigured` or go through the service factory, which
 * falls back to the in-memory mock when Firebase is not configured.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getFunctions,
  connectFunctionsEmulator,
  type Functions,
} from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Cloud Functions region for callables (India deployments use `asia-south1`). */
export const FUNCTIONS_REGION =
  process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || "us-central1";

/** True when the minimum web config (apiKey + projectId) is present. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

const useEmulators = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "1";

let _app: FirebaseApp | undefined;

function ensureApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* (see .env.local.example).",
    );
  }
  if (!_app) {
    const fresh = getApps().length === 0;
    _app = fresh ? initializeApp(firebaseConfig) : getApp();
    // Wire emulators exactly once, on first init, in the browser only.
    if (fresh && useEmulators && typeof window !== "undefined") {
      connectAuthEmulator(getAuth(_app), "http://127.0.0.1:9099", {
        disableWarnings: true,
      });
      connectFirestoreEmulator(getFirestore(_app), "127.0.0.1", 8080);
      connectFunctionsEmulator(
        getFunctions(_app, FUNCTIONS_REGION),
        "127.0.0.1",
        5001,
      );
    }
  }
  return _app;
}

export const firebaseAuth = (): Auth => getAuth(ensureApp());
export const firebaseDb = (): Firestore => getFirestore(ensureApp());
export const firebaseFunctions = (): Functions =>
  getFunctions(ensureApp(), FUNCTIONS_REGION);
