import { Router } from "express";
import * as ctrl from "../controllers/calendario.controllers.js";
import * as valiParam from "../middlewares/params.middleware.js";
import * as valiData from "../middlewares/calendario.middleware.js";
import { verificaAccessToken } from "../middlewares/token.middleware.js";
import { verificaAutorizacionAdmin } from "../middlewares/autorization.middleware.js";

const router = Router();

// APP USUARIO
router.get(
    "/fase/:_id",
    verificaAccessToken,
    valiParam.validaPathParamId,
    ctrl.getCalendarioByFaseController,
);

router.get(
    "/proximos-partidos/:localDate",
    valiParam.validaPathFecha,
    ctrl.getProximosPartidosController,
);

// APP ADMIN
router.get(
    "/fase/:_id/paginacion",
    verificaAccessToken,
    valiParam.validaPathParamId,
    valiParam.validaQueryParams,
    ctrl.getCalendarioByFasePaginacionController,
);

router.patch(
    "/:_id/status",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    valiParam.validaPathParamId,
    valiData.validaUpdateStatusCalendario,
    ctrl.updateStatusCalendarioController,
);

router.patch(
    "/:_id/cierre-partido",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    valiParam.validaPathParamId,
    valiData.validaUpdateCierreCalendario,
    ctrl.updateCierreCalendarioController,
);

export default router;
