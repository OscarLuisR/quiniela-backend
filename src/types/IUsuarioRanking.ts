import type { Types } from "mongoose";
import type { IUsuarioStatus } from "./IUsuarioStatus";

export interface IUsuarioRanking {
    _id?: Types.ObjectId;
    nombre: string;
    email: string;
    status: IUsuarioStatus;
}
