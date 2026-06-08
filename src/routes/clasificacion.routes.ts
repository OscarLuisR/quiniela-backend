import { Router } from "express";
import * as ctrl from "../controllers/clasificacion.controllers.js";
import * as valParam from "../middlewares/params.middleware.js";
import { verificaAccessToken } from "../middlewares/token.middleware.js";

const router = Router();

// APP USUARIO
router.get(
    "/fase/:idFase/grupo/:idGrupo",
    verificaAccessToken,
    valParam.validaPathParamIdFaseIdGrupo,
    ctrl.getClasificacionByFaseGrupoController,
);

// APP ADMIN

export default router;
