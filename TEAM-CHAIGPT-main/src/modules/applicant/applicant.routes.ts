import { Router } from 'express';
import { applicantController } from './applicant.controller';
import { testController } from './test.controller';
import { authenticate, applicantOnly } from '../../middleware';
import { uploadResume, uploadCertificate } from '../../config';

const router = Router();

// All routes require authentication and applicant role
router.use(authenticate, applicantOnly);

// Profile routes
router.post('/profile', applicantController.createProfile.bind(applicantController));
router.get('/profile', applicantController.getProfile.bind(applicantController));
router.get('/profile/:id', applicantController.getProfile.bind(applicantController));
router.put('/profile', applicantController.updateProfile.bind(applicantController));

// Resume upload (PDF only)
router.post('/resume', uploadResume.single('resume'), applicantController.uploadResume.bind(applicantController));
router.put('/resume/cgpa', applicantController.updateCgpa.bind(applicantController));

// Certificate routes
router.post('/certificates', uploadCertificate.single('certificate'), applicantController.uploadCertificate.bind(applicantController));
router.post('/certificates/manual', applicantController.addCertificateManual.bind(applicantController));
router.post('/certificates/sync', applicantController.syncCertificates.bind(applicantController));
router.get('/certificates', applicantController.getCertificates.bind(applicantController));
router.put('/certificates/:id', applicantController.updateCertificate.bind(applicantController));

// Skills
// Skills
router.get('/skills', applicantController.getSkills.bind(applicantController));

// Skill Testing
router.post('/test/start', testController.generateTest.bind(testController));
router.post('/test/submit', testController.submitTest.bind(testController));

// Goal-Centric Career Analysis
router.post('/goal-analysis', applicantController.analyzeGoals.bind(applicantController));

export default router;

