import { prisma } from '../../config';
import { CreateApplicantProfileDto, UpdateApplicantProfileDto } from '../../shared/types';
import { AppError } from '../../shared/utils';
import { eventEmitter } from '../../shared/events';
import { aiEvaluationService } from '../../services';
import * as fs from 'fs';
const pdf = require('pdf-parse');

export class ApplicantService {
    // Create applicant profile
    async createProfile(userId: string, data: CreateApplicantProfileDto) {
        const existingProfile = await prisma.applicantProfile.findUnique({
            where: { userId },
        });

        if (existingProfile) {
            throw new AppError('Profile already exists', 400);
        }

        const profile = await prisma.applicantProfile.create({
            data: {
                userId,
                linkedInUrl: data.linkedInUrl,
                courseraUrl: data.courseraUrl,
                bio: data.bio,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });

        return profile;
    }

    // Get applicant profile with all related data
    async getProfile(userId: string) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: {
                user: { select: { id: true, name: true, email: true, dob: true } },
                resume: true,
                certificates: true,
                derivedSkills: true,
                githubRepos: true,
            },
        });

        if (!profile) {
            throw new AppError('Profile not found', 404);
        }

        return profile;
    }

    // Update applicant profile
    async updateProfile(userId: string, data: UpdateApplicantProfileDto) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new AppError('Profile not found', 404);
        }

        const updatedProfile = await prisma.applicantProfile.update({
            where: { userId },
            data: {
                linkedInUrl: data.linkedInUrl,
                courseraUrl: data.courseraUrl,
                bio: data.bio,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });

        return updatedProfile;
    }

    // Upload resume (PDF only)
    async uploadResume(userId: string, filename: string, filepath: string) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new AppError('Profile not found. Create a profile first.', 404);
        }

        // Delete existing resume if present
        await prisma.resume.deleteMany({
            where: { applicantId: profile.id },
        });

        // Parse PDF and extract CGPA
        let extractedCgpa = null;
        try {
            console.log(`📄 parsing resume: ${filepath}`);
            const dataBuffer = fs.readFileSync(filepath);
            const data = await pdf(dataBuffer);
            const text = data.text;
            console.log(`📄 PDF text length: ${text?.length || 0} chars`);

            if (text && text.length > 50) {
                console.log('🤖 Sending text to AI for extraction...');
                const result = await aiEvaluationService.extractResumeDetails(text);
                extractedCgpa = result.cgpa;
                console.log(`✅ Extracted CGPA Result:`, result);
            } else {
                console.warn('⚠️ PDF text is empty or too short. Is it a scanned image?');
            }
        } catch (error) {
            console.error('❌ Error parsing PDF for CGPA:', error);
            // Non-blocking error, we still save the resume
        }

        const resume = await prisma.resume.create({
            data: {
                applicantId: profile.id,
                filename,
                filepath,
                cgpa: extractedCgpa
            },
        });

        return resume;
    }

    // Update CGPA manually
    async updateCgpa(userId: string, cgpa: string) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: { resume: true }
        });

        if (!profile) {
            throw new AppError('Profile not found', 404);
        }

        if (!profile.resume) {
            throw new AppError('No resume found. Please upload a resume first.', 400);
        }

        const updatedResume = await prisma.resume.update({
            where: { id: profile.resume.id },
            data: { cgpa }
        });

        return updatedResume;
    }

    // Add certificate manually or with file upload
    async addCertificate(
        userId: string,
        data: { name: string; companyName: string; platform: string; date?: Date | string },
        file?: { filename: string; filepath: string }
    ) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new AppError('Profile not found. Create a profile first.', 404);
        }

        const certificate = await prisma.certificate.create({
            data: {
                applicantId: profile.id,
                name: data.name,
                companyName: data.companyName,
                platform: data.platform,
                date: data.date ? new Date(data.date) : null,
                filename: file?.filename ?? null,
                filepath: file?.filepath ?? null,
                issuer: data.companyName, // Legacy field compatibility
            },
        });

        // Derive skills from certificate (deterministic scoring based on platform + company)
        await this.deriveSkillsFromCertificate(userId, profile.id, certificate.id, data.name, data.companyName, data.platform, data.date ? new Date(data.date) : null);

        return certificate;
    }

    // Update certificate
    async updateCertificate(
        userId: string,
        certId: string,
        data: { name?: string; companyName?: string; platform?: string; date?: Date | string }
    ) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new AppError('Profile not found', 404);
        }

        const cert = await prisma.certificate.findFirst({
            where: { id: certId, applicantId: profile.id },
        });

        if (!cert) {
            throw new AppError('Certificate not found', 404);
        }

        const updatedCert = await prisma.certificate.update({
            where: { id: certId },
            data: {
                name: data.name || cert.name,
                companyName: data.companyName || cert.companyName,
                platform: data.platform || cert.platform,
                date: data.date ? new Date(data.date) : cert.date,
                issuer: data.companyName || cert.companyName
            },
        });

        // Re-derive skills
        await prisma.derivedSkill.deleteMany({
            where: { certificateId: certId },
        });

        await this.deriveSkillsFromCertificate(
            userId,
            profile.id,
            certId,
            updatedCert.name,
            updatedCert.companyName,
            updatedCert.platform,
            updatedCert.date
        );

        return updatedCert;
    }

    // Legacy method for backward compatibility
    async uploadCertificate(userId: string, filename: string, filepath: string, issuer?: string) {
        return this.addCertificate(
            userId,
            { name: 'Uploaded Certificate', companyName: issuer || 'Unknown', platform: 'Unknown' },
            { filename, filepath }
        );
    }

    // Sync/Re-evaluate all certificates for a user
    async syncCertificates(userId: string) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: { certificates: true },
        });

        if (!profile) {
            throw new AppError('Profile not found', 404);
        }

        console.log(`Syncing ${profile.certificates.length} certificates for user ${userId}`);

        for (const cert of profile.certificates) {
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));

            try {
                // Remove existing skills for this certificate to avoid duplicates
                await prisma.derivedSkill.deleteMany({
                    where: { certificateId: cert.id },
                });

                // Re-derive skills
                await this.deriveSkillsFromCertificate(
                    userId,
                    profile.id,
                    cert.id,
                    cert.name,
                    cert.companyName,
                    cert.platform,
                    cert.date
                );
            } catch (error) {
                console.error(`Failed to sync certificate ${cert.id}:`, error);
                // Continue to next certificate
            }
        }

        return this.getSkills(userId);
    }

    // Derive skills from certificate using AI evaluation
    private async deriveSkillsFromCertificate(
        userId: string,
        applicantId: string,
        certificateId: string,
        certName: string,
        companyName: string,
        platform: string,
        completionDate: Date | null
    ) {
        try {
            // Calculate time decay
            let decayFactor = 1.0;
            if (completionDate) {
                const msPerYear = 1000 * 60 * 60 * 24 * 365;
                const yearsOld = (Date.now() - new Date(completionDate).getTime()) / msPerYear;
                // 10% decay per year after 1st year, capped at 50% decay (0.5 factor)
                if (yearsOld > 1) {
                    decayFactor = Math.max(0.5, 1.0 - ((yearsOld - 1) * 0.1));
                }
            }
            // Use AI evaluation service
            const evaluation = await aiEvaluationService.evaluateCourse(
                certName,
                platform,
                companyName
            );

            console.log('AI Evaluation Result:', {
                course: certName,
                finalScore: evaluation.final_score,
                skills: evaluation.skills.map(s => s.skill_name)
            });

            // Convert final score to confidence (0-100 -> 0-1)
            const baseConfidence = aiEvaluationService.scoreToConfidence(evaluation.final_score);

            // Create derived skills from AI evaluation
            const createdSkills = [];

            for (const aiSkill of evaluation.skills) {
                // Use average of individual skill rating and course base score
                // skill_rating_Si is 0-10. baseConfidence is 0-1.
                const individualScore = (aiSkill.skill_rating_Si || 0) / 10;
                let skillConfidence = baseConfidence;

                if (individualScore > 0) {
                    skillConfidence = (baseConfidence + individualScore) / 2;
                }

                // Apply time decay based on certificate age
                skillConfidence = skillConfidence * decayFactor;

                skillConfidence = Math.min(Math.max(skillConfidence, 0.1), 0.99);
                const safeName = (aiSkill.skill_name || 'unknown-skill').toLowerCase().replace(/\s+/g, '-');

                const skill = await prisma.derivedSkill.create({
                    data: {
                        applicantId,
                        name: safeName,
                        source: 'certificate-ai',
                        confidence: skillConfidence,
                        certificateId,
                    },
                });

                createdSkills.push(skill);

                // Emit notification for each skill
                eventEmitter.emit('skillDerived', {
                    userId,
                    skillName: aiSkill.skill_name || 'Unknown Skill',
                    source: 'certificate-ai',
                    confidence: skillConfidence,
                });
            }

            return createdSkills[0] || null;
        } catch (error) {
            console.error('AI Evaluation failed, using fallback:', error);
            // Fallback to deterministic scoring
            return this.deriveSkillsFallback(
                userId, applicantId, certificateId, certName, companyName, platform
            );
        }
    }

    // Fallback deterministic skill derivation
    private async deriveSkillsFallback(
        userId: string,
        applicantId: string,
        certificateId: string,
        certName: string,
        companyName: string,
        platform: string
    ) {
        const platformConfidence: Record<string, number> = {
            'coursera': 0.85, 'udemy': 0.70, 'linkedin learning': 0.75,
            'edx': 0.85, 'udacity': 0.80, 'pluralsight': 0.75, 'default': 0.65,
        };

        const companyBonus: Record<string, number> = {
            'google': 0.10, 'deeplearning.ai': 0.10, 'meta': 0.08,
            'microsoft': 0.10, 'aws': 0.10, 'ibm': 0.08, 'stanford': 0.10,
        };

        const skillKeywords: Record<string, string> = {
            'python': 'python', 'javascript': 'javascript', 'typescript': 'typescript',
            'react': 'react', 'node': 'nodejs', 'machine learning': 'machine-learning',
            'deep learning': 'deep-learning', 'data science': 'data-science',
            'aws': 'aws', 'cloud': 'cloud-computing', 'docker': 'docker',
            'kubernetes': 'kubernetes', 'sql': 'sql', 'java': 'java',
        };

        let confidence = platformConfidence[platform.toLowerCase()] || platformConfidence['default'];
        confidence += companyBonus[companyName.toLowerCase()] || 0;
        confidence = Math.min(confidence, 0.98);

        let derivedSkillName = 'general-skills';
        for (const [keyword, skill] of Object.entries(skillKeywords)) {
            if (certName.toLowerCase().includes(keyword)) {
                derivedSkillName = skill;
                break;
            }
        }

        const skill = await prisma.derivedSkill.create({
            data: {
                applicantId,
                name: derivedSkillName,
                source: 'certificate',
                confidence,
                certificateId,
            },
        });

        eventEmitter.emit('skillDerived', {
            userId,
            skillName: derivedSkillName,
            source: 'certificate',
            confidence,
        });

        return skill;
    }

    // Get derived skills
    async getSkills(userId: string) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: {
                derivedSkills: {
                    include: {
                        certificate: {
                            select: { name: true, platform: true }
                        }
                    }
                }
            },
        });

        if (!profile) {
            throw new AppError('Profile not found', 404);
        }

        return profile.derivedSkills;
    }

    // Get certificates
    async getCertificates(userId: string) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: { certificates: true },
        });

        if (!profile) {
            throw new AppError('Profile not found', 404);
        }

        return profile.certificates;
    }

    // Check profile completion and emit event
    async checkProfileCompletion(userId: string) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: {
                resume: true,
                certificates: true,
                derivedSkills: true,
                githubRepos: true,
            },
        });

        if (!profile) return false;

        const isComplete =
            profile.resume !== null &&
            profile.certificates.length > 0 &&
            profile.derivedSkills.length > 0;

        if (isComplete) {
            eventEmitter.emit('profileComplete', {
                userId,
                profileId: profile.id,
            });
        }

        return isComplete;
    }
}

export const applicantService = new ApplicantService();
