import { Timestamp } from "firebase/firestore";

export interface Categorias {
    id?: string;
    nombre: string;
    descripcion: string;
    cantidad_servicios_asignados?: number;
    createdAt?: Timestamp;
}