import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
  apiKey: "AIzaSyAk5-6wb1CLIMTqEJfN6JH0t5IT8lOXs-c",
  authDomain: "hackenza-f857c.firebaseapp.com",
  projectId: "hackenza-f857c",
  storageBucket: "hackenza-f857c.firebasestorage.app",
  messagingSenderId: "272998732124",
  appId: "1:272998732124:web:1b87c006748098fc523199",
  measurementId: "G-QMCWHLVW3K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("User:", result.user);
  } catch (error) {
    throw error;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

export { auth, signInWithGoogle, logout };
