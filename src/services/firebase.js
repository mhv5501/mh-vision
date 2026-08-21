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
  where,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import { 
  getAuth, 
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

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

const googleProvider = new GoogleAuthProvider();
const PUBLICATIONS_COLLECTION = 'publications';
const PURCHASES_COLLECTION = 'user_purchases';
const APP_CONFIG_COLLECTION = 'app_config';

/**
 * Fetch App Configuration (Razorpay Gateway Keys) from Firestore
 */
export async function fetchAppConfig() {
  try {
    const docRef = doc(db, APP_CONFIG_COLLECTION, 'razorpay');
    const snapshot = await getDocs(query(collection(db, APP_CONFIG_COLLECTION)));
    let config = null;
    snapshot.forEach(d => {
      if (d.id === 'razorpay') {
        config = d.data();
      }
    });
    return config;
  } catch (error) {
    console.warn('Could not fetch app config from Firestore:', error);
    return null;
  }
}

/**
 * Save App Configuration (Razorpay Gateway Keys) to Firestore
 */
export async function saveAppConfig(configData) {
  try {
    const docRef = doc(db, APP_CONFIG_COLLECTION, 'razorpay');
    await setDoc(docRef, {
      ...configData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.warn('Could not save app config to Firestore:', error);
    return { success: false };
  }
}

// Authenticate Admin Session
export async function authenticateAdmin() {
  try {
    if (!auth.currentUser) {
      const userCredential = await signInAnonymously(auth);
      return userCredential.user;
    }
    return auth.currentUser;
  } catch (error) {
    console.warn('Firebase auth note:', error);
    return null;
  }
}

// -------------------------------------------------------------
// USER AUTHENTICATION METHODS (Google & Email/Password)
// -------------------------------------------------------------

/**
 * 1-Click Google Sign-In via Popup
 */
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email.split('@')[0],
        photoURL: result.user.photoURL || null
      }
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    let message = error.message;
    if (error.code === 'auth/popup-closed-by-user') {
      message = 'Sign-in window was closed.';
    } else if (error.code === 'auth/configuration-not-found') {
      message = 'Google Sign-In is not enabled yet in Firebase Console. Please turn it ON under Authentication > Sign-in method.';
    } else if (error.code === 'auth/unauthorized-domain') {
      message = 'This domain is not authorized in Firebase Console.';
    }
    throw new Error(message);
  }
}

/**
 * Sign In with Email & Password
 */
export async function loginWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email.split('@')[0],
        photoURL: result.user.photoURL || null
      }
    };
  } catch (error) {
    console.error('Email Sign-In Error:', error);
    let message = 'Invalid email or password.';
    if (error.code === 'auth/configuration-not-found') {
      message = 'Email/Password is not enabled yet in Firebase Console. Please turn it ON under Authentication > Sign-in method.';
    } else if (error.code === 'auth/user-not-found') {
      message = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    }
    throw new Error(message);
  }
}

/**
 * Register New Account with Email & Password
 */
export async function registerWithEmail(email, password, displayName = '') {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && result.user) {
      try {
        await updateProfile(result.user, { displayName });
      } catch (profileErr) {
        console.warn('Profile name update note:', profileErr);
      }
    }
    return {
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: displayName || result.user.email.split('@')[0],
        photoURL: result.user.photoURL || null
      }
    };
  } catch (error) {
    console.error('Registration Error:', error);
    let message = 'Could not create account.';
    if (error.code === 'auth/configuration-not-found') {
      message = 'Email/Password is not enabled yet in Firebase Console. Please turn it ON under Authentication > Sign-in method.';
    } else if (error.code === 'auth/email-already-in-use') {
      message = 'An account with this email already exists. Please sign in.';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    }
    throw new Error(message);
  }
}

/**
 * Sign Out Current User
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

/**
 * Listen to Global Auth State Changes
 */
export function listenToAuthChanges(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user && !user.isAnonymous) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Scholar'),
        photoURL: user.photoURL || null
      });
    } else {
      callback(null);
    }
  });
}

// -------------------------------------------------------------
// USER PURCHASES & CLOUD LIBRARY SYNC
// -------------------------------------------------------------

/**
 * Fetch all verified purchased publication IDs for a user (Fail-proof JS matching)
 */
export async function fetchUserPurchases(uid, email) {
  if (!uid && !email) return [];
  const unlockedDocIds = new Set();
  const cleanEmail = email ? email.toLowerCase().trim() : '';

  try {
    const purchasesRef = collection(db, PURCHASES_COLLECTION);
    const snapshot = await getDocs(purchasesRef);
    
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const matchUid = uid && data.userId && data.userId === uid;
      const matchEmail = cleanEmail && data.userEmail && data.userEmail.toLowerCase().trim() === cleanEmail;
      const matchEmailLower = cleanEmail && data.userEmailLower && data.userEmailLower === cleanEmail;
      
      if ((matchUid || matchEmail || matchEmailLower) && data.docId) {
        unlockedDocIds.add(data.docId);
      }
    });

    return Array.from(unlockedDocIds);
  } catch (error) {
    console.warn('Could not fetch cloud purchases:', error);
    return Array.from(unlockedDocIds);
  }
}

