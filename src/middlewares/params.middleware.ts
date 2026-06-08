import { checkExact, param, query } from "express-validator";
import { ValidaDatos } from "../utils/funcionesGlobales.js";
import type { NextFunction, Request, Response } from "express";

export const validaPathParamId = [
    param("_id")
        .isMongoId()
        .withMessage("El parametro [_Id] tiene un formato inválido"),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "validaPathParamId");

        next();
    },
];

export const validaPathParamIdFaseIdGrupo = [
    param("idFase")
        .isMongoId()
        .withMessage("El parametro [idFase] tiene un formato inválido"),
    param("idGrupo")
        .isMongoId()
        .withMessage("El parametro [idGrupo] tiene un formato inválido"),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "validaPathParamIdFaseIdGrupo");

        next();
    },
];

export const validaPathParamIdFaseIdUser = [
    param("idFase")
        .isMongoId()
        .withMessage("El parametro [idFase] tiene un formato inválido"),
    param("idUser")
        .isMongoId()
        .withMessage("El parametro [idUser] tiene un formato inválido"),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "validaPathParamIdFaseIdUser");

        next();
    },
];

export const validaPathParamIdFaseIdCalendario = [
    param("idFase")
        .isMongoId()
        .withMessage("El parametro [idFase] tiene un formato inválido"),
    param("idCalendario")
        .isMongoId()
        .withMessage("El parametro [idCalendario] tiene un formato inválido"),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "validaPathParamIdFaseIdCalendario");

        next();
    },
];

export const validaPathParamIdUsuario = [
    param("idUsuario")
        .isMongoId()
        .withMessage("El parametro [idUsuario] tiene un formato inválido"),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "validaPathParamIdUsuario");

        next();
    },
];

export const validaPathFecha = [
    param("localDate")
        .notEmpty()
        .withMessage("El parámetro [localDate] es obligatorio en la URL.")
        .bail()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage(
            "El parámetro [localDate] debe tener el formato válido YYYY-MM-DD (ejemplo: 2026-06-11).",
        )
        .bail()
        // Validación extra (opcional): Verifica que sea una fecha real en el calendario (ej. rechaza 2026-02-30)
        .isISO8601()
        .withMessage("La fecha ingresada no existe en el calendario."),

    (req: Request, res: Response, next: NextFunction) => {
        // Asegúrate de pasar el nombre correcto de este middleware a tu helper
        ValidaDatos(req, res, next, "validaPathFecha");

        next();
    },
];

export const validaQueryParams = [
    query("page")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("El parametro [page] no puede ser vacio.")
        .bail()
        .isInt({ min: 1 })
        .withMessage(
            "El parametro [page] debe ser un numero entero mayor a 0.",
        ),

    query("limit")
        .optional()
        .notEmpty()
        .withMessage("El parametro [limit] no puede ser vacio.")
        .bail()
        .isInt({ min: 1 })
        .withMessage(
            "El parametro [limit] debe ser un numero entero mayor a 0.",
        ),

    query("statusUser")
        .optional()
        .trim()
        .toLowerCase()
        .isIn(["activo", "inactivo", ""]) // Permitimos vacío para [TODOS]
        .withMessage(
            "El parametro [statusUser] debe ser 'activo' o 'inactivo'.",
        ),

    query("statusPronostico")
        .optional()
        .trim()
        .toLowerCase()
        .isIn(["abierto", "cerrado", ""]) // Permitimos vacío para [TODOS]
        .withMessage(
            "El parametro [statusPronostico] debe ser 'abierto' o 'cerrado'.",
        ),

    query("statusCalendario")
        .optional()
        .trim()
        .toLowerCase()
        .isIn(["abierto", "progreso", "finalizado", ""]) // Permitimos vacío para [TODOS]
        .withMessage(
            "El parametro [statusCalendario] debe ser 'abierto', 'progreso' o 'finalizado'.",
        ),

    query("search").optional().trim(),

    checkExact([], {
        message:
            "Solo estan permitidos los parametros opcionales [page, limit, statusUser, statusPronostico, statusCalendario, search]",
    }),

    (req: Request, res: Response, next: NextFunction) => {
        ValidaDatos(req, res, next, "validaQueryParams");

        // Normalizamos los valores en res.locals
        const page = parseInt(req.query.page as string);
        const limit = parseInt(req.query.limit as string);

        res.locals.page = !isNaN(page) && page > 0 ? page : 1;
        res.locals.limit = !isNaN(limit) && limit > 0 ? limit : 5;

        res.locals.search = req.query.search || null;
        res.locals.statusUser = req.query.statusUser || null;
        res.locals.statusPronostico = req.query.statusPronostico || null;
        res.locals.statusCalendario = req.query.statusCalendario || null;

        next();
    },
];
