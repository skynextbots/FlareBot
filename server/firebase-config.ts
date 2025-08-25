import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.GOOGLE_API_KEY || "",
  authDomain: "storage-f3b4a.firebaseapp.com",
  databaseURL: "https://storage-f3b4a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "storage-f3b4a",
  storageBucket: "storage-f3b4a.firebasestorage.app",
  messagingSenderId: "365892286012",
  appId: "1:365892286012:web:3918426de68627d1d53539",
  measurementId: "G-2Y4VYZNMPL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;