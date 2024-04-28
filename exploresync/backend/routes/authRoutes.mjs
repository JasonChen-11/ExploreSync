import express from 'express';
import { 
  userInfoValidation,
  handleBadRequest,
  isAuthenticated
} from '../middleware/validationMiddleware.mjs';
import { 
  getAuthenticatedUser,
  register, 
  login,
  logout,
  enable2FA,
  verify2FA,
  disable2FA
} from '../controllers/authController.mjs';

const router = express.Router();

router.get('/', isAuthenticated, getAuthenticatedUser);
router.post('/register', userInfoValidation, handleBadRequest, register);
router.post('/login', userInfoValidation, handleBadRequest, login);
router.get('/2fa/enable', isAuthenticated, enable2FA);
router.post('/2fa/verify', isAuthenticated, verify2FA);
router.get('/2fa/disable', isAuthenticated, disable2FA);
router.get('/logout', isAuthenticated, logout);

export default router;