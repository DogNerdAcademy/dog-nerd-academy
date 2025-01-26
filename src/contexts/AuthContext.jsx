import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? user.email : 'No user');
      setCurrentUser(user);
      if (user) {
        // Check if user document exists
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // Create user document if it doesn't exist
          await setDoc(userDocRef, {
            email: user.email,
            role: 'user', // default role
            createdAt: new Date()
          });
          setIsAdmin(false);
        } else {
          // Set admin status based on role
          const userData = userDoc.data();
          console.log("User data:", userData);
          setIsAdmin(userData.role === 'admin');
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth, db]);

  const login = async (email, password) => {
    console.log("Login attempt for:", email);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: 'user',
      createdAt: new Date()
    });
    
    return userCredential;
  };

  const logout = () => {
    return signOut(auth);
  };

  // Debug
  console.log("Current auth state:", { 
    userEmail: currentUser ? currentUser.email : null, 
    isAdmin 
  });

  const value = {
    currentUser,
    isAdmin,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;