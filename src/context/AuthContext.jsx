import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userPurchases, setUserPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Register user
  const signup = async (email, password, displayName) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(res.user, { displayName });
    }
    // Save user doc in Firestore
    await setDoc(doc(db, 'users', res.user.uid), {
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    }, { merge: true });
    return res;
  };

  // Login user
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google Login
  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    await setDoc(doc(db, 'users', res.user.uid), {
      email: res.user.email,
      displayName: res.user.displayName,
      createdAt: new Date().toISOString()
    }, { merge: true });
    return res;
  };

  // Logout
  const logout = () => {
    setUserPurchases([]);
    return signOut(auth);
  };

  // Listen to Auth State and Real-time User Purchases from Firestore
  useEffect(() => {
    let unsubscribePurchases = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // Real-time listener for user purchases
        const userRef = doc(db, 'users', user.uid);
        unsubscribePurchases = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setUserPurchases(data.purchasedPdfs || []);
          } else {
            setUserPurchases([]);
          }
        }, (error) => {
          console.warn("Firestore purchase listener notice:", error);
        });
      } else {
        setUserPurchases([]);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribePurchases();
    };
  }, []);

  const isPdfUnlocked = (pdfId, isFree = false) => {
    if (isFree) return true;
    if (!currentUser) return false;
    return userPurchases.includes(pdfId);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      userPurchases,
      signup,
      login,
      loginWithGoogle,
      logout,
      isPdfUnlocked,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
