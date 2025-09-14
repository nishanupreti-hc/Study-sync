import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDN8fBNkIyNd_vnTN2oSpDcBtJjRmDB0b0",
  authDomain: "study-info-d0ad9.firebaseapp.com",
  projectId: "study-info-d0ad9",
  storageBucket: "study-info-d0ad9.firebasestorage.app",
  messagingSenderId: "830619960013",
  appId: "1:830619960013:web:your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
