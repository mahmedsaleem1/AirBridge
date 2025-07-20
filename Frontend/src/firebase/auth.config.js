import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "./firebase"; // already initialized
import axios from "axios";

export const loginWithEmail = async (email, password) => {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCred.user.getIdToken();

  return idToken;
};

export const logout = async () => {
  await auth.signOut();
  console.log("Logged out successfully");
}

export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();

  // 🔐 Send token to backend
  await axios.post("http://localhost:8000/api/v1/auth/google-login", {}, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  return result.user;
};