// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import * as firebase from  'firebase/app';
import 'firebase/storage';
import 'firebase/direstore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAA2jFw74belfrddbkFnzsSib1SOPHq2dk",
  authDomain: "portfolio-45075.firebaseapp.com",
  projectId: "portfolio-45075",
  storageBucket: "portfolio-45075.appspot.com",
  messagingSenderId: "366399065042",
  appId: "1:366399065042:web:a1abc20ff72ab3f724960b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const projectStorage = firebase.storage();
const projectFirestore = firebase.firestore();



export {projectStorage, projectFirestore};


