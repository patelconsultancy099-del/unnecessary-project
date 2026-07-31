import { Router } from 'express';
import { body, param } from 'express-validator';
import { createGeofence, deleteGeofence, geofenceExit, listGeofences, updateGeofence } from '../controllers/geofence.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', listGeofences);
router.post('/', [
  body('device').isMongoId(),
  body('name').isString().isLength({ min: 1, max: 80 }),
  body('center.latitude').isFloat({ min: -90, max: 90 }),
  body('center.longitude').isFloat({ min: -180, max: 180 }),
  body('radiusMeters').isFloat({ min: 50, max: 100000 }),
  validate
], createGeofence);
router.patch('/:id', [param('id').isMongoId(), validate], updateGeofence);
router.delete('/:id', [param('id').isMongoId(), validate], deleteGeofence);
router.post('/:id/exit', [param('id').isMongoId(), validate], geofenceExit);

export default router;
