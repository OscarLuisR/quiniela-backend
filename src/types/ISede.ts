import type { Types } from "mongoose";

export interface ISede {
    _id?: Types.ObjectId;
    codigo: number;
    pais: string;
    ciudad: string;
    estadium: string;
    capacidad: number;
    estadium_url: string;
}
