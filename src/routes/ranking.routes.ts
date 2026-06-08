import { Router } from "express";
import * as ctrl from "../controllers/ranking.controllers.js";
import * as valParam from "../middlewares/params.middleware.js";
import { verificaAccessToken } from "../middlewares/token.middleware.js";

const router = Router();

// APP USUARIO
router.get(
    "/",
    verificaAccessToken,
    valParam.validaQueryParams,
    ctrl.getRankingController,
);

router.get(
    "/usuario/:idUsuario",
    verificaAccessToken,
    valParam.validaPathParamIdUsuario,
    ctrl.getRankingByIdController,
);

router.get("/top-3", verificaAccessToken, ctrl.getRankingTop3Controller);

// APP ADMIN

export default router;
