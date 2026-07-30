import { Router } from 'express';
import { body } from 'express-validator';
import { forgotPassword, login, logout, me, refresh, register, resetPassword } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.post('/register', [
  body('name').isString().isLength({ min: 2, max: 80 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1 }),
  body('emergencyContact').optional().isString().isLength({ max: 40 }),
  validate
], register);

router.post('/login', [body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty(), validate], login);
router.post('/refresh', [body('refreshToken').isJWT(), validate], refresh);
router.post('/logout', requireAuth, logout);
router.post('/forgot-password', [body('email').isEmail().normalizeEmail(), validate], forgotPassword);
router.post('/reset-password', [body('token').isString().isLength({ min: 32 }), body('password').isStrongPassword({ minLength: 8, minNumbers: 1, minSymbols: 1 }), validate], resetPassword);
router.get('/me', requireAuth, me);

export default router;
