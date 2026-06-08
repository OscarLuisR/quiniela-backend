import { body, checkExact } from "express-validator";
import { ValidaDatos } from "../utils/funcionesGlobales.js";
import type { NextFunction, Request, Response } from "express";

export const validaUpdateStatusCalendario = [
    body("statusJuego")
        .notEmpty()
        .withMessage("El campo [statusJuego] es requerido.")
        .bail()
        .isNumeric()
        .withMessage("El campo [statusJuego] debe ser numérico.")
        .bail()
        .isInt({ min: 0, max: 2 })
        .withMessage(
            "El campo [statusJuego] debe ser un número entero entre 0 y 2.",
        ),

    checkExact([], {
        message: "Solo esta permitido el campo [statusJuego].",
    }),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "validaUpdateCalendario");

        next();
    },
];

export const validaUpdateCierreCalendario = [
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
    body("statusJuego")
        .notEmpty()
        .withMessage("El campo [statusJuego] es requerido.")
        .bail()
        .isNumeric()
        .withMessage("El campo [statusJuego] debe ser numérico.")
        .bail()
        .isInt({ min: 0, max: 99 })
        .withMessage(
            "El campo [statusJuego] debe ser un número entero entre 0 y 99.",
        ),

    checkExact([], {
        message:
            "Solo esta permitido los campos [golesEquipoA, golesEquipoB, statusJuego].",
    }),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "validaUpdateCalendario");

        next();
    },
];
