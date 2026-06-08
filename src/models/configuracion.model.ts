import { model, type PaginateModel } from "mongoose";
import configuracionSchema from "../schemas/configuracion.schema.js";
import type { IConfiguracion } from "../types/IConfiguracion.js";

export const ConfiguracionModel = model<
    IConfiguracion,
    PaginateModel<IConfiguracion>
>("Configuracion", configuracionSchema);
