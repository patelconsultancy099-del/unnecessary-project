import { Router } from 'express';
import { z } from 'zod';
import { addLocation, currentLocation, history, startTracking, stopTracking } from '../controllers/tracking.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateWithZod } from '../middlewares/zodValidate.middleware.js';

const router = Router();
router.use(requireAuth);

const locationZodSchema = z.object({
  latitude: z.union([z.number(), z.string()]),
  longitude: z.union([z.number(), z.string()]),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
  bearing: z.number().optional(),
  recordedAt: z.string().optional()
});

router.get('/:deviceId/current', currentLocation);
router.get('/:deviceId/history', history);
router.post('/:deviceId/location', validateWithZod(locationZodSchema), addLocation);
router.post('/:deviceId/start', startTracking);
router.post('/:deviceId/stop', stopTracking);

export default router;
