"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "config/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

type UserData = {
  name: string;
  email: string;
  gender: string;
  userType: "warden" | "staff" | "student" | "parent";
  status: string;
};

type AuthContextType = {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  userType: string | null;
  isEmailVerified: boolean;
  logout: () => Promise<{ success: boolean; error?: any }>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  userType: null,
  isEmailVerified: false,
  logout: async () => ({ success: false }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        setIsEmailVerified(user.emailVerified);

        // Query Firestore for user data
        try {
          const q = query(
            collection(db, "users"),
            where("email", "==", user.email),
            where("status", "==", "active")
          );

          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const data = userDoc.data() as UserData;
            setUserData(data);
            setUserType(data.userType);
          } else {
            console.log("No active user found with this email");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // Reset user data when logged out
        setUserData(null);
        setUserType(null);
        setIsEmailVerified(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      return { success: false, error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        userType,
        isEmailVerified,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
