import { model, type PaginateModel } from "mongoose";
import faseSchema from "../schemas/fase.schema.js";
import type { IFase } from "../types/IFase.js";

export const FaseModel = model<IFase, PaginateModel<IFase>>("Fase", faseSchema);
