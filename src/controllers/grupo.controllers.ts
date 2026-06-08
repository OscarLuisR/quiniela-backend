import type { NextFunction, Request, Response } from "express";
import {
    getGruposByFaseService,
    getGruposService,
} from "../services/grupo.services.js";

export async function getGruposController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const results = await getGruposService();

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: null,
    });
}

export async function getGruposByFaseController(
    // req: Request<{ _id: string }>,
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    // 1. Desestructuras con 'as any' para evitar el error de string[]
    const { _id } = req.params as any;

    const results = await getGruposByFaseService(_id);

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: null,
    });
}
