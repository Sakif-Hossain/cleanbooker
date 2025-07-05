import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import { registerSchema, loginSchema } from "../utils/validation";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
router.post("/login", validateRequest(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post("/refresh", authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 */
router.get("/profile", authenticateToken, authController.profile);

export default router;
