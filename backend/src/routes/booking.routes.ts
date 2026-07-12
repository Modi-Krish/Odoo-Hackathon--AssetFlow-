import { Router } from 'express';
import {
  createBooking, getBookings, updateBooking, cancelBooking,
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBookingSchema, updateBookingSchema } from '../validators/booking.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createBookingSchema), createBooking);
router.get('/', getBookings);
router.put('/:id', validate(updateBookingSchema), updateBooking);
router.delete('/:id', cancelBooking);

export default router;
