import * as svr from "../services/configuracion.services";
import type { NextFunction, Request, Response } from "express";

export async function getConfiguracionController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const results = await svr.getConfiguracionService();

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: null,
    });
}

export async function createSedesController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const result = await svr.createSedesService();

    res.status(200).json({
        error: false,
        status: 200,
        message:
            result.length > 0
                ? "Sedes sincronizadas correctamente"
                : "No hubo sedes nuevas para crear",
        data: result,
        pagination: null,
    });
}

export async function createFasesController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const result = await svr.createFasesService();

    res.status(200).json({
        error: false,
        status: 200,
        message:
            result.length > 0
                ? "Fases sincronizadas correctamente"
                : "No hubo fases nuevas para crear",
        data: result,
        pagination: null,
    });
}

export async function createGruposController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const result = await svr.createGruposService();

    res.status(200).json({
        error: false,
        status: 200,
        message:
            result.length > 0
                ? "Grupos sincronizados correctamente"
                : "No hubo grupos nuevos para crear",
        data: result,
        pagination: null,
    });
}

export async function createSeleccionesController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const result = await svr.createSeleccionesService();

    res.status(200).json({
        error: false,
        status: 200,
        message:
            result.length > 0
                ? "Selecciones sincronizadas correctamente"
                : "No hubo selecciones nuevas para crear",
        data: result,
        pagination: null,
    });
}

export async function createClasificacionController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const result = await svr.createClasificacionService();

    res.status(200).json({
        error: false,
        status: 200,
        message:
            result.length > 0
                ? "Selecciones sincronizadas correctamente"
                : "No hubo selecciones nuevas para crear",
        data: result,
        pagination: null,
    });
}

export async function createCalendarioController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const result = await svr.createCalendarioService();

    res.status(200).json({
        error: false,
        status: 200,
        message:
            result.length > 0
                ? "Calendario sincronizado correctamente"
                : "No hubo calendario nuevo para crear",
        data: result,
        pagination: null,
    });
}
