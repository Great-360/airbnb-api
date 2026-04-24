import { Router } from "express";
import { 
    register, login, getMe, 
    changePassword, resetPassword, forgotPassword
}from "../controllers/auth.controller.js";

import { authentication } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authentication, getMe);
router.post("/change-password", authentication, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;