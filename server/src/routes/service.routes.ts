import { Router } from "express";
import { serviceController } from "../controllers/service.controller";
import { validateRequest } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import { serviceSchema } from "../utils/validation";

const router = Router();

// All service routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Services
 *     responses:
 *       200:
 *         description: List of services
 */
router.get("/", serviceController.getServices);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Services
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       201:
 *         description: Service created successfully
 */
router.post(
  "/",
  validateRequest(serviceSchema),
  serviceController.createService
);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get a single service by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 */
router.get("/:id", serviceController.getService);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update a service
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceUpdate'
 *     responses:
 *       200:
 *         description: Service updated successfully
 */
router.put(
  "/:id",
  validateRequest(serviceSchema.partial()),
  serviceController.updateService
);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service deleted successfully
 */
router.delete("/:id", serviceController.deleteService);

/**
 * @swagger
 * /services/{id}/toggle-status:
 *   patch:
 *     summary: Toggle the status of a service
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service status toggled successfully
 */
router.patch("/:id/toggle-status", serviceController.toggleServiceStatus);

export default router;
