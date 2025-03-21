// lib/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "config/firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Check if email is verified
    if (!user.emailVerified) {
      return {
        error:
          "Please verify your email before logging in. Check your inbox for the verification link.",
        needsVerification: true,
        user,
      };
    }

    // Check if user exists in firestore and is active
    const q = query(
      collection(db, "users"),
      where("email", "==", email),
      where("status", "==", "active")
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await signOut(auth);
      return {
        error: "User account not found or inactive. Please contact support.",
      };
    }

    return { user: userCredential.user };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      error:
        error.code === "auth/invalid-credential"
          ? "Invalid email or password. Please try again."
          : error.message || "Failed to log in. Please check your credentials.",
    };
  }
};

export const signup = async (
  name: string,
  email: string,
  gender: string,
  password: string,
  userType = "student" // Default userType
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
      userType: userType,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Send email verification
    await sendEmailVerification(user);

    return {
      user,
      message:
        "Account created! Please check your email to verify your account before logging in.",
    };
  } catch (error: any) {
    console.error("Signup error:", error);
    return {
      error:
        error.code === "auth/email-already-in-use"
          ? "Email is already in use. Please use a different email or try logging in."
          : error.message || "Failed to create account. Please try again.",
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

export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { error: "No user is currently signed in." };
    }

    await sendEmailVerification(user);
    return {
      success: true,
      message: "Verification email has been sent. Please check your inbox.",
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to send verification email.",
    };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to log out.",
    };
  }
};

// Function to create users of different types (for admin use)
export const createUser = async (
  name: string,
  email: string,
  gender: string,
  password: string,
  userType: "warden" | "staff" | "student" | "parent"
) => {
  return signup(name, email, gender, password, userType);
};
