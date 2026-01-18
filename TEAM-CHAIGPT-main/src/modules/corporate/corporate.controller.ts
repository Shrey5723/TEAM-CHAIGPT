import { Request, Response, NextFunction } from 'express';
import { corporateService } from './corporate.service';

export class CorporateController {
    // Create job (Hirer only)
    async createJob(req: Request, res: Response, next: NextFunction) {
        try {
            const hirerId = req.user!.id;
            const job = await corporateService.createJob(hirerId, req.body);
            res.status(201).json({
                success: true,
                data: job,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all jobs
    async getJobs(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobType, location, isActive } = req.query;
            const jobs = await corporateService.getJobs({
                jobType: jobType as string,
                location: location as string,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            });
            res.json({
                success: true,
                data: jobs,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get job by ID
    async getJobById(req: Request, res: Response, next: NextFunction) {
        try {
            const job = await corporateService.getJobById(req.params.jobId);
            res.json({
                success: true,
                data: job,
            });
        } catch (error) {
            next(error);
        }
    }

    // Update job (Hirer only)
    async updateJob(req: Request, res: Response, next: NextFunction) {
        try {
            const hirerId = req.user!.id;
            const job = await corporateService.updateJob(req.params.jobId, hirerId, req.body);
            res.json({
                success: true,
                data: job,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get recommended jobs for applicant
    async getRecommendedJobs(req: Request, res: Response, next: NextFunction) {
        try {
            const applicantUserId = req.params.applicantId || req.user!.id;
            const jobs = await corporateService.getRecommendedJobs(applicantUserId);
            res.json({
                success: true,
                data: jobs,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get recommended applicants for job (Hirer only)
    async getRecommendedApplicants(req: Request, res: Response, next: NextFunction) {
        try {
            const hirerId = req.user!.id;
            const applicants = await corporateService.getRecommendedApplicants(req.params.jobId, hirerId);
            res.json({
                success: true,
                data: applicants,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get hirer's own jobs
    async getHirerJobs(req: Request, res: Response, next: NextFunction) {
        try {
            const hirerId = req.user!.id;
            const jobs = await corporateService.getHirerJobs(hirerId);
            res.json({
                success: true,
                data: jobs,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== SELECTION ENDPOINTS ====================

    // Select an applicant for a job (Hirer only)
    async selectApplicant(req: Request, res: Response, next: NextFunction) {
        try {
            const hirerId = req.user!.id;
            const { jobId, applicantId } = req.params;
            const selection = await corporateService.selectApplicant(jobId, applicantId, hirerId);
            res.status(201).json({
                success: true,
                data: selection,
            });
        } catch (error) {
            next(error);
        }
    }

    // Unselect an applicant from a job (Hirer only)
    async unselectApplicant(req: Request, res: Response, next: NextFunction) {
        try {
            const hirerId = req.user!.id;
            const { jobId, applicantId } = req.params;
            const result = await corporateService.unselectApplicant(jobId, applicantId, hirerId);
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all selections for a job (Hirer only)
    async getSelectionsForJob(req: Request, res: Response, next: NextFunction) {
        try {
            const hirerId = req.user!.id;
            const selections = await corporateService.getSelectionsForJob(req.params.jobId, hirerId);
            res.json({
                success: true,
                data: selections,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get jobs where current applicant has been selected
    async getJobsSelectedForMe(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const jobs = await corporateService.getJobsSelectedForApplicant(userId);
            res.json({
                success: true,
                data: jobs,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const corporateController = new CorporateController();
