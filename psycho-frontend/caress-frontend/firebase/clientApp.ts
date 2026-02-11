import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyAv1bXf7EGUSQQeusO62MN8QT0f8TYLmFM",
	authDomain: "psycho-app-bc701.firebaseapp.com",
	projectId: "psycho-app-bc701",
	storageBucket: "psycho-app-bc701.firebasestorage.app",
	messagingSenderId: "988174896170",
	appId: "1:988174896170:web:ff366f2778148bbce2c753"
  };

if(!firebase.apps.length) {
	firebase.initializeApp(firebaseConfig)
}

export default firebase;