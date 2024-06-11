// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "seacow-blog.firebaseapp.com",
  projectId: "seacow-blog",
  storageBucket: "seacow-blog.appspot.com",
  messagingSenderId: "552266407065",
  appId: "1:552266407065:web:54b4586ca7cdcb6da3ac08",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
