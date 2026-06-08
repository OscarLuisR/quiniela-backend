import { Router } from "express";
import * as ctrl from "../controllers/pronostico.controllers.js";
import * as valiParam from "../middlewares/params.middleware.js";
import * as valiData from "../middlewares/pronostico.middleware.js";
import { verificaAccessToken } from "../middlewares/token.middleware.js";
import { checkUserActive } from "../middlewares/checkUserActive.middleware.js";
import { verificaAutorizacionAdmin } from "../middlewares/autorization.middleware.js";

const router = Router();

// APP USUARIO
router.get(
    "/usuario/:idUser/fase/:idFase",
    verificaAccessToken,
    valiParam.validaPathParamIdFaseIdUser,
    checkUserActive,
    ctrl.getPronosticosByUserByFaseController,
);

router.patch(
    "/:_id",
    verificaAccessToken,
    valiParam.validaPathParamId,
    valiData.validaUpdatePronostico,
    checkUserActive,
    ctrl.updatePronosticosController,
);

// APP ADMIN
router.get(
    "/fase/:_id/paginacion",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    valiParam.validaPathParamId,
    valiParam.validaQueryParams,
    ctrl.getPronosticosByFasePaginacionController,
);

router.patch(
    "/status/calendario/:idCalendario/fase/:idFase",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    valiParam.validaPathParamIdFaseIdCalendario,
    valiData.validaUpdateStatusPronostico,
    ctrl.updatePronosticoStatusController,
);

export default router;
