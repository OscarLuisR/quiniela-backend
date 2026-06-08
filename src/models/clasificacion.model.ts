import { model, type PaginateModel } from "mongoose";
import clasificacionSchema from "../schemas/clasificacion.schema.js";
import type { IClasificacion } from "../types/IClasificacion.js";

export const ClasificacionModel = model<
    IClasificacion,
    PaginateModel<IClasificacion>
>("Clasificacion", clasificacionSchema);
