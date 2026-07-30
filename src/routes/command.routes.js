import { Router } from 'express';
import { body, param } from 'express-validator';
import { enqueue, listCommands, updateCommandStatus } from '../controllers/command.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/:deviceId', [param('deviceId').isMongoId(), validate], listCommands);
router.post('/:deviceId/ring', [param('deviceId').isMongoId(), validate], enqueue('ring'));
router.post('/:deviceId/stop-ring', [param('deviceId').isMongoId(), validate], enqueue('stopRing'));
router.post('/:deviceId/lock', [param('deviceId').isMongoId(), validate], enqueue('lock'));
router.post('/:deviceId/flashlight', [param('deviceId').isMongoId(), validate], enqueue('flashlight'));
router.post('/:deviceId/stop-flashlight', [param('deviceId').isMongoId(), validate], enqueue('stopFlashlight'));
router.post('/:deviceId/capture-photo', [param('deviceId').isMongoId(), validate], enqueue('capturePhoto'));
router.post('/:deviceId/capture-video', [param('deviceId').isMongoId(), validate], enqueue('captureVideo'));
router.post('/:deviceId/remote-message', [param('deviceId').isMongoId(), body('message').isString().isLength({ min: 1, max: 500 }), validate], enqueue('remoteMessage'));
router.post('/:deviceId/start-tracking', [param('deviceId').isMongoId(), validate], enqueue('startTracking'));
router.post('/:deviceId/stop-tracking', [param('deviceId').isMongoId(), validate], enqueue('stopTracking'));
router.post('/:deviceId/enable-theft-mode', [param('deviceId').isMongoId(), validate], enqueue('enableTheftMode'));
router.post('/:deviceId/disable-theft-mode', [param('deviceId').isMongoId(), validate], enqueue('disableTheftMode'));
router.patch('/:commandId/status', [param('commandId').isMongoId(), body('status').isIn(['acknowledged', 'completed', 'failed']), validate], updateCommandStatus);

export default router;
