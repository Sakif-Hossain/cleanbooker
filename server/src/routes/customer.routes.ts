import { Router } from "express";
import { customerController } from "../controllers/customer.controller";
import { validateRequest } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import { customerSchema } from "../utils/validation";

const router = Router();

// All customer routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Customers
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get("/", customerController.getCustomers);

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Customers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerInput'
 *     responses:
 *       201:
 *         description: Customer created successfully
 */
router.post(
  "/",
  validateRequest(customerSchema),
  customerController.createCustomer
);

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get a single customer by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Customers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer retrieved successfully
 */
router.get("/:id", customerController.getCustomer);

/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     summary: Update a customer
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Customers
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
 *             $ref: '#/components/schemas/CustomerUpdate'
 *     responses:
 *       200:
 *         description: Customer updated successfully
 */
router.put(
  "/:id",
  validateRequest(customerSchema.partial()),
  customerController.updateCustomer
);

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Delete a customer
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Customers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 */
router.delete("/:id", customerController.deleteCustomer);

export default router;
