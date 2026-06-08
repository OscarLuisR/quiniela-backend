import { model, type PaginateModel } from "mongoose";
import rolSchema from "../schemas/rol.schema.js";
import type { IRol } from "../types/IRol.js";

export const RolModel = model<IRol, PaginateModel<IRol>>("Rol", rolSchema);
