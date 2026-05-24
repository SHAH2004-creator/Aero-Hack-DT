import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Detect if real Firebase attributes have been configured by the user
export const isFirebaseActive = !!(
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 5 &&
  firebaseConfig.projectId
);

let tempApp: any = null;
let tempDb: any = null;
let tempAuth: any = null;

if (isFirebaseActive) {
  try {
    tempApp = initializeApp(firebaseConfig);
    tempDb = getFirestore(tempApp, firebaseConfig?.firestoreDatabaseId || '(default)');
    tempAuth = getAuth(tempApp);
  } catch (err) {
    console.error("Error setting up active Firebase client SDK:", err);
  }
}

export const app = tempApp;
export const db = tempDb;
export const auth = tempAuth;

// Implement validation check as per Firebase Integration Skill criteria
async function testConnection() {
  if (!isFirebaseActive || !db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Please check your Firebase configuration or connectivity.");
    }
  }
}

testConnection();
