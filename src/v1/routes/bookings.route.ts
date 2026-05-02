import { Router } from 'express';
import * as bookingController from '../controllers/bookings.controller.js';
import { authentication, requireGuest } from '../middlewares/auth.middleware.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         checkIn:
 *           type: string
 *           format: date-time
 *           example: '2024-03-01T15:00:00Z'
 *         checkOut:
 *           type: string
 *           format: date-time
 *           example: '2024-03-05T11:00:00Z'
 *         totalPrice:
 *           type: number
 *           example: 482.00
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED]
 *           example: PENDING
 *         guestId:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         listingId:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         guest:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "John Doe"
 *         listing:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *               example: "Cozy Apartment"
 *             location:
 *               type: string
 *               example: "New York, NY"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: '2024-02-20T09:00:00Z'
 *     CreateBookingInput:
 *       type: object
 *       required: [listingId, checkIn, checkOut, guests]
 *       properties:
 *         listingId:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         checkIn:
 *           type: string
 *           format: date-time
 *           example: '2024-03-01T15:00:00Z'
 *         checkOut:
 *           type: string
 *           format: date-time
 *           example: '2024-03-05T11:00:00Z'
 *         guests:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Booking'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             totalCount:
 *               type: integer
 *               example: 25
 *             totalPages:
 *               type: integer
 *               example: 3
 */

const router = Router();

/**
 * @swagger
 * /bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get all bookings (paginated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/', bookingController.getAllBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get a booking by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */
router.get('/:id', bookingController.getBookingById);

/**
 * @swagger
 * /bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking (guest only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingInput'
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Bad request - missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — requires guest role
 *       404:
 *         description: Listing not found
 *       409:
 *         description: Booking conflict
 */
router.post('/', authentication, requireGuest, bookingController.createBooking);

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     tags: [Bookings]
 *     summary: Delete (cancel) a booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - can only cancel your own bookings
 *       404:
 *         description: Booking not found
 */
router.delete('/:id', authentication, bookingController.deleteBooking);

// Export for use in users route
export default router;
export { router as bookingsRouter };
