import { Request, Response, NextFunction } from 'express';
import { TestService } from './test.service';

const testService = new TestService();

export class TestController {
    // Start a new test
    async generateTest(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const result = await testService.generateTest(userId);
            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Submit test answers
    async submitTest(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { testId, answers } = req.body;

            if (!testId || !answers || !Array.isArray(answers)) {
                res.status(400).json({ success: false, message: 'Invalid submission data' });
                return;
            }

            const result = await testService.submitTest(userId, testId, answers);
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

export const testController = new TestController();
