import type { Types } from "mongoose";

export interface IFase {
    _id?: Types.ObjectId;
    nombre: string;
    iso_fase: string;
    orden: number;
    faseAbierta: boolean;
}
