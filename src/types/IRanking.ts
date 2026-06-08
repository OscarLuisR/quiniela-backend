import type { Types } from "mongoose";
import type { IUsuarioRanking } from "./IUsuarioRanking";

export interface IRanking {
    _id?: Types.ObjectId;
    idUsuario: Types.ObjectId;
    puntosTotales: number;
    ranking: number;
    cantidadPartidos: number;
}
