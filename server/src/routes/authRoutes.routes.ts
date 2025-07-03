import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import { registerSchema, loginSchema } from "../utils/validation";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register
);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/profile", authenticateToken, authController.profile);

export default router;
