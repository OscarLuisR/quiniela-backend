import { Router } from "express";
import * as ctrl from "../controllers/configuracion.controllers";
import { verificaAccessToken } from "../middlewares/token.middleware.js";
import { verificaAutorizacionAdmin } from "../middlewares/autorization.middleware.js";

const router = Router();

// APP ADMIN
router.get(
    "/",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    ctrl.getConfiguracionController,
);

router.post(
    "/sede",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    ctrl.createSedesController,
);

router.post(
    "/fase",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    ctrl.createFasesController,
);

router.post(
    "/grupo",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    ctrl.createGruposController,
);

router.post(
    "/seleccion",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    ctrl.createSeleccionesController,
);

router.post(
    "/clasificacion",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    ctrl.createClasificacionController,
);

router.post(
    "/calendario",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    ctrl.createCalendarioController,
);

export default router;
