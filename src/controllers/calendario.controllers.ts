import type { NextFunction, Request, Response } from "express";
import * as serv from "../services/calendario.services.js";
import { AppError } from "../utils/appError.js";

export async function getCalendarioByFaseController(
    // req: Request<{ _id: string }>,
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // 1. Desestructuras con 'as any' para evitar el error de string[]
    const { _id } = req.params as any;

    const results = await serv.getCalendarioByFaseService(_id);

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: null,
    });
}

export async function getProximosPartidosController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // Capturamos la fecha
    const { localDate } = req.params as any;

    const results = await serv.getProximosPartidosService(localDate);

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: null,
    });
}

export async function getCalendarioByFasePaginacionController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // 1. Desestructuras con 'as any' para evitar el error de string[]
    const { _id } = req.params as any;

    const { page, limit, statusCalendario } = res.locals; // Extraemos todo de locals

    const results = await serv.getCalendarioByFasePaginacionService(
        _id,
        page,
        limit,
        statusCalendario,
    );

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: results.pagination,
    });
}

export async function updateStatusCalendarioController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // 1. Desestructuras con 'as any' para evitar el error de string[]
    const { _id } = req.params as any;
    const { statusJuego } = req.body;

    await serv.updateStatusCalendarioService(_id, statusJuego);

    res.status(200).json({
        error: false,
        status: 200,
        message: "Calendario modificado",
        data: null,
        pagination: null,
    });
}

export async function updateCierreCalendarioController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // 1. Desestructuras con 'as any' para evitar el error de string[]
    const { _id } = req.params as any;
    const { golesEquipoA, golesEquipoB, statusJuego } = req.body;

    await serv.updateCierreCalendarioService(
        _id,
        golesEquipoA,
        golesEquipoB,
        statusJuego,
    );

    res.status(200).json({
        error: false,
        status: 200,
        message: "Calendario cerrado",
        data: null,
        pagination: null,
    });
}
