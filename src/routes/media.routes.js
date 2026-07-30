import { Router } from 'express';
import { param } from 'express-validator';
import { listMedia, streamMedia, uploadMedia } from '../controllers/media.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.get('/file/:mediaId', [param('mediaId').isMongoId(), validate], streamMedia);
router.use(requireAuth);
router.get('/:deviceId', [param('deviceId').isMongoId(), validate], listMedia);
router.post('/:deviceId/upload', [param('deviceId').isMongoId(), validate], upload.single('file'), uploadMedia);

export default router;
