import { body, checkExact } from "express-validator";
import { ValidaDatos } from "../utils/funcionesGlobales.js";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError.js";

export const validaUpdatePronostico = [
    body("golesEquipoA")
        .notEmpty()
        .withMessage("El campo [golesEquipoA] es requerido.")
        .bail()
        .isNumeric()
        .withMessage("El campo [golesEquipoA] debe ser numérico.")
        .bail()
        .isInt({ min: 0, max: 99 })
        .withMessage(
            "El campo [golesEquipoA] debe ser un número entero entre 0 y 99.",
        ),
    body("golesEquipoB")
        .notEmpty()
        .withMessage("El campo [golesEquipoB] es requerido.")
        .bail()
        .isNumeric()
        .withMessage("El campo [golesEquipoB] debe ser numérico.")
        .bail()
        .isInt({ min: 0, max: 99 })
        .withMessage(
            "El campo [golesEquipoB] debe ser un número entero entre 0 y 99.",
        ),
    body("idGanador").custom((value) => {
        // Si es null, lo permitimos (es un empate)
        if (value === null) return true;

        // Si no es null, debe ser un string con formato válido de MongoDB ObjectId
        if (typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value)) {
            return true;
        }

        throw new AppError(
            "El campo [idGanador] debe ser un ObjectId válido o null en caso de empate.",
            404,
            "service:validaUpdatePronostico",
        );
    }),

    checkExact([], {
        message:
            "Solo esta permitido los campos [golesEquipoA, golesEquipoB, idGanador].",
    }),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "validaUpdateCalendario");

        next();
    },
];

export const validaUpdateStatusPronostico = [
    body("aceptaPronostico")
        .exists({ checkNull: true })
        .withMessage("El campo [aceptaPronostico] es requerido.")
        .bail()
        .isBoolean({ strict: true })
        .withMessage(
            "El campo [aceptaPronostico] solo permite valores booleanos (true o false).",
        ),

    checkExact([], {
        message: "Solo esta permitido el campo [aceptaPronostico]",
    }),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "validaUpdateStatusPronostico");

        next();
    },
];
