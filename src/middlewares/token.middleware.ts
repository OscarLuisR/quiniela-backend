import jwt from "jsonwebtoken";
import {
    GeneraToken,
    limpiarCookiesAutorizacion,
} from "../utils/funcionesGlobales.js";
import type { NextFunction, Request, Response } from "express";
import type { IPayLoad } from "../types/IPayLoad.js";
import type { IAuthenticatedRequest } from "../types/IAuthenticatedRequest.js";
import type { IOptionsToken } from "../types/IOptionsToken.js";
import type { IDecodeToken } from "../types/IDecodeToken.js";
import { AppError } from "../utils/appError.js";

export const verificaAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // Verifica el Access Token
    const decode: IPayLoad = await verificaHeaderCookies(
        req,
        res,
        next,
        "middleware:verificaAccessToken",
    );

    // Type assertion para extender el request
    const authReq = req as IAuthenticatedRequest;

    // Agrega la informacion del token al request
    authReq._id = decode._id;
    authReq.email = decode.email;
    authReq.nombre = decode.nombre;
    authReq.status = decode.status;
    authReq.rol = decode.rol;

    next();
};

async function verificaHeaderCookies(
    req: Request,
    res: Response,
    next: NextFunction,
    location: string,
): Promise<IPayLoad> {
    try {
        const isProd = process.env.MODE_ENV === "production";

        // Verifica que los Tokens vengan en las cookies de la cabecera
        if (
            !req.cookies ||
            Object.keys(req.cookies).length === 0 ||
            !req.cookies.access_token ||
            !req.cookies.refresh_token
        ) {
            const message = isProd
                ? "No tienes autorización para acceder a este recurso"
                : "Faltan las Cookies de Autorización";

            // Función auxiliar para matar la sesión en el navegador
            limpiarCookiesAutorizacion(res);

            throw new AppError(message, 401, location);
        }

        // Verifica que los Tokens no esten vacios
        if (
            !req.cookies.access_token?.trim() ||
            !req.cookies.refresh_token?.trim()
        ) {
            const message = isProd
                ? "No tienes autorización para acceder a este recurso"
                : "Debe proporcionar un Token Valido";

            // Función auxiliar para matar la sesión en el navegador
            limpiarCookiesAutorizacion(res);

            throw new AppError(message, 401, location);
        }

        // Verifica que el AccessToken sea Valido o Expiro
        const decodeAccessToken = await verificaStatusToken(
            req.cookies.access_token.trim(),
            process.env.APP_SECRET_ACCESS_TOKEN!,
            location,
        );

        // Si el AccessToken expiro, verifica el RefreshToken
        if (decodeAccessToken.error && decodeAccessToken.status === 498) {
            // Verifica que el RefreshToken sea Valido o Expiro
            const decodeRefreshToken = await verificaStatusToken(
                req.cookies.refresh_token?.trim(),
                process.env.APP_SECRET_REFRESH_TOKEN!,
                location,
            );

            // Si el RefreshToken expiro
            if (decodeRefreshToken.error && decodeRefreshToken.status === 498) {
                const message = isProd
                    ? "Acceso Denegado"
                    : "Acceso Denegado. El Refresh Token ha Expirado";

                // Función auxiliar para matar la sesión en el navegador
                limpiarCookiesAutorizacion(res);

                throw new AppError(message, 401, location);
            }

            // Si el RefreshToken es Valido, genera un nuevo AccessToken
            const payLoad = decodeRefreshToken.payLoad;

            // Construye las opciones para el AccessToken
            const optionsAccessToken: IOptionsToken = {
                secret: process.env.APP_SECRET_ACCESS_TOKEN!,
                expiresIn: process.env.APP_SESSION_TIMEOUT_ACCESS_TOKEN!,
            };

            // Genero el AccessToken
            const accessToken = await GeneraToken(
                payLoad!,
                optionsAccessToken,
                location,
            );

            // Seteo las Cookies en la respuesta con los nuevos token
            res.cookie("access_token", accessToken, {
                httpOnly: true,
                secure: isProd,
                sameSite: "none", // TODO: Se coloco None porque el frontend y el backend estan en dominio separados //isProd ? "strict" : "lax",
                maxAge: 1000 * 60 * 60,
            });

            return decodeRefreshToken.payLoad!;
        } else {
            return decodeAccessToken.payLoad!;
        }
    } catch (error: any) {
        // SEGURIDAD EXTRA: Si el error viene de verificaStatusToken (ej. token manipulado),
        // lo capturamos aquí y limpiamos las cookies antes de enviarlo al manejador global.
        if (error instanceof AppError && error.statusCode === 401) {
            // Función auxiliar para matar la sesión en el navegador
            limpiarCookiesAutorizacion(res);

            throw error;
        }

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

async function verificaStatusToken(
    token: string,
    secret: string,
    location: string,
): Promise<IDecodeToken> {
    try {
        // Verifica si el Token es Valido o si Expiro
        const decode: IPayLoad = (await jwt.verify(token, secret)) as IPayLoad;

        return { payLoad: decode };
    } catch (error: any) {
        const isProd = process.env.MODE_ENV === "production";

        switch (error?.name?.trim().toLowerCase()) {
            case "jsonwebtokenerror":
                const message = isProd
                    ? "No tienes autorización para acceder a este recurso"
                    : "Debe proporcionar un Token Valido";

                throw new AppError(message, 401, location);
                break;

            case "tokenexpirederror":
                return {
                    error: true,
                    status: 498,
                    message: "La Session ha Expirado",
                };
                break;

            default:
                throw new AppError(error.message.trim(), 401, location);
                break;
        }
    }
}
