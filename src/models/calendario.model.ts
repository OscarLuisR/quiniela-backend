import { model, type PaginateModel } from "mongoose";
import calendarioSchema from "../schemas/calendario.schema.js";
import type { ICalendario } from "../types/ICalendario.js";

export const CalendarioModel = model<ICalendario, PaginateModel<ICalendario>>(
    "Calendario",
    calendarioSchema,
);
