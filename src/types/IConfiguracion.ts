import type { Types } from "mongoose";

export interface IConfiguracion {
    _id?: Types.ObjectId;
    flagRoles: boolean;
    flagUsers: boolean;
    flagSedes: boolean;
    flagFases: boolean;
    flagGrupos: boolean;
    flagSelecciones: boolean;
    flagClasificacion: boolean;
    flagCalendario: boolean;
}
