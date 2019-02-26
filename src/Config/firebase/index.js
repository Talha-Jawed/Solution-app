import * as firebase from 'firebase'

var config = {
  apiKey: "AIzaSyDKw1zu1JfY34PqN7QhS9iwpVCTiundN4c",
  authDomain: "saylani-fyp.firebaseapp.com",
  databaseURL: "https://saylani-fyp.firebaseio.com",
  projectId: "saylani-fyp",
  storageBucket: "saylani-fyp.appspot.com",
  messagingSenderId: "705274981161"
  };
  firebase.initializeApp(config);
  
  export default firebase