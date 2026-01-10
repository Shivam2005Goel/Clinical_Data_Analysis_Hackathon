import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
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

  const response = await api.post(
    '/auth/firebase-login',
    {},
    { headers: { Authorization: `Bearer ${idToken}` } }
  );

  return { user: response.data.user, token: idToken };
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
    return () => {};
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