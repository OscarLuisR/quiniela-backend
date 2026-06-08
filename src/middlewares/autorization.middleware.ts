import type { NextFunction, Request, Response } from "express";
import type { IAuthenticatedRequest } from "../types/IAuthenticatedRequest.js";
import { AppError } from "../utils/appError.js";

export const verificaAutorizacionAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const authReq = req as IAuthenticatedRequest;

    if (!authReq.rol || typeof authReq.rol !== "string") {
        throw new AppError(
            "No se pudo verificar el rol del usuario.",
            403,
            "middleware:verificaAutorizacionAdmin",
        );
    }

    if (!authReq.rol.toLowerCase().includes("admin")) {
        throw new AppError(
            "No tienes permisos para acceder a este recurso.",
            403,
            "middleware:verificaAutorizacionAdmin",
        );
    }

    next();
};
