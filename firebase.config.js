// firebase.config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCXQZFYZfq4um2FiGn8EVzzBbzu64S6TqA",
  authDomain: "signin-azeem.firebaseapp.com",
  projectId: "signin-azeem",
  storageBucket: "signin-azeem.firebasestorage.app",
  messagingSenderId: "761268740990",
  appId: "1:761268740990:web:45df375c4fd2332133492f",
  measurementId: "G-23PRYF0YR6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);







// QR Code management functions
export const updateActiveQRUrl = async (timestamp) => {
  try {
    await setDoc(doc(db, "system-config", "qr-config"), {
      activeTimestamp: timestamp,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating QR URL:", error);
    return { success: false, error };
  }
};



// Your existing exports
export {
  db,
  auth,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
};

// Helper function to add a sign-in record
export const addSignInRecord = async (data) => {
  try {
    const docRef = await addDoc(collection(db, "incident-reports"), {
      ...data,
      timestamp: serverTimestamp(),
    });
    return { success: true, docRef };
  } catch (error) {
    console.error("Error adding record:", error);
    return { success: false, error };
  }
};


