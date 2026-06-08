import { body, checkExact } from "express-validator";
import { ValidaDatos } from "../utils/funcionesGlobales.js";
import type { NextFunction, Request, Response } from "express";

// ? LISTO - 20-06-2025
export const validateAuth = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("El campo [email] es requerido.")
        .bail()
        .isString()
        .withMessage("El campo [email] debe ser de tipo String.")
        .bail()
        .isEmail()
        .withMessage(
            "El campo [email] debe ser una direccion de correo valida.",
        )
        .bail()
        .isLength({ max: 100 })
        .withMessage("El campo [email] debe tener maximo 100 caracteres."),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("El campo [password] es requerido.")
        .bail()
        .isString()
        .withMessage("El campo [password] debe ser de tipo String.")
        .bail()
        .isLength({ max: 25 })
        .withMessage("El campo [password] debe tener maximo 25 caracteres."),

    checkExact([], {
        message:
            "Solo estan permitidos los campos requeridos [email y password].",
    }),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "middleware:validateAuth");

        next();
    },
];
