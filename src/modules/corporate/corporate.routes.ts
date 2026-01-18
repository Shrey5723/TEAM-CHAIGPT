import { Router } from 'express';
import { corporateController } from './corporate.controller';
import { authenticate, applicantOnly, hirerOnly } from '../../middleware';

const router = Router();

// Public job listing
router.get('/jobs', corporateController.getJobs.bind(corporateController));
router.get('/jobs/:jobId', corporateController.getJobById.bind(corporateController));

// Hirer routes (create/update jobs, view applicants)
router.post('/jobs', authenticate, hirerOnly, corporateController.createJob.bind(corporateController));
router.put('/jobs/:jobId', authenticate, hirerOnly, corporateController.updateJob.bind(corporateController));
router.get('/my-jobs', authenticate, hirerOnly, corporateController.getHirerJobs.bind(corporateController));
router.get('/applicants/recommended/:jobId', authenticate, hirerOnly, corporateController.getRecommendedApplicants.bind(corporateController));

// Applicant routes (job recommendations)
router.get('/jobs/recommended/me', authenticate, applicantOnly, corporateController.getRecommendedJobs.bind(corporateController));
router.get('/jobs/recommended/:applicantId', authenticate, corporateController.getRecommendedJobs.bind(corporateController));

export default router;
