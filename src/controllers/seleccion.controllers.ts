import { getSeleccionesService } from "../services/seleccion.services.js";
import type { NextFunction, Request, Response } from "express";

export async function getSeleccionesController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const results = await getSeleccionesService();

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: null,
    });
}
