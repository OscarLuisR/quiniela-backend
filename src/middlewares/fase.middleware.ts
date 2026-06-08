import { body, checkExact, param } from "express-validator";
import { ValidaDatos } from "../utils/funcionesGlobales.js";
import type { NextFunction, Request, RequestHandler, Response } from "express";

export const validaUpdateFase = [
    body("faseAbierta")
        .exists({ checkNull: true })
        .withMessage("El campo [faseAbierta] es requerido.")
        .bail()
        .isBoolean({ strict: true })
        .withMessage(
            "El campo [faseAbierta] debe ser un valor booleano estrictamente (true o false).",
        ),

    checkExact([], {
        message: "Solo esta permitido el campo [faseAbierta]",
    }),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "validaUpdateFase");

        next();
    },
];
