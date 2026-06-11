import type { NextFunction, Request, Response } from "express";
import type { IResponseAuth } from "../types/IResponseAuth";
import type { IAuthenticatedRequest } from "../types/IAuthenticatedRequest";
import { loginService } from "../services/auth.services.js";
import { limpiarCookiesAutorizacion } from "../utils/funcionesGlobales.js";

export async function loginController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const isProd = process.env.MODE_ENV === "production";
    const respuesta: IResponseAuth = await loginService(req.body);

    res.cookie("access_token", respuesta.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "none", // TODO: Se coloco None porque el frontend y el backend estan en dominio separados //isProd ? "strict" : "lax",
        // sameSite: isProd ? "strict" : "lax",
        maxAge: 1000 * 60 * 60,
    })
        .cookie("refresh_token", respuesta.refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: "none", // TODO: Se coloco None porque el frontend y el backend estan en dominio separados //isProd ? "strict" : "lax",
            // sameSite: isProd ? "strict" : "lax",
            maxAge: 1000 * 60 * 60,
        })
        .status(200)
        .json({
            error: false,
            status: 200,
            message: "Ok",
            data: respuesta.payLoad,
        });
}

export async function logoutController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // Función auxiliar para matar la sesión en el navegador
    limpiarCookiesAutorizacion(res);

    res.status(200).json({
        error: false,
        status: 200,
        message: "Sesión cerrada correctamente",
    });
}

export async function validateController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const authReq = req as IAuthenticatedRequest;

    // Crea la data a enviar
    const data = {
        _id: authReq._id,
        email: authReq.email,
        nombre: authReq.nombre,
        status: authReq.status,
        rol: authReq.rol,
    };

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: data,
    });
}
