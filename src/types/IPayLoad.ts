import type { Types } from "mongoose";

export interface IPayLoad {
    _id: Types.ObjectId;
    email: string;
    nombre: string;
    status: string;
    rol: string;
}
