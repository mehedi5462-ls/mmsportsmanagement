
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// M.M SPORTS Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBu9kr6xs3Zhvp1ZuKmgkfnO6aNOd1ZJ5A",
  authDomain: "mmsports-3a707.firebaseapp.com",
  projectId: "mmsports-3a707",
  storageBucket: "mmsports-3a707.firebasestorage.app",
  messagingSenderId: "778346742178",
  appId: "1:778346742178:web:4c5d5a61e467779b5c72fb",
  measurementId: "G-V0MMTQJD15"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);

export { app, analytics, db };
