import type { Types } from "mongoose";

export interface IClasificacion {
    _id?: Types.ObjectId;
    idFase: Types.ObjectId;
    idGrupo: Types.ObjectId;
    idSeleccion?: Types.ObjectId | null;
    posicion: number;
    juegos: number;
    puntos: number;
    ganados: number;
    perdidos: number;
    empatados: number;
    golesFavor: number;
    golesContra: number;
    diferenciaGoles: number;
    ranking: number;
}
