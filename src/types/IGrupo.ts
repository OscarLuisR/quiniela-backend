import type { Types } from "mongoose";

export interface IGrupo {
    _id?: Types.ObjectId;
    nombre: string;
    idFase: Types.ObjectId;
    iso_fase: string;
    orden: number;
}
