import { Timestamp } from "firebase/firestore";

export interface Scheludes {
    id?: string,
    nombre: string,
    apellido: string,
    direccion: string,
    direccion2: string,
    ciudad: string,
    estado: string,
    codigo_postal: string,
    email: string,
    telefono: string,
    fecha: Date;
    hora: string,
    notas: string,
    status: string;
    // agendada_para: string,
    createdAt: Timestamp;
}