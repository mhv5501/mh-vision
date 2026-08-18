// Firebase Cloud Firestore & Auth Service
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

// Production Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBF8O-5cuu_fwv4WDZW1bdpqW_bzIa8WyE",
  authDomain: "mh-vision-b44e4.firebaseapp.com",
  projectId: "mh-vision-b44e4",
  storageBucket: "mh-vision-b44e4.firebasestorage.app",
  messagingSenderId: "757458563335",
  appId: "1:757458563335:web:4a0639b80af92c1832d5a2"
};

// Initialize Firebase App & Services
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const PUBLICATIONS_COLLECTION = 'publications';

// Authenticate Admin Session (Anonymous Auth to satisfy request.auth != null)
export async function authenticateAdmin() {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.warn('Firebase anonymous auth notice:', error);
    return null;
  }
}

// Fetch all publications from Firestore
export async function fetchPublications() {
  try {
    const q = query(collection(db, PUBLICATIONS_COLLECTION));
    const snapshot = await getDocs(q);
    const docs = [];
    snapshot.forEach(docSnap => {
      docs.push({ id: docSnap.id, ...docSnap.data() });
    });
    return docs;
  } catch (error) {
    console.error('Error fetching publications from Firestore:', error);
    return [];
  }
}

// Subscribe to real-time updates from Firestore
export function subscribePublications(onUpdate) {
  try {
    const q = query(collection(db, PUBLICATIONS_COLLECTION));
    return onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach(docSnap => {
        docs.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(docs);
    }, (error) => {
      console.warn('Firestore snapshot subscription warning:', error);
    });
  } catch (error) {
    console.warn('Could not establish real-time snapshot:', error);
    return () => {};
  }
}

// Save a new publication to Firestore
export async function savePublicationToFirestore(pubData) {
  try {
    await authenticateAdmin();
    const docRef = doc(db, PUBLICATIONS_COLLECTION, pubData.id);
    const payload = {
      ...pubData,
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, payload);
    return { success: true };
  } catch (error) {
    console.error('Error saving publication to Firestore:', error);
    throw error;
  }
}

// Update existing publication in Firestore
export async function updatePublicationInFirestore(docId, updatedFields) {
  try {
    await authenticateAdmin();
    const docRef = doc(db, PUBLICATIONS_COLLECTION, docId);
    await updateDoc(docRef, {
      ...updatedFields,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating publication in Firestore:', error);
    throw error;
  }
}

// Delete publication from Firestore
export async function deletePublicationFromFirestore(docId) {
  try {
    await authenticateAdmin();
    const docRef = doc(db, PUBLICATIONS_COLLECTION, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting publication from Firestore:', error);
    throw error;
  }
}
