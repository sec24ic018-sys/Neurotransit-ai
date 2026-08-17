// Firebase configuration and initialization
// This is a placeholder - configure with your Firebase credentials

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase Admin SDK if credentials provided
let db = null;

try {
  const admin = require('firebase-admin');
  
  if (process.env.FIREBASE_PROJECT_ID) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      // Add other required fields from your Firebase service account JSON
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    db = admin.database();
  }
} catch (error) {
  console.log('Firebase Admin SDK not initialized. Using in-memory storage.');
}

module.exports = {
  firebaseConfig,
  db
};
