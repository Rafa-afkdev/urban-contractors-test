import { Timestamp } from "firebase/firestore";

export interface Employees {
    //TODO DATOS PRINCIPALES
    id?: string;
    imagen?: string;
    cedula: string;
    nombre: string;
    apellido: string;
//TODO DATOS DE CONTACTO
    correo: string;
    contraseña: string; // Opcional porque no se almacena en Firestore
    telefono: string;
    // TODO DATOS DE DIRECCION
    direccion: string;
    ciudad: string;
    estado: string;
    codigo_postal: string;
    // TODO DATOS DE USUARIO
    uid?: string; // UID de Firebase Authentication
    rol: string;
    status: string;
    created_at: Timestamp;
    updated_at?: Timestamp;
}