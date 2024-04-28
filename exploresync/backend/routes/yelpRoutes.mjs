import express from 'express';
import { searchYelp } from '../controllers/YelpController.mjs';
import { isAuthenticated } from '../middleware/validationMiddleware.mjs';

const router = express.Router();

router.get('/', isAuthenticated, searchYelp);

export default router;