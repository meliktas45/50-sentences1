import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// DİKKAT: Aşağıdaki değerleri Firebase Konsolu > Project Settings kısmından alıp değiştirmelisin.
const firebaseConfig = {
  apiKey: "AIzaSyDQvEdV8_DIOYstA5FxK_s9Zo2r4_1l9jc",
  authDomain: "fifty-sentences-app.firebaseapp.com",
  projectId: "fifty-sentences-app",
  storageBucket: "fifty-sentences-app.firebasestorage.app",
  messagingSenderId: "1000474020258",
  appId: "1:1000474020258:web:bd7462a2a098453be70afb"
};

// Uygulamayı başlat
const app = initializeApp(firebaseConfig);

// Servisleri dışarı aktar (App.jsx içinde kullanmak için)
export const db = getFirestore(app);
export const auth = getAuth(app);