import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
const authRouter = Router();

authRouter.post("/register", authController.registerUser);
authRouter.post("/login", authController.login);
authRouter.get("/getAccessToken", authController.getAccessToken);
authRouter.get("/logout", authController.logout);
authRouter.get("/logout-all", authController.logoutall);
authRouter.get("/verify-email", authController.verifyEmail);
export default authRouter;
