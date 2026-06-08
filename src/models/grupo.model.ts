import { model, type PaginateModel } from "mongoose";
import grupoSchema from "../schemas/grupo.schema.js";
import type { IGrupo } from "../types/IGrupo.js";

export const GrupoModel = model<IGrupo, PaginateModel<IGrupo>>(
    "Grupo",
    grupoSchema,
);
