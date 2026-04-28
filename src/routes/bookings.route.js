import { Router } from 'express';
import * as bookingController from '../controllers/bookings.controller.js';
import { authentication, requireGuest } from '../middlewares/auth.middleware.js';
const router = Router();
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', authentication, requireGuest, bookingController.createBooking);
router.delete('/:id', authentication, bookingController.deleteBooking);
export default router;
//# sourceMappingURL=bookings.route.js.map