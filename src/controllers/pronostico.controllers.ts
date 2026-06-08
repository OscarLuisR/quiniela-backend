import type { NextFunction, Request, Response } from "express";
import * as serv from "../services/pronostico.services.js";
import { AppError } from "../utils/appError.js";

export async function getPronosticosByUserByFaseController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // throw new AppError("ERROR LOCO", 404, "PRUEBA");

    // 1. Desestructuras con 'as any' para evitar el error de string[]
    const { idUser, idFase } = req.params as any;

    const results = await serv.getPronosticosByUserByFaseService(
        idUser,
        idFase,
    );

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: null,
    });
}

export async function getPronosticosByFasePaginacionController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // 1. Desestructuras con 'as any' para evitar el error de string[]
    const { _id } = req.params as any;

    const { page, limit, statusPronostico } = res.locals; // Extraemos todo de locals

    const results = await serv.getPronosticosByFasePaginacionService(
        _id,
        page,
        limit,
        statusPronostico,
    );

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: results.pagination,
    });
}

export async function updatePronosticosController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const { _id } = req.params as any;

    const { golesEquipoA, golesEquipoB, idGanador } = req.body;

    await serv.updatePronosticosService(
        _id,
        golesEquipoA,
        golesEquipoB,
        idGanador,
    );

    res.status(200).json({
        error: false,
        status: 200,
        message: "Pronóstico Actualizado",
        data: null,
        pagination: null,
    });
}

export async function updatePronosticoStatusController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // 1. Desestructuras con 'as any' para evitar el error de string[]
    const { idCalendario, idFase } = req.params as any;
    const { aceptaPronostico } = req.body;

    await serv.updatePronosticoStatusService(
        idCalendario,
        idFase,
        aceptaPronostico,
    );

    res.status(200).json({
        error: false,
        status: 200,
        message: "Pronostico modificado",
        data: null,
        pagination: null,
    });
}
