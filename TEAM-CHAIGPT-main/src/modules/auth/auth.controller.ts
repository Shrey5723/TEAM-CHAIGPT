import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const user = await authService.getProfile(userId);
            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
