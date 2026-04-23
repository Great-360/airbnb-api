import { Router } from 'express';
import * as bookingController from '../controllers/bookings.controller.js';

const router = Router();

router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.delete('/:id', bookingController.deleteBooking);

export default router;
