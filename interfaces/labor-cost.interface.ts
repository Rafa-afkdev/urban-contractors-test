import { Timestamp } from "firebase/firestore";

export interface LaborCost {
    id?: string;
    id_servicio: string;
    nombre_servicio?: string; // Para mostrar en la UI
    costo_mano_obra: number;
    descripcion?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}
