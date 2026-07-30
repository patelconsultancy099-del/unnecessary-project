import { Router } from 'express';
import { body, param } from 'express-validator';
import { addLocation, currentLocation, history, startTracking, stopTracking } from '../controllers/tracking.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/:deviceId/current', [param('deviceId').isMongoId(), validate], currentLocation);
router.get('/:deviceId/history', [param('deviceId').isMongoId(), validate], history);
router.post('/:deviceId/location', [
  param('deviceId').isMongoId(),
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('accuracy').optional().isFloat({ min: 0 }),
  body('speed').optional().isFloat(),
  body('bearing').optional().isFloat(),
  body('recordedAt').optional().isISO8601(),
  validate
], addLocation);
router.post('/:deviceId/start', [param('deviceId').isMongoId(), validate], startTracking);
router.post('/:deviceId/stop', [param('deviceId').isMongoId(), validate], stopTracking);

export default router;
