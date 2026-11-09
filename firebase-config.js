// Public Firebase web-app configuration (not an administrator secret).
export const firebaseConfig = {
    apiKey: "AIzaSyB3_tnMbHLB1rJkj4KemHqD10lur2SFZ8I",
    authDomain: "saint-teklehaimanot-church.firebaseapp.com",
    projectId: "saint-teklehaimanot-church",
    storageBucket: "saint-teklehaimanot-church.firebasestorage.app",
    messagingSenderId: "781760679947",
    appId: "1:781760679947:web:36b8e10b2290a837a1f70e",
    measurementId: "G-KHECVPK7H1"
  };
export const configured = !Object.values(firebaseConfig).some(v => typeof v === 'string' && v.includes('REPLACE_WITH'));
