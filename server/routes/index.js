import { Router } from 'express';
import healthRoutes from './health.routes.js';
import voiceRoutes from './voice.routes.js';
import integrationRoutes from './integration.routes.js';
import settingsRoutes from './settings.routes.js';

const router = Router();


router.use('/health', healthRoutes);
router.use('/voice', voiceRoutes);
router.use('/integrations', integrationRoutes);
router.use('/settings', settingsRoutes);


router.get('/', (req, res) => {
  res.json({
    name: 'VoiceDesk API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      voice: '/api/voice',
      integrations: '/api/integrations',
      settings: '/api/settings',
    },
    documentation: 'https://github.com/your-repo/voicedesk',
  });
});

export default router;