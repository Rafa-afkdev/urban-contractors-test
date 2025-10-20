/* eslint-disable @typescript-eslint/no-explicit-any */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from "firebase/auth" 
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, updateDoc, increment} from "firebase/firestore"
import { getStorage, uploadString, getDownloadURL, ref } from "firebase/storage";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyBwSf8p4VRmLtOA5s14-8upyv9rgTS37B0",
//     authDomain: "urbanconectiontest.firebaseapp.com",
//     projectId: "urbanconectiontest",
//     storageBucket: "urbanconectiontest.firebasestorage.app",
//     messagingSenderId: "29132479755",
//     appId: "1:29132479755:web:0b483fdcca40164ced560e"
// };
const firebaseConfig = {
  apiKey: "AIzaSyCXt4xzXTbYERtBPgqdpgdAKeRTqAhzIFM",
  authDomain: "urbancontractorsapp.firebaseapp.com",
  projectId: "urbancontractorsapp",
  storageBucket: "urbancontractorsapp.firebasestorage.app",
  messagingSenderId: "1056590290107",
  appId: "1:1056590290107:web:2fd3373333290f326f1d9e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


//TODO Las FUNCIONES DEL AUTH //

//?CREAR NUEVO USUARIO///
export const createUser = async(user: {email: string, password:string}) => {
    return await createUserWithEmailAndPassword(auth, user.email, user.password)
}

//??ENTRAR CON EMAIL & CONTRASEÑA//

export const signIn = async(user: {email: string, password: string}) => {
    return await signInWithEmailAndPassword(auth, user.email, user.password);
}

//?ACTUALIZAR USUARIO//
export const updateUser = (user: { displayName?: string | null; photoURL?: string | null; }) => {
    if(auth.currentUser) return updateProfile(auth.currentUser, user)
}

//?CERRAR SESION//
export const signOutAccount = () => {
    localStorage.removeItem('user');
    return auth.signOut();
}

//? RECUPERAR CONTRASEÑA//
export const sentResetEmail = (email: string) => {
    return sendPasswordResetEmail(auth, email)
}


//TODO FUNCIONES DATABASE///

//?INCREMENTAR O DECREMENTAR UN VALOR NUMERICO//
export { increment };

export const getCollection = async(colectionName: string, queryArray?:any[]) => {
    const ref = collection(db, colectionName);
    const q = queryArray ? query(ref, ...queryArray) : query(ref);
    return (await getDocs(q)).docs.map((doc) => ({id: doc.id, ...doc.data()}));

}

//?OBTENER UN DOCUMENTO DE UNA COLECCION//
export const getDocument = async (path:string) => {
    return (await getDoc(doc(db, path))).data();
}



//?SETEAR UN DOCUMENTO EN UNA COLECCION//
export const setDocument = (path:string, data:any) => {
    data.createAt = serverTimestamp();
    return setDoc(doc(db, path), data)
}

//? ACTUALIZAR UN DOCUMENTO EN UNA COLECCION//
export const updateDocument = (path:string, data:any) => {
    return updateDoc(doc(db, path), data)
}

//? ELIMINAR UN DOCUMENTO DE UNA COLECCION//
export const deleteDocument = (path:string) => {
    return deleteDoc(doc(db, path))
}

//? AGREGAR UN DOCUMENTO //////
export const addDocument = (path:string, data:any) => {
    data.createAt = serverTimestamp();
    return addDoc(collection(db, path), data)
}

//?TODO ===== FUNCIONES DEL STORAGE====== ///

//! SUBIR UN ARCHIVO CON FORMATO BASE64 & OBTENER SU URL//
export const uploadBase64 = async (path: string, base64: string) => {
    return uploadString(ref(storage, path), base64, 'data_url').then(() => {
        return getDownloadURL(ref(storage, path))
    })
}