import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';
import api from './api';

export const firebaseRegister = async (email, password, full_name, role = 'CRA') => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase not configured. Please add Firebase credentials to .env file.');
  }

  const auth = getFirebaseAuth();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const idToken = await user.getIdToken();

  const userData = {
    firebase_uid: user.uid,
    email: user.email,
    full_name,
    role
  };

  try {
    const response = await api.post('/auth/firebase-register', userData);
    return { user: response.data.user, token: idToken };
  } catch (error) {
    await user.delete();
    throw error;
  }
};

export const firebaseLogin = async (email, password) => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase not configured. Please add Firebase credentials to .env file.');
  }

  const auth = getFirebaseAuth();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const idToken = await user.getIdToken();

  const response = await api.post('/auth/firebase-login', {
    firebase_uid: user.uid
  });

  return { user: response.data.user, token: idToken };
};

export const firebaseGoogleLogin = async () => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase not configured. Please add Firebase credentials to .env file.');
  }

  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const idToken = await user.getIdToken();

    // Check if user exists in our backend, if not try to register or handle it
    // For now, we'll try login first. Ideally backend handles "login or create" for social auth.
    try {
      const response = await api.post('/auth/firebase-login', {
        firebase_uid: user.uid
      });
      return { user: response.data.user, token: idToken };
    } catch (loginError) {
      // If login fails, maybe user doesn't exist? Try registering
      // Use full name from Google profile or default
      const fullName = user.displayName || user.email.split('@')[0];

      // Note: We might not have a clean way to "register" via google on backend 
      // if /auth/firebase-register requires a password or logic.
      // Assuming backend can handle registration via token or we call register endpoint.
      // However, /auth/firebase-register in server.py takes {email, full_name, role, firebase_uid}
      // Let's try to register.

      const registerResponse = await api.post('/auth/firebase-register', {
        firebase_uid: user.uid,
        email: user.email,
        full_name: fullName,
        role: 'CRA' // Default role for social login
      });
      return { user: registerResponse.data.user, token: idToken };
    }
  } catch (error) {
    console.error("Google Sign In Error", error);
    throw error;
  }
};

export const firebaseLogout = async () => {
  if (!isFirebaseConfigured()) {
    return;
  }

  const auth = getFirebaseAuth();
  await signOut(auth);
};

export const firebaseAuthStateListener = (callback) => {
  if (!isFirebaseConfigured()) {
    return () => { };
  }

  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const idToken = await firebaseUser.getIdToken();
      try {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        callback(response.data, idToken);
      } catch (error) {
        console.error('Error fetching user data:', error);
        callback(null, null);
      }
    } else {
      callback(null, null);
    }
  });
};