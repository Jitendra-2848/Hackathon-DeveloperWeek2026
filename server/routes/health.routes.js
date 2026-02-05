

import { Router } from 'express';
import { healthController } from '../controllers/healthController.js';

const router = Router();


router.get('/', healthController.check);


router.get('/detailed', healthController.detailed);


router.get('/ready', healthController.ready);


router.get('/live', healthController.live);

export default router;