import { Router } from "express";
import * as ctrl from "../controllers/user.controllers.js";
import * as valiData from "../middlewares/user.middleware.js";
import * as valiParam from "../middlewares/params.middleware.js";
import { verificaAccessToken } from "../middlewares/token.middleware.js";
import { verificaAutorizacionAdmin } from "../middlewares/autorization.middleware.js";

const router = Router();

// APP USUARIO
router.post("/", valiData.validaCreateUser, ctrl.createUserController);

// APP ADMIN
router.get(
    "/",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    valiParam.validaQueryParams,
    ctrl.getUsersController,
);

router.patch(
    "/:_id/status",
    verificaAccessToken,
    verificaAutorizacionAdmin,
    valiParam.validaPathParamId,
    valiData.validaUpdateUser,
    ctrl.updateUserController,
);

export default router;
