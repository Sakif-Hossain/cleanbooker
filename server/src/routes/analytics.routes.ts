import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All analytics routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get("/dashboard", analyticsController.getDashboardStats);

/**
 * @swagger
 * /analytics/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Revenue analytics retrieved successfully
 */
router.get("/revenue", analyticsController.getRevenueAnalytics);

/**
 * @swagger
 * /analytics/bookings:
 *   get:
 *     summary: Get booking analytics
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Booking analytics retrieved successfully
 */
router.get("/bookings", analyticsController.getBookingAnalytics);

/**
 * @swagger
 * /analytics/customers:
 *   get:
 *     summary: Get customer analytics
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Customer analytics retrieved successfully
 */
router.get("/customers", analyticsController.getCustomerAnalytics);

/**
 * @swagger
 * /analytics/performance:
 *   get:
 *     summary: Get performance metrics
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Performance metrics retrieved successfully
 */
router.get("/performance", analyticsController.getPerformanceMetrics);

export default router;
