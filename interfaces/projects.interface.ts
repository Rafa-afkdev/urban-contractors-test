import { Timestamp } from "firebase/firestore";

export interface ProjectService {
    id_servicio: string;
    nombre_servicio: string;
    descripcion_servicio: string;
    precio_base: number;
    descripcion_trabajo?: string; // Ej: "Remodelación de sala"
    usa_pie_lineal: boolean;
    usa_pie_cuadrado: boolean;
    pie_lineal?: number;
    pie_cuadrado?: number;
    costo_mano_obra?: number;
    costo_material_por_pie?: number; // Costo de material por pie lineal/cuadrado (ej: $20 por pie)
    subtotal_servicio?: number;
    subtotal_materiales?: number; // Ahora será: costo_material_por_pie * medida
    total_servicio?: number;
    nota_servicio?: string;
}

export interface Project {
    id?: string;
    id_cita: string;
    cliente_id?: string; // ID del cliente en la colección clientes
    cliente_nombre: string;
    cliente_email: string;
    cliente_telefono: string;
    cliente_direccion: string;
    servicios: ProjectService[];
    status: "EN_PROCESO" | "COMPLETADO" | "CANCELADO";
    total_proyecto?: number;
    fecha_inicio?: Date | Timestamp;
    fecha_fin?: Date | Timestamp;
    notas?: string;
    trabajador_uid?: string;
    trabajador_nombre?: string;
    createdAt?: Timestamp | Date;
    updatedAt?: Timestamp | Date;
    created_at?: Timestamp | Date;
}
