import { model, type PaginateModel } from "mongoose";
import pronosticoSchema from "../schemas/pronostico.schema.js";
import type { IPronostico } from "../types/IPronostico.js";

export const PronosticoModel = model<IPronostico, PaginateModel<IPronostico>>(
    "Pronostico",
    pronosticoSchema,
);
