import { Router } from 'express';
import { body } from 'express-validator';
import { createNotification, timeline } from '../controllers/activity.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/timeline', timeline);
router.post('/notifications', [
  body('type').isString().notEmpty(),
  body('message').isString().isLength({ min: 1, max: 500 }),
  body('severity').optional().isIn(['info', 'warning', 'critical']),
  validate
], createNotification);

export default router;
