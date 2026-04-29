/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         checkIn:
 *           type: string
 *           format: date-time
 *           example: '2024-03-01T15:00:00Z'
 *         checkOut:
 *           type: string
 *           format: date-time
 *           example: '2024-03-05T11:00:00Z'
 *         total:
 *           type: number
 *           example: 482.00
 *         status:
 *           type: string
 *           enum: [confirmed, cancelled]
 *           example: confirmed
 *         userId:
 *           type: integer
 *           example: 2
 *         listingId:
 *           type: integer
 *           example: 1
 *         user:
 *           $ref: '#/components/schemas/User'
 *         listing:
 *           $ref: '#/components/schemas/Listing'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: '2024-02-20T09:00:00Z'
 *     CreateBookingInput:
 *       type: object
 *       required: [listingId, userId, checkIn, checkOut]
 *       properties:
 *         listingId:
 *           type: integer
 *           example: 1
 *         userId:
 *           type: integer
 *           example: 2
 *         checkIn:
 *           type: string
 *           format: date-time
 *           example: '2024-03-01T15:00:00Z'
 *         checkOut:
 *           type: string
 *           format: date-time
 *           example: '2024-03-05T11:00:00Z'
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=bookings.route.d.ts.map