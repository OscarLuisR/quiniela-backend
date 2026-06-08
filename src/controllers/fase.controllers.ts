import type { NextFunction, Request, Response } from "express";
import {
    getFasesAllService,
    getFasesOpenService,
    getFasesEliminacionDirectaOpenService,
    updateFaseService,
} from "../services/fase.services.js";
import type { IAuthenticatedRequest } from "../types/IAuthenticatedRequest.js";

export async function getFasesAllController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const results = await getFasesAllService();

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: null,
    });
}

export async function getFasesOpenController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const results = await getFasesOpenService();

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: null,
    });
}

export async function updateFaseController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const authReq = req as IAuthenticatedRequest;

    const adminId: string = authReq._id.toString(); // El ID viene del token decodificado

    // 1. Desestructuras con 'as any' para evitar el error de string[]
    const { _id } = req.params as any;
    const { faseAbierta } = req.body;

    await updateFaseService(_id, faseAbierta, adminId);

    res.status(200).json({
        error: false,
        status: 200,
        message: "Etapa modificada",
        data: null,
        pagination: null,
    });
}

export async function getFasesEliminacionDirectaOpenController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const results = await getFasesEliminacionDirectaOpenService();

    res.status(200).json({
        error: false,
        status: 200,
        message: "Ok",
        data: results.docs,
        pagination: null,
    });
}
