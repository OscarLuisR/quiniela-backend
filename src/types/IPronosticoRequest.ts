import type { Types } from "mongoose";

export interface IPronosticoRequest {
    _id: Types.ObjectId;
    golesEquipoA?: number | null; // 👈 permitir null
    golesEquipoB?: number | null; // 👈 permitir null
    idGanador?: Types.ObjectId | null; // 👈 permitir null
}
