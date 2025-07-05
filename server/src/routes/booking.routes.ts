import { Router } from "express";
import { bookingController } from "../controllers/booking.controller";
import { validateRequest } from "../middleware/validation";
import { authenticateToken } from "../middleware/auth";
import { bookingSchema, bookingStatusSchema } from "../utils/validation";

const router = Router();

// All booking routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Bookings
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get("/", bookingController.getBookings);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Bookings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingInput'
 *     responses:
 *       201:
 *         description: Booking created successfully
 */
router.post(
  "/",
  validateRequest(bookingSchema),
  bookingController.createBooking
);

/**
 * @swagger
 * /bookings/date/{date}:
 *   get:
 *     summary: Get bookings by date
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of bookings on that date
 */
router.get("/date/:date", bookingController.getBookingsByDate);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a single booking by ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 */
router.get("/:id", bookingController.getBooking);

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update a booking
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Bookings
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
 *             $ref: '#/components/schemas/BookingUpdate'
 *     responses:
 *       200:
 *         description: Booking updated successfully
 */
router.put(
  "/:id",
  validateRequest(bookingSchema.partial()),
  bookingController.updateBooking
);

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete a booking
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 */
router.delete("/:id", bookingController.deleteBooking);

/**
 * @swagger
 * /bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Bookings
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
 *             $ref: '#/components/schemas/BookingStatus'
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 */
router.patch(
  "/:id/status",
  validateRequest(bookingStatusSchema),
  bookingController.updateBookingStatus
);

export default router;
