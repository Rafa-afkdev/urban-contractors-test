import { Timestamp } from "firebase/firestore";

export interface Client {
    id?: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    estado: string;
    codigo_postal: string;
    // Información adicional
    total_proyectos?: number; // Cantidad de proyectos realizados
    ultimo_proyecto?: string; // Fecha del último proyecto
    created_at?: Timestamp | string;
    updated_at?: Timestamp | string;
}
