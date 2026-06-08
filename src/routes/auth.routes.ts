import { Router } from "express";
import * as ctrl from "../controllers/auth.controllers.js";
import { validateAuth } from "../middlewares/auth.middleware.js";
import { verificaAccessToken } from "../middlewares/token.middleware.js";

const router = Router();

// APP USER - ADMIN
router.post("/login", validateAuth, ctrl.loginController);
router.post("/logout", ctrl.logoutController);
router.get("/validate", verificaAccessToken, ctrl.validateController);

export default router;
