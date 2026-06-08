import { body, checkExact, param } from "express-validator";
import { ValidaDatos } from "../utils/funcionesGlobales.js";
import type { NextFunction, Request, RequestHandler, Response } from "express";

export const validaCreateUser = [
    body("nombre")
        .trim()
        .notEmpty()
        .withMessage("El campo [nombre] es requerido.")
        .bail()
        .isString()
        .withMessage("El campo [nombre] debe ser de tipo String.")
        .bail()
        .isLength({ max: 60 })
        .withMessage("El campo [nombre] debe tener maximo 60 caracteres."),

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
            "Solo estan permitidos los campos requeridos [nombre, email, password]",
    }),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "middleware:validaCreateUser");

        next();
    },
];

export const validaUpdateUser = [
    body("status")
        .trim()
        .notEmpty()
        .withMessage("El campo [status] es requerido.")
        .bail()
        .toLowerCase() // Normalizamos a minúsculas antes de validar
        .isIn(["activo", "inactivo"])
        .withMessage("El campo status solo puede ser 'activo' o 'inactivo'."),

    checkExact([], {
        message: "Solo esta permitido el campo [status]",
    }),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "validaUpdateUser");

        next();
    },
];
