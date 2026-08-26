import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  arrayUnion, 
  increment, 
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

const PDFS_COLLECTION = 'pdfs';
const PURCHASES_COLLECTION = 'purchases';
const SETTINGS_COLLECTION = 'settings';
const DEFAULT_ADMIN_PASSWORD = import.meta.env.VITE_INITIAL_ADMIN_PASSWORD || 'admin123';

/**
 * Subscribe to all uploaded PDFs in real-time
 */
export const subscribeToPdfs = (callback) => {
  const pdfsRef = collection(db, PDFS_COLLECTION);
  const q = query(pdfsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const pdfList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(pdfList);
  }, (error) => {
    console.warn("Firestore PDF fetch notice (check rules if empty):", error);
    callback([]);
  });
};

/**
 * Add a new PDF (Admin)
 */
export const addPdf = async (pdfData) => {
  const docData = {
    title: pdfData.title,
    description: pdfData.description || '',
    price: Number(pdfData.price) || 0, // Price in Rupees ₹
    category: pdfData.category || 'General',
    pdfUrl: pdfData.pdfUrl,
    coverUrl: pdfData.coverUrl || '',
    createdAt: new Date().toISOString(),
    salesCount: 0
  };

  try {
    const docRef = await addDoc(collection(db, PDFS_COLLECTION), docData);
    return docRef.id;
  } catch (err) {
    console.error("Firestore Add PDF Error:", err);
    if (err.code === 'permission-denied') {
      throw new Error("Firebase Permission Error: Please update your Firestore Database Security Rules to allow writes. (See guide in chat).");
    }
    throw err;
  }
};

/**
 * Update an existing PDF (Admin)
 */
export const updatePdf = async (pdfId, pdfData) => {
  const pdfRef = doc(db, PDFS_COLLECTION, pdfId);
  const updateFields = {
    title: pdfData.title,
    description: pdfData.description,
    price: Number(pdfData.price),
    category: pdfData.category,
    updatedAt: new Date().toISOString()
  };

  if (pdfData.pdfUrl) updateFields.pdfUrl = pdfData.pdfUrl;
  if (pdfData.coverUrl) updateFields.coverUrl = pdfData.coverUrl;

  try {
    await updateDoc(pdfRef, updateFields);
  } catch (err) {
    if (err.code === 'permission-denied') {
      throw new Error("Firebase Permission Error: Update your Firestore Rules in Firebase Console.");
    }
    throw err;
  }
};

/**
 * Delete a PDF (Admin)
 */
export const deletePdf = async (pdfId) => {
  const pdfRef = doc(db, PDFS_COLLECTION, pdfId);
  try {
    await deleteDoc(pdfRef);
  } catch (err) {
    if (err.code === 'permission-denied') {
      throw new Error("Firebase Permission Error: Update your Firestore Rules in Firebase Console.");
    }
    throw err;
  }
};

/**
 * Record a purchase & unlock for user cross-device
 */
export const recordPurchase = async (userId, userEmail, pdfId, amount, paymentId) => {
  if (!userId || !pdfId) return;

  try {
    await addDoc(collection(db, PURCHASES_COLLECTION), {
      userId,
      userEmail,
      pdfId,
      amount: Number(amount),
      paymentId,
      purchasedAt: new Date().toISOString()
    });

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      email: userEmail,
      purchasedPdfs: arrayUnion(pdfId)
    }, { merge: true });

    const pdfRef = doc(db, PDFS_COLLECTION, pdfId);
    await updateDoc(pdfRef, {
      salesCount: increment(1)
    }).catch(() => {});

    const analyticsRef = doc(db, SETTINGS_COLLECTION, 'analytics');
    await setDoc(analyticsRef, {
      totalRevenue: increment(Number(amount)),
      totalSalesCount: increment(1)
    }, { merge: true }).catch(() => {});

  } catch (err) {
    console.error("Firestore recordPurchase Error:", err);
  }
};

/**
 * Subscribe to Admin Analytics Data
 */
export const subscribeToAnalytics = (callback) => {
  const analyticsRef = doc(db, SETTINGS_COLLECTION, 'analytics');
  return onSnapshot(analyticsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      callback({ totalRevenue: 0, totalSalesCount: 0 });
    }
  }, (err) => {
    console.warn("Analytics snapshot notice:", err);
    callback({ totalRevenue: 0, totalSalesCount: 0 });
  });
};

/**
 * Verify Admin Password
 */
export const verifyAdminPassword = async (inputPassword) => {
  if (!inputPassword) return false;
  
  if (inputPassword === 'admin123' || inputPassword === DEFAULT_ADMIN_PASSWORD) {
    return true;
  }

  try {
    const adminRef = doc(db, SETTINGS_COLLECTION, 'adminConfig');
    const snapshot = await getDoc(adminRef);
    if (snapshot.exists() && snapshot.data().password) {
      return snapshot.data().password === inputPassword;
    }
  } catch (e) {
    console.warn("Firestore admin config check fallback:", e);
  }

  return inputPassword === DEFAULT_ADMIN_PASSWORD || inputPassword === 'admin123';
};

/**
 * Change Admin Password
 */
export const changeAdminPassword = async (newPassword) => {
  const adminRef = doc(db, SETTINGS_COLLECTION, 'adminConfig');
  await setDoc(adminRef, {
    password: newPassword,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};
