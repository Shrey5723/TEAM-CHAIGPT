import { Router } from 'express';
import { applicantController } from './applicant.controller';
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

// Skills
router.get('/skills', applicantController.getSkills.bind(applicantController));
router.get('/test-your-skills/generate', applicantController.generateSkillTest.bind(applicantController));
router.post('/test-your-skills/submit', applicantController.submitSkillTest.bind(applicantController));

export default router;
