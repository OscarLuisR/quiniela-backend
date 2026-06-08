import { model, type PaginateModel } from "mongoose";
import usuarioSchema from "../schemas/usuario.schema.js";
import type { IUsuario } from "../types/IUsuario.js";

export const UsuarioModel = model<IUsuario, PaginateModel<IUsuario>>(
    "Usuario",
    usuarioSchema,
);
