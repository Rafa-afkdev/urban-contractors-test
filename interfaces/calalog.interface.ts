import { Timestamp } from "firebase/firestore";

export interface Catalog {
    id?: string;
    image?: string; // Mantener para compatibilidad hacia atrás
    images?: string[]; // Nueva propiedad para múltiples imágenes
    images_storage?: StorageImage[]; // Imágenes con path y url en Storage
    nombre: string;
    descripcion: string;
    precio: number;
    duracion_servicio?: string; // Duración del servicio (ej: "2 horas", "1 día")
    id_categoria: string;
    productos_requeridos?: CatalogoProductosRequeridos[];
    createdAt: Timestamp;
}

export interface CatalogoProductosRequeridos {
    nombre: string,
    descripcion: string,
    tipo_medida: string,
    cantidad?: number
}

export interface StorageImage {
    path: string;
    url: string;
}
