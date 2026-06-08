import type { NextFunction, Request, Response } from "express";
import * as serv from "../services/ranking.services.js";

export async function getRankingController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const { page, limit } = res.locals; // Extraemos todo de locals

    const results = await serv.getRankingService(page, limit);

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: results.pagination,
    });
}

export async function getRankingByIdController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // 1. Desestructuras con 'as any' para evitar el error de string[]
    const { idUsuario } = req.params as any;

    const results = await serv.getRankingByIdService(idUsuario);

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results,
        pagination: null,
    });
}

export async function getRankingTop3Controller(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const results = await serv.getRankingTop3Service();

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: null,
    });
}
