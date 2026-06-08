import type { Types } from "mongoose";

export interface ISeleccion {
    _id?: Types.ObjectId;
    pais: string;
    codigo_iso: string;
    bandera_url?: string | null;
}
