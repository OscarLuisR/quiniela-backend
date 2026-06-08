import { body, checkExact } from "express-validator";
import { ValidaDatos } from "../utils/funcionesGlobales.js";
import type { NextFunction, Request, Response } from "express";

export const validateRol = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("El campo [name] es requerido.")
        .bail()
        .isString()
        .withMessage("El campo [name] debe ser de tipo String.")
        .bail()
        .isLength({ max: 50 })
        .withMessage("El campo [name] debe tener maximo 50 caracteres."),

    checkExact([], {
        message: "Solo esta permitido el campo requerido [name]",
    }),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "validateRol");

        next();
    },
];
