import { model, type PaginateModel } from "mongoose";
import sedeSchema from "../schemas/sede.schema.js";
import type { ISede } from "../types/ISede.js";

export const SedeModel = model<ISede, PaginateModel<ISede>>("Sede", sedeSchema);
