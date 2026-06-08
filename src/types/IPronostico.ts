import type { Types } from "mongoose";

export interface IPronostico {
    _id?: Types.ObjectId;
    idUsuario: Types.ObjectId;
    idFase: Types.ObjectId;
    idCalendario: Types.ObjectId;
    golesEquipoA?: number | null; // 👈 permitir null
    golesEquipoB?: number | null; // 👈 permitir null
    idGanador?: Types.ObjectId | null; // 👈 permitir null
    puntosLogro: number;
    puntosMarcadorA: number;
    puntosMarcadorB: number;
    puntosMarcadorExacto: number;
    puntosTotales: number;
    aceptaPronostico: boolean;
}
