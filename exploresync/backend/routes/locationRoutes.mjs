import express from 'express';
import { getAllUserLocations, updateLocationSetting, getLocationSetting } from '../controllers/locationController.mjs';
import { isAuthenticated } from '../middleware/validationMiddleware.mjs';

const router = express.Router();

router.get('/:groupId', isAuthenticated, getAllUserLocations);
router.put('/setting', isAuthenticated, updateLocationSetting);
router.get('/setting/:username', isAuthenticated, getLocationSetting);

export default router;