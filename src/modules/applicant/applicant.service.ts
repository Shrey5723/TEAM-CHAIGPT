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
        });

        if (!profile) {
            throw new AppError('Profile not found', 404);
        }

        // Check if resume exists
        const resume = await prisma.resume.findFirst({
            where: { applicantId: profile.id },
        });

        if (!resume) {
            throw new AppError('Please upload a resume first', 400);
        }

        // Update CGPA
        const updatedResume = await prisma.resume.update({
            where: { id: resume.id },
            data: { cgpa },
        });

        return updatedResume;
    }

    // Add certificate manually or with file upload
    async addCertificate(
        userId: string,
        data: { name: string; companyName: string; platform: string },
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
                filename: file?.filename ?? null,
                filepath: file?.filepath ?? null,
                issuer: data.companyName, // Legacy field compatibility
            },
        });

        // Derive skills from certificate (deterministic scoring based on platform + company)
        await this.deriveSkillsFromCertificate(userId, profile.id, certificate.id, data.name, data.companyName, data.platform);

        return certificate;
    }

    // Legacy method for backward compatibility
    async uploadCertificate(userId: string, filename: string, filepath: string, issuer?: string) {
        return this.addCertificate(
            userId,
            { name: 'Uploaded Certificate', companyName: issuer || 'Unknown', platform: 'Unknown' },
            { filename, filepath }
        );
    }

    // Derive skills from certificate using AI evaluation
    private async deriveSkillsFromCertificate(
        userId: string,
        applicantId: string,
        certificateId: string,
        certName: string,
        companyName: string,
        platform: string
    ) {
        try {
            console.log(`🔍 [DEBUG] Analysis Start for "${certName}"`);
            console.log(`🔍 [DEBUG] Params:`, { platform, companyName, certificateId });

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
                // Individual skill confidence based on skill rating
                const skillConfidence = Math.min(
                    baseConfidence * (aiSkill.skill_rating_Si / 10),
                    0.99
                );

                const skill = await prisma.derivedSkill.create({
                    data: {
                        applicantId,
                        name: aiSkill.skill_name.toLowerCase().replace(/\s+/g, '-'),
                        source: 'certificate-ai',
                        confidence: skillConfidence,
                        certificateId,
                    },
                });

                createdSkills.push(skill);

                // Emit notification for each skill
                eventEmitter.emit('skillDerived', {
                    userId,
                    skillName: aiSkill.skill_name,
                    source: 'certificate-ai',
                    confidence: skillConfidence,
                });
            }

            return createdSkills.length > 0 ? createdSkills[0] : null;
        } catch (error) {
            console.error('AI Evaluation failed, using fallback:', error);

            // Notify user about API failure
            eventEmitter.emit('notification', {
                userId,
                type: 'GENERAL',
                title: 'AI Analysis Unavailable',
                message: `AI service is currently unavailable. Using basic keyword matching for "${certName}".`
            });

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
            // Languages
            'python': 'python', 'javascript': 'javascript', 'typescript': 'typescript', 'java': 'java',
            'c++': 'c++', 'c#': 'c#', 'go': 'go', 'rust': 'rust', 'ruby': 'ruby', 'php': 'php',
            'swift': 'swift', 'kotlin': 'kotlin', 'scala': 'scala', 'r': 'r-lang',

            // Frontend
            'react': 'react', 'angular': 'angular', 'vue': 'vue', 'next': 'nextjs', 'nextjs': 'nextjs',
            'html': 'html', 'css': 'css', 'tailwind': 'tailwind', 'sass': 'sass', 'bootstrap': 'bootstrap',

            // Backend
            'node': 'nodejs', 'nodejs': 'nodejs', 'express': 'express', 'fastapi': 'fastapi',
            'django': 'django', 'flask': 'flask', 'spring': 'spring-boot', 'graphql': 'graphql',
            'rest': 'rest-api', 'dotnet': 'dotnet', 'asp.net': 'asp.net',

            // Cloud & DevOps
            'aws': 'aws', 'azure': 'azure', 'gcp': 'google-cloud', 'docker': 'docker',
            'kubernetes': 'kubernetes', 'k8s': 'kubernetes', 'terraform': 'terraform',
            'jenkins': 'jenkins', 'ci/cd': 'ci-cd', 'github actions': 'github-actions',
            'cloud': 'cloud-computing',

            // Databases
            'postgresql': 'postgresql', 'postgres': 'postgresql', 'mysql': 'mysql',
            'mongodb': 'mongodb', 'redis': 'redis', 'elasticsearch': 'elasticsearch',
            'sql': 'sql', 'nosql': 'nosql', 'oracle': 'oracle',

            // AI/ML
            'machine learning': 'machine-learning', 'deep learning': 'deep-learning',
            'tensorflow': 'tensorflow', 'pytorch': 'pytorch', 'keras': 'keras',
            'scikit': 'scikit-learn', 'nlp': 'nlp', 'vision': 'computer-vision',
            'llm': 'llm', 'gpt': 'gpt', 'openai': 'openai', 'langchain': 'langchain',
            'neural network': 'neural-networks',

            // Data
            'pandas': 'pandas', 'numpy': 'numpy', 'spark': 'spark', 'hadoop': 'hadoop',
            'data analysis': 'data-analysis', 'data science': 'data-science', 'tableau': 'tableau',
            'power bi': 'power-bi',

            // Tools
            'git': 'git', 'linux': 'linux', 'agile': 'agile', 'scrum': 'scrum',
            'jira': 'jira', 'figma': 'figma'
        };

        let confidence = platformConfidence[platform.toLowerCase()] || platformConfidence['default'];
        confidence += companyBonus[companyName.toLowerCase()] || 0;
        confidence = Math.min(confidence, 0.98);

        const matchedSkills: string[] = [];
        for (const [keyword, skill] of Object.entries(skillKeywords)) {
            // Check if certificate name contains the keyword (word boundary check is implicit in includes for now, but good enough)
            if (certName.toLowerCase().includes(keyword)) {
                matchedSkills.push(skill);
            }
        }

        if (matchedSkills.length === 0) {
            matchedSkills.push('general-skills');
        }

        const createdSkills = [];
        for (const skillName of matchedSkills) {
            const skill = await prisma.derivedSkill.create({
                data: {
                    applicantId,
                    name: skillName,
                    source: 'certificate',
                    confidence,
                    certificateId,
                },
            });
            createdSkills.push(skill);

            eventEmitter.emit('skillDerived', {
                userId,
                skillName,
                source: 'certificate',
                confidence,
            });
        }

        return createdSkills[0];
    }

    // Get derived skills
    async getSkills(userId: string) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: {
                derivedSkills: {
                    include: {
                        certificate: {
                            select: {
                                name: true,
                                platform: true
                            }
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

    // Re-evaluate all certificates
    async syncCertificates(userId: string) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: { certificates: true },
        });

        if (!profile) return;

        console.log(`🔄 Syncing ${profile.certificates.length} certificates for user ${userId}`);

        // Re-process each certificate
        for (const cert of profile.certificates) {
            // Delete old derived skills for this cert
            await prisma.derivedSkill.deleteMany({
                where: { certificateId: cert.id }
            });

            // Re-derive
            await this.deriveSkillsFromCertificate(
                userId,
                profile.id,
                cert.id,
                cert.name,
                cert.companyName,
                cert.platform
            );
        }
    }
    // Generate AI Skill Test
    async generateTest(userId: string) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: { derivedSkills: true }
        });

        if (!profile || profile.derivedSkills.length === 0) {
            throw new AppError('No skills found on profile. Please sync certificates first.', 400);
        }

        // Get unique skill names
        const skills = [...new Set(profile.derivedSkills.map(s => s.name))].slice(0, 5); // Limit to top 5 skills to keep prompt small

        return await aiEvaluationService.generateSkillTest(skills);
    }

    // Submit Test and Update Scores
    async submitTest(userId: string, answers: { skill: string, difficulty: string, isCorrect: boolean }[]) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: { derivedSkills: true }
        });

        if (!profile) throw new AppError('Profile not found', 404);

        const updates = [];

        for (const answer of answers) {
            // Find skill in DB
            const dbSkill = profile.derivedSkills.find(s => s.name.toLowerCase() === answer.skill.toLowerCase());
            if (!dbSkill) continue; // Skip if skill logic doesn't match

            let change = 0;
            const diff = answer.difficulty.toLowerCase();

            if (answer.isCorrect) {
                if (diff === 'easy') change = 0.05;
                else if (diff === 'medium') change = 0.10;
                else if (diff === 'hard') change = 0.15;
            } else {
                if (diff === 'easy') change = -0.05;
                else if (diff === 'medium') change = -0.03;
                else if (diff === 'hard') change = -0.02;
            }

            // New confidence calculation (clamped 0 to 1)
            const newConfidence = Math.min(Math.max(dbSkill.confidence + change, 0), 1);

            // Update DB
            const updated = await prisma.derivedSkill.update({
                where: { id: dbSkill.id },
                data: { confidence: newConfidence }
            });
            updates.push({ skill: dbSkill.name, old: dbSkill.confidence, new: newConfidence, change });
        }

        return { message: 'Skills updated successfully', updates };
    }
}

export const applicantService = new ApplicantService();
