import { Router } from 'express';
import { body, param } from 'express-validator';
import { deleteDevice, getDevice, listDevices, registerDevice, updateBattery, updateDevice } from '../controllers/device.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', listDevices);
router.post('/', [
  body('deviceId').isString().isLength({ min: 3, max: 160 }),
  body('name').isString().isLength({ min: 1, max: 80 }),
  body('model').optional().isString(),
  body('manufacturer').optional().isString(),
  body('androidVersion').optional().isString(),
  validate
], registerDevice);
router.get('/:id', [param('id').isMongoId(), validate], getDevice);
router.patch('/:id', [param('id').isMongoId(), validate], updateDevice);
router.delete('/:id', [param('id').isMongoId(), validate], deleteDevice);
router.post('/:id/battery', [
  param('id').isMongoId(),
  body('percent').isFloat({ min: 0, max: 100 }),
  body('charging').isBoolean(),
  body('temperature').optional().isFloat(),
  body('health').optional().isString(),
  validate
], updateBattery);

export default router;
