import type { Types } from "mongoose";

export interface ICalendario {
    _id?: Types.ObjectId;
    nroPartido: number;
    idFase: Types.ObjectId;
    fecha: Date;
    golesEquipoA?: number | null; // 👈 permitir null
    golesEquipoB?: number | null; // 👈 permitir null
    statusJuego: number;
    idEquipoA?: Types.ObjectId | null; // 👈 permitir null
    idEquipoB?: Types.ObjectId | null; // 👈 permitir null
    idGanador?: Types.ObjectId | null; // 👈 permitir null
    idGrupo: Types.ObjectId;
    idSede: Types.ObjectId;
}
