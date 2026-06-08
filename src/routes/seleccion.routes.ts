import { Router } from "express";
import * as ctrl from "../controllers/seleccion.controllers.js";
import { verificaAccessToken } from "../middlewares/token.middleware.js";
import { verificaAutorizacionAdmin } from "../middlewares/autorization.middleware.js";

const router = Router();

// APP USUARIO

// APP ADMIN
router.get(
    "/",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    ctrl.getSeleccionesController,
);

export default router;
