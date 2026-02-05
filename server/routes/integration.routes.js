

import { Router } from 'express';
import { integrationController } from '../controllers/integrationController.js';
import { validateBody } from '../middleware/validation.middleware.js';

const router = Router();


router.get('/status', integrationController.getStatus);


router.get('/trello/status', integrationController.getTrelloStatus);
router.post('/trello/connect', integrationController.connectTrello);
router.post('/trello/disconnect', integrationController.disconnectTrello);
router.get('/trello/boards', integrationController.getTrelloBoards);
router.get('/trello/lists/:boardId', integrationController.getTrelloLists);


router.get('/calendar/status', integrationController.getCalendarStatus);
router.post('/calendar/connect', integrationController.connectCalendar);
router.post('/calendar/disconnect', integrationController.disconnectCalendar);
router.get('/calendar/events', integrationController.getCalendarEvents);


router.get('/notion/status', integrationController.getNotionStatus);
router.post('/notion/connect', integrationController.connectNotion);
router.post('/notion/disconnect', integrationController.disconnectNotion);
router.get('/notion/databases', integrationController.getNotionDatabases);


router.get('/slack/status', integrationController.getSlackStatus);
router.post('/slack/connect', integrationController.connectSlack);
router.post('/slack/disconnect', integrationController.disconnectSlack);
router.get('/slack/channels', integrationController.getSlackChannels);


router.post('/:type/test', integrationController.testIntegration);

export default router;