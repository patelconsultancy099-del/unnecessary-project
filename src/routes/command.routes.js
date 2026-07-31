import { Router } from 'express';
import { z } from 'zod';
import { enqueue, listCommands, updateCommandStatus } from '../controllers/command.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateWithZod } from '../middlewares/zodValidate.middleware.js';

const router = Router();
router.use(requireAuth);

const remoteMessageZodSchema = z.object({
  message: z.string().min(1).max(500)
});

const commandStatusZodSchema = z.object({
  status: z.enum(['acknowledged', 'completed', 'failed']),
  error: z.string().optional()
});

router.get('/:deviceId', listCommands);
router.post('/:deviceId/ring', enqueue('ring'));
router.post('/:deviceId/stop-ring', enqueue('stopRing'));
router.post('/:deviceId/lock', enqueue('lock'));
router.post('/:deviceId/flashlight', enqueue('flashlight'));
router.post('/:deviceId/stop-flashlight', enqueue('stopFlashlight'));
router.post('/:deviceId/capture-photo', enqueue('capturePhoto'));
router.post('/:deviceId/capture-video', enqueue('captureVideo'));
router.post('/:deviceId/remote-message', validateWithZod(remoteMessageZodSchema), enqueue('remoteMessage'));
router.post('/:deviceId/start-tracking', enqueue('startTracking'));
router.post('/:deviceId/stop-tracking', enqueue('stopTracking'));
router.post('/:deviceId/enable-theft-mode', enqueue('enableTheftMode'));
router.post('/:deviceId/disable-theft-mode', enqueue('disableTheftMode'));
router.patch('/:commandId/status', validateWithZod(commandStatusZodSchema), updateCommandStatus);

export default router;
