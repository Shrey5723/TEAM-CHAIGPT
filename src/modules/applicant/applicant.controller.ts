import { Request, Response, NextFunction } from 'express';
import { applicantService } from './applicant.service';

export class ApplicantController {
    // Create profile
    async createProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const profile = await applicantService.createProfile(userId, req.body);
            res.status(201).json({
                success: true,
                data: profile,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get profile
    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id || req.user!.id;
            const profile = await applicantService.getProfile(userId);
            res.json({
                success: true,
                data: profile,
            });
        } catch (error) {
            next(error);
        }
    }

    // Update profile
    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const profile = await applicantService.updateProfile(userId, req.body);
            res.json({
                success: true,
                data: profile,
            });
        } catch (error) {
            next(error);
        }
    }

    // Upload resume
    async uploadResume(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded. Please upload a PDF file.',
                });
            }

            const resume = await applicantService.uploadResume(
                userId,
                req.file.originalname,
                req.file.path
            );

            // Check profile completion
            await applicantService.checkProfileCompletion(userId);

            res.status(201).json({
                success: true,
                data: resume,
            });
        } catch (error) {
            next(error);
        }
    }

    // Update CGPA
    async updateCgpa(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { cgpa } = req.body;

            if (!cgpa) {
                return res.status(400).json({
                    success: false,
                    error: 'CGPA is required',
                });
            }

            const updatedResume = await applicantService.updateCgpa(userId, cgpa);

            res.json({
                success: true,
                data: updatedResume,
            });
        } catch (error) {
            next(error);
        }
    }

    // Upload certificate (with file)
    async uploadCertificate(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { issuer } = req.body;

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded. Please upload a PDF or image file.',
                });
            }

            const certificate = await applicantService.uploadCertificate(
                userId,
                req.file.originalname,
                req.file.path,
                issuer
            );

            // Check profile completion
            await applicantService.checkProfileCompletion(userId);

            res.status(201).json({
                success: true,
                data: certificate,
            });
        } catch (error) {
            next(error);
        }
    }

    // Add certificate manually (no file required)
    async addCertificateManual(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { name, companyName, platform } = req.body;

            // Validate required fields
            if (!name || !companyName || !platform) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: name, companyName, platform',
                });
            }

            const certificate = await applicantService.addCertificate(
                userId,
                { name, companyName, platform }
            );

            // Check profile completion
            await applicantService.checkProfileCompletion(userId);

            res.status(201).json({
                success: true,
                data: certificate,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get skills
    async getSkills(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const skills = await applicantService.getSkills(userId);
            res.json({
                success: true,
                data: skills,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get certificates
    async getCertificates(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const certificates = await applicantService.getCertificates(userId);
            res.json({
                success: true,
                data: certificates,
            });
        } catch (error) {
            next(error);
        }
    }

    // Sync certificates
    async syncCertificates(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            await applicantService.syncCertificates(userId);
            res.json({
                success: true,
                message: 'Certificates synced successfully',
            });
        } catch (error) {
            next(error);
        }
    }
    // Generate Skill Test
    async generateSkillTest(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const quiz = await applicantService.generateTest(userId);
            res.json({
                success: true,
                data: quiz,
            });
        } catch (error) {
            next(error);
        }
    }

    // Submit Skill Test
    async submitSkillTest(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const { answers } = req.body; // Expects array of { skill, difficulty, isCorrect }

            if (!answers || !Array.isArray(answers)) {
                return res.status(400).json({ success: false, error: 'Invalid answers format' });
            }

            const result = await applicantService.submitTest(userId, answers);
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const applicantController = new ApplicantController();
