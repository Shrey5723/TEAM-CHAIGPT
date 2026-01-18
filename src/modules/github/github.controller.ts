import { Request, Response, NextFunction } from 'express';
import { githubService } from './github.service';

export class GitHubController {
    // Get GitHub OAuth URL
    async getAuthUrl(req: Request, res: Response, next: NextFunction) {
        try {
            const authUrl = githubService.getAuthUrl();
            res.json({
                success: true,
                data: { authUrl },
            });
        } catch (error) {
            next(error);
        }
    }

    // Handle OAuth callback
    async handleCallback(req: Request, res: Response, next: NextFunction) {
        try {
            const { code } = req.body;
            const userId = req.user!.id;
            const result = await githubService.handleOAuthCallback(userId, code);
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // Legacy: Connect GitHub with access token
    async connect(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const result = await githubService.connect(userId, req.body);
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get repos
    async getRepos(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId || req.user!.id;
            const repos = await githubService.getRepos(userId);
            res.json({
                success: true,
                data: repos,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const githubController = new GitHubController();
