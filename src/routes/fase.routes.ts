import { Router } from "express";
import * as ctrl from "../controllers/fase.controllers.js";
import * as valiParam from "../middlewares/params.middleware.js";
import * as valiData from "../middlewares/fase.middleware.js";
import { verificaAccessToken } from "../middlewares/token.middleware.js";
import { verificaAutorizacionAdmin } from "../middlewares/autorization.middleware.js";

const router = Router();

// APP USUARIO
router.get("/", verificaAccessToken, ctrl.getFasesAllController);

router.get("/open", verificaAccessToken, ctrl.getFasesOpenController);

// APP ADMIN
router.get(
    "/eliminacion-directa/open",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    ctrl.getFasesEliminacionDirectaOpenController,
);

router.patch(
    "/:_id/status",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    valiParam.validaPathParamId,
    valiData.validaUpdateFase,
    ctrl.updateFaseController,
);

export default router;
