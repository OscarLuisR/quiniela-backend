import { Router } from "express";
import * as ctrl from "../controllers/grupo.controllers.js";
import * as valParam from "../middlewares/params.middleware.js";
import { verificaAccessToken } from "../middlewares/token.middleware.js";

const router = Router();

// APP USUARIO
router.get(
    "/",
    verificaAccessToken,
    // valParam.validaQueryParams,
    ctrl.getGruposController,
);

router.get(
    "/fase/:_id",
    verificaAccessToken,
    valParam.validaPathParamId,
    ctrl.getGruposByFaseController,
);

// APP ADMIN

export default router;
