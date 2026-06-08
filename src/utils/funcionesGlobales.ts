import {
    type NextFunction,
    type Request,
    type Response,
    type CookieOptions,
} from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import type { IRol } from "../types/IRol.js";
import type { IPayLoad } from "../types/IPayLoad.js";
import type { IOptionsToken } from "../types/IOptionsToken.js";
import type { IDecodeToken } from "../types/IDecodeToken.js";
import { RolModel } from "../models/rol.model.js";
import { AppError } from "../utils/appError.js";

// ? LISTO - 20-06-2025
export async function encriptarPassword(password: string, location: string) {
    try {
        const salt = await bcryptjs.genSaltSync(10);

        return await bcryptjs.hashSync(password.toString(), salt);
    } catch (error: any) {
        if (error instanceof AppError) {
            throw error; // ✅ ya tiene statusCode y location
        }

        throw new AppError(
            error instanceof Error ? error.message.trim() : "Error desconocido",
            500,
            location,
        );
    }
}

// ? LISTO - 05-11-2025;
export async function buscaIdRol(id: string, location: string): Promise<IRol> {
    try {
        const findRol = await RolModel.findById(id);

        if (!findRol) {
            throw new AppError(
                "El Id del Rol no existe en la BD",
                404,
                location,
            );
        }

        return findRol;
    } catch (error: any) {
        if (error instanceof AppError) {
            throw error; // ✅ ya tiene statusCode y location
        }

        throw new AppError(
            error instanceof Error ? error.message.trim() : "Error desconocido",
            500,
            location,
        );
    }
}

// ? LISTO - 20-06-2025
export function ValidaDatos(
    req: Request,
    res: Response,
    next: NextFunction,
    location: string,
) {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        const firstError = errors.array()[0];

        throw new AppError(firstError.msg.trim(), 400, location);
    }
}

export async function compararPassword(
    passwordBody: string,
    passwordDb: string,
    location: string,
): Promise<boolean> {
    try {
        return await bcryptjs.compareSync(
            passwordBody.toString(),
            passwordDb.toString(),
        );
    } catch (error: any) {
        if (error instanceof AppError) {
            throw error; // ✅ ya tiene statusCode y location
        }

        throw new AppError(
            error instanceof Error ? error.message.trim() : "Error desconocido",
            500,
            location,
        );
    }
}

// ? LISTO - 20-06-2025
export async function GeneraToken(
    payLoad: IPayLoad,
    options: IOptionsToken,
    location: string,
) {
    try {
        // Genera el TOKEN
        const token = await jwt.sign(payLoad, options.secret, {
            expiresIn: "1h", // TODO: Ver como pasar el expiresIn como number o string
        });

        return token;
    } catch (error: any) {
        if (error instanceof AppError) {
            throw error; // ✅ ya tiene statusCode y location
        }

        throw new AppError(
            error instanceof Error ? error.message.trim() : "Error desconocido",
            500,
            location,
        );
    }
}

export const limpiarCookiesAutorizacion = (res: Response) => {
    const isProd = process.env.MODE_ENV === "production";

    // Centralizamos la configuración para que coincida exactamente
    // con cómo se crearon (requisito de los navegadores para poder borrarlas)
    const opciones: CookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
    };

    res.clearCookie("access_token", opciones);
    res.clearCookie("refresh_token", opciones);
};

/**
 * Crea un documento en la colección si no existe previamente.
 * @param model - El modelo de Mongoose (ej. RolModel, UsuarioModel).
 * @param filter - Objeto para buscar si ya existe (ej. { name: "Admin" }).
 * @param data - Objeto con los datos a crear si no existe.
 * @param entityName - Nombre descriptivo para logs (ej. "Rol", "Usuario").
 */
export async function createIfNotExists(
    model: any,
    filter: Record<string, unknown>,
    data: Record<string, unknown>,
    entityName: string,
    location: string,
): Promise<void> {
    try {
        const found = await model.findOne(filter);

        if (!found) {
            const created = await model.create(data);

            if (created) {
                // console.log(`✔️  Se creó ${entityName} con éxito.`);
            } else {
                throw new AppError(
                    `⚠️ No se pudo crear ${entityName}.`,
                    404,
                    location,
                );
            }
        }
    } catch (error) {
        if (error instanceof AppError) {
            throw error; // ✅ ya tiene statusCode y location
        }

        throw new AppError(
            error instanceof Error ? error.message.trim() : "Error desconocido",
            500,
            location,
        );
    }
}