/**
 * Subscribe to Real-Time User Purchases across devices (Phone, Laptop, Tablet)
 */
export function subscribeUserPurchases(uid, email, onUpdate) {
  if (!uid && !email) return () => {};
  const cleanEmail = email ? email.toLowerCase().trim() : '';
  
  try {
    const purchasesRef = collection(db, PURCHASES_COLLECTION);
    return onSnapshot(purchasesRef, (snapshot) => {
      const unlockedDocIds = new Set();
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const matchUid = uid && data.userId && data.userId === uid;
        const matchEmail = cleanEmail && data.userEmail && data.userEmail.toLowerCase().trim() === cleanEmail;
        const matchEmailLower = cleanEmail && data.userEmailLower && data.userEmailLower === cleanEmail;

        if ((matchUid || matchEmail || matchEmailLower) && data.docId) {
          unlockedDocIds.add(data.docId);
        }
      });
      onUpdate(Array.from(unlockedDocIds));
    }, (err) => {
      console.warn('Real-time purchases snapshot warning:', err);
    });
  } catch (err) {
    console.warn('Could not subscribe to purchases:', err);
    return () => {};
  }
}

/**
 * Migrate/Sync local browser purchases to Cloud Firestore for active user
 */
export async function syncLocalPurchasesToCloud(uid, email, localDocIds) {
  if (!uid || !email || !Array.isArray(localDocIds) || localDocIds.length === 0) return;
  
  try {
    const existingCloudPurchases = await fetchUserPurchases(uid, email);
    for (const docId of localDocIds) {
      if (!existingCloudPurchases.includes(docId)) {
        await savePurchaseReceipt({
          docId: docId,
          title: 'Purchased Publication',
          price: 0,
          paymentId: 'SYNCED_LOCAL_PURCHASE',
          gateway: 'sync',
          userId: uid,
          userEmail: email
        });
      }
    }
  } catch (err) {
    console.warn('Local purchase sync warning:', err);
  }
}

/**
 * Save purchase receipt permanently to Firestore
 */
export async function savePurchaseReceipt(receiptData) {
  try {
    const receiptId = 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const docRef = doc(db, PURCHASES_COLLECTION, receiptId);
    const cleanEmail = receiptData.userEmail ? receiptData.userEmail.toLowerCase().trim() : '';

    const payload = JSON.parse(JSON.stringify({
      docId: receiptData.docId || '',
      title: receiptData.title || '',
      price: typeof receiptData.price === 'number' ? receiptData.price : 0,
      paymentId: receiptData.paymentId || 'RAZORPAY_PAYMENT',
      gateway: receiptData.gateway || 'razorpay',
      userId: receiptData.userId || '',
      userEmail: receiptData.userEmail || '',
      userEmailLower: cleanEmail,
      timestamp: new Date().toISOString()
    }));

    await setDoc(docRef, payload);
    return { success: true, receiptId };
  } catch (error) {
    console.error('Could not save purchase receipt to Firestore:', error);
    return { success: false };
  }
}

// -------------------------------------------------------------
// PUBLICATIONS CRUD
// -------------------------------------------------------------

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
    console.warn('Firestore fetch warning:', error);
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

// Save a new publication to Firestore (Direct & Fail-Proof Write)
export async function savePublicationToFirestore(pubData) {
  try {
    const docRef = doc(db, PUBLICATIONS_COLLECTION, pubData.id);
    
    // Remove undefined values to prevent Firestore rejection
    const cleanPayload = JSON.parse(JSON.stringify({
      ...pubData,
      updatedAt: new Date().toISOString()
    }));

    await setDoc(docRef, cleanPayload);
    return { success: true };
  } catch (error) {
    console.warn('Direct publication save notice, trying auth fallback:', error);
    try {
      await authenticateAdmin();
      const docRef = doc(db, PUBLICATIONS_COLLECTION, pubData.id);
      const cleanPayload = JSON.parse(JSON.stringify({
        ...pubData,
        updatedAt: new Date().toISOString()
      }));
      await setDoc(docRef, cleanPayload);
      return { success: true };
    } catch (e2) {
      console.error('Publication save error:', e2);
      return { success: false };
    }
  }
}

/**
 * Auto-sync any local publications uploaded on laptop to Cloud Firestore
 */
export async function syncLocalPublicationsToCloud(localDocs) {
  if (!Array.isArray(localDocs) || localDocs.length === 0) return;
  try {
    const cloudDocs = await fetchPublications();
    const cloudIds = new Set(cloudDocs.map(d => d.id));

    for (const docItem of localDocs) {
      if (!cloudIds.has(docItem.id)) {
        await savePublicationToFirestore(docItem);
      }
    }
  } catch (err) {
    console.warn('Local publication sync warning:', err);
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
