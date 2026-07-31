import { Router } from 'express';
import { z } from 'zod';
import { deleteDevice, getDevice, listDevices, registerDevice, updateBattery, updateDevice } from '../controllers/device.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateWithZod } from '../middlewares/zodValidate.middleware.js';

const router = Router();
router.use(requireAuth);

const registerDeviceZodSchema = z.object({
  deviceId: z.string().min(3).max(160),
  name: z.string().min(1).max(80),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  androidVersion: z.string().optional()
});

const batteryZodSchema = z.object({
  percent: z.number().min(0).max(100),
  charging: z.boolean(),
  temperature: z.number().optional(),
  health: z.string().optional()
});

router.get('/', listDevices);
router.post('/', validateWithZod(registerDeviceZodSchema), registerDevice);
router.get('/:id', getDevice);
router.patch('/:id', updateDevice);
router.delete('/:id', deleteDevice);
router.post('/:id/battery', validateWithZod(batteryZodSchema), updateBattery);

export default router;
