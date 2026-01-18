import { Router } from 'express';
import { githubController } from './github.controller';
import { authenticate, applicantOnly } from '../../middleware';

const router = Router();

// OAuth routes (no auth required for initiating OAuth)
router.get('/auth-url', authenticate, applicantOnly, githubController.getAuthUrl.bind(githubController));
router.post('/callback', authenticate, applicantOnly, githubController.handleCallback.bind(githubController));

// Legacy: Connect GitHub with access token (still works)
router.post('/connect', authenticate, applicantOnly, githubController.connect.bind(githubController));

// Get stored repos
router.get('/repos', authenticate, applicantOnly, githubController.getRepos.bind(githubController));
router.get('/repos/:userId', authenticate, applicantOnly, githubController.getRepos.bind(githubController));

export default router;
