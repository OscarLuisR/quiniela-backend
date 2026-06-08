import type { Types } from "mongoose";
import type { IUsuarioStatus } from "./IUsuarioStatus";

export interface IUsuario {
    _id?: Types.ObjectId;
    nombre: string;
    email: string;
    status: IUsuarioStatus;
    password: string;
    idRol: Types.ObjectId;
}
