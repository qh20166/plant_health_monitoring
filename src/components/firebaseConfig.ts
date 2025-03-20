import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
const firebaseConfig = {
  apiKey: "AIzaSyCMDHBWn2eN_vtwQXMr4WaEdDO1EdCmpkE",
  authDomain: "plant-health-monitoring-ab4de.firebaseapp.com",
  projectId: "plant-health-monitoring-ab4de",
  storageBucket: "plant-health-monitoring-ab4de.firebasestorage.app",
  messagingSenderId: "551837516519",
  appId: "1:551837516519:web:c24d6acafad1d9256f1842"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});

const db = getFirestore(app); 
export { auth, provider, db };
