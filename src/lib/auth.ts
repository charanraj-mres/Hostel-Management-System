import { auth, db } from "@/config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (!userCredential.user.emailVerified) {
      throw new Error("Please verify your email before logging in");
    }
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signup(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Create user document
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      userType: "student",
      createdAt: new Date().toISOString(),
    });

    // Send verification email
    await sendEmailVerification(userCredential.user);

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function logout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
