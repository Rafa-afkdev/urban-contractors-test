import { Timestamp } from "firebase/firestore";

export interface Catalog {
    id?: string;
    image?: string; // Mantener para compatibilidad hacia atrás
    images?: string[]; // Nueva propiedad para múltiples imágenes
    nombre: string;
    descripcion: string;
    precio: number;
    productos_requeridos?: CatalogoProductosRequeridos[];
    createdAt: Timestamp;
}

export interface CatalogoProductosRequeridos {
    nombre: string,
    descripcion: string,
    tipo_medida: string,
    cantidad?: number
}