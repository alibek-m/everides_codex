import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const normalizeEnvValue = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  const unquoted =
    trimmed.startsWith("\"") && trimmed.endsWith("\"")
      ? trimmed.slice(1, -1)
      : trimmed;

  if (!unquoted || unquoted.startsWith("REPLACE_WITH_")) {
    return undefined;
  }

  return unquoted;
};

const firebaseConfig = {
  apiKey: normalizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
  authDomain: normalizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: normalizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: normalizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: normalizeEnvValue(
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  ),
  appId: normalizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_APP_ID)
};

export const firebaseMissingConfig = [
  ["EXPO_PUBLIC_FIREBASE_API_KEY", firebaseConfig.apiKey],
  ["EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
  ["EXPO_PUBLIC_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
  ["EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", firebaseConfig.messagingSenderId],
  ["EXPO_PUBLIC_FIREBASE_APP_ID", firebaseConfig.appId]
]
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const isFirebaseConfigured = firebaseMissingConfig.length === 0;

let firebaseApp: firebase.app.App | null = null;
let firebaseAuth: firebase.auth.Auth | null = null;
let didLogFirebaseError = false;
let firebaseInitErrorMessage = "";

const logFirebaseInitError = (error: unknown) => {
  firebaseInitErrorMessage =
    error instanceof Error ? error.message : String(error ?? "Unknown Firebase error");

  if (didLogFirebaseError) {
    return;
  }

  didLogFirebaseError = true;
  console.warn("Firebase Auth initialization failed.", error);
};

const getFirebaseAppInstance = () => {
  if (!isFirebaseConfigured) {
    firebaseInitErrorMessage =
      firebaseMissingConfig.length > 0
        ? `Missing: ${firebaseMissingConfig.join(", ")}`
        : "Missing Firebase config.";

    if (__DEV__ && !didLogFirebaseError) {
      didLogFirebaseError = true;
      console.warn("Firebase config is incomplete.", firebaseInitErrorMessage);
    }

    return null;
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    firebaseApp =
      firebase.apps[0] ??
      firebase.initializeApp(firebaseConfig);
    return firebaseApp;
  } catch (error) {
    logFirebaseInitError(error);
    return null;
  }
};

const getFirebaseAuthInstance = () => {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const app = getFirebaseAppInstance();
  if (!app) {
    return null;
  }

  try {
    firebaseAuth = app.auth();
    return firebaseAuth;
  } catch (error) {
    logFirebaseInitError(error);
    return null;
  }
};

export const subscribeToAuth = (
  listener: (user: firebase.User | null) => void
) => {
  const auth = getFirebaseAuthInstance();

  if (!auth) {
    listener(null);
    return () => undefined;
  }

  return auth.onAuthStateChanged(listener);
};

export const signInWithFirebase = async (email: string, password: string) => {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    throw new Error(
      firebaseInitErrorMessage
        ? `Firebase is not configured. ${firebaseInitErrorMessage}`
        : "Firebase is not configured."
    );
  }

  return auth.signInWithEmailAndPassword(email, password);
};

export const signUpWithFirebase = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
) => {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    throw new Error(
      firebaseInitErrorMessage
        ? `Firebase is not configured. ${firebaseInitErrorMessage}`
        : "Firebase is not configured."
    );
  }

  const credential = await auth.createUserWithEmailAndPassword(email, password);
  await credential.user?.updateProfile({
    displayName: `${firstName} ${lastName}`.trim()
  });

  return credential;
};

export const signOutFirebase = async () => {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    return;
  }

  await auth.signOut();
};

export const getFirebaseToken = async () =>
  getFirebaseAuthInstance()?.currentUser?.getIdToken();
