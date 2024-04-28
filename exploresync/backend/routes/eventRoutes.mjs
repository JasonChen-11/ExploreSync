import express from 'express';
import { isAuthenticated } from '../middleware/validationMiddleware.mjs';
import { getEvents, createRestaurantEvent, createEvent, deleteEvent, updateResponse } from '../controllers/eventController.mjs';

const router = express.Router();

router.get('/:groupId', isAuthenticated, getEvents);
router.post('/', isAuthenticated, createEvent);
router.post('/restaurant', isAuthenticated, createRestaurantEvent);
router.put('/:eventId', isAuthenticated, updateResponse);
router.delete('/:eventId', isAuthenticated, deleteEvent);

export default router;