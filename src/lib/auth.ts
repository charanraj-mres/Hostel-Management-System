import { auth, db } from "config/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Generate a random 4-digit ID
function generateUniqueId(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Check if ID already exists in the database
async function isIdUnique(id: string): Promise<boolean> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("uniqueId", "==", id));
  const snapshot = await getDocs(q);
  return snapshot.empty;
}

// Generate a unique ID that doesn't exist in the database
async function generateVerifiedUniqueId(): Promise<string> {
  let id = generateUniqueId();
  let isUnique = await isIdUnique(id);

  // Keep generating until we find a unique ID
  while (!isUnique) {
    id = generateUniqueId();
    isUnique = await isIdUnique(id);
  }

  return id;
}

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

export async function signup(
  name: string,
  email: string,
  Gender: string,
  password: string
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Generate a unique 4-digit ID
    const uniqueId = await generateVerifiedUniqueId();

    // Create user document
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name,
      email,
      Gender,
      uniqueId, // Store the unique ID
      userType: "student",
      status: "active",
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
