// lib/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth, db } from "config/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { user: userCredential.user };
  } catch (error: any) {
    return {
      error:
        error.message || "Failed to log in. Please check your credentials.",
    };
  }
};

export const signup = async (
  name: string,
  email: string,
  gender: string,
  password: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      gender,
      user_type: "user", // Default user type
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { user };
  } catch (error: any) {
    return {
      error: error.message || "Failed to create account. Please try again.",
    };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return {
      error: error.message || "Failed to send password reset email.",
    };
  }
};

export const logout = async () => {
  await signOut(auth);
  return { success: true };
};
