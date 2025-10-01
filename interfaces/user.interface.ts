import { Timestamp } from "firebase/firestore";

export interface User {
    uid: string,
    name: string,
    email: string,
    password: string,
    image?: string,
    createdAt: Timestamp;
    rol: string;

}