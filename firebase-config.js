<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyB3_tnMbHLB1rJkj4KemHqD10lur2SFZ8I",
    authDomain: "saint-teklehaimanot-church.firebaseapp.com",
    projectId: "saint-teklehaimanot-church",
    storageBucket: "saint-teklehaimanot-church.firebasestorage.app",
    messagingSenderId: "781760679947",
    appId: "1:781760679947:web:36b8e10b2290a837a1f70e",
    measurementId: "G-KHECVPK7H1"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>
