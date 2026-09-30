
const firebaseConfig = {
  apiKey: "AIzaSyCTkGOR0509RDpqD_9bt9z8CkpXIWkguTY",
  authDomain: "eskimo-egypt.firebaseapp.com",
  projectId: "eskimo-egypt",
  storageBucket: "eskimo-egypt.firebasestorage.app",
  messagingSenderId: "868519761530",
  appId: "1:868519761530:web:2b8508d13bdfe3f4d08dc3",
  measurementId: "G-HXW616LFXD"
};

firebase.initializeApp(firebaseConfig);

window.eskimoDb = firebase.firestore();
window.eskimoAuth = firebase.auth();

window.ESKIMO_OWNER_UID = "1lOdi9CDI4R20sGdDnx13mtScyt2";