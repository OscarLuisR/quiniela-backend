import { model, type PaginateModel } from "mongoose";
import seleccionSchema from "../schemas/seleccion.schema.js";
import type { ISeleccion } from "../types/ISeleccion.js";

export const SeleccionModel = model<ISeleccion, PaginateModel<ISeleccion>>(
    "Selecciones",
    seleccionSchema,
);
