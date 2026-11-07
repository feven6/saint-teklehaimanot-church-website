// Replace the placeholder values with the Web app configuration from your Firebase project.
// This is a PUBLIC client configuration, not an administrator secret or service account key.
export const firebaseConfig = {
  apiKey: "REPLACE_WITH_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_PROJECT_ID.firebaseapp.com",
  projectId: "REPLACE_WITH_PROJECT_ID",
  storageBucket: "REPLACE_WITH_STORAGE_BUCKET",
  appId: "REPLACE_WITH_FIREBASE_APP_ID"
};
export const configured = !Object.values(firebaseConfig).some(v => v.includes("REPLACE_WITH"));
