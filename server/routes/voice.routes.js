

import { Router } from 'express';
import { voiceController } from '../controllers/voiceController.js';
import { voiceRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();


router.use(voiceRateLimiter);


router.get('/session', voiceController.getSession);


router.get('/voices', voiceController.getVoices);


router.post('/speak', voiceController.textToSpeech);


router.get('/history', voiceController.getHistory);


router.delete('/history', voiceController.clearHistory);

export default router;