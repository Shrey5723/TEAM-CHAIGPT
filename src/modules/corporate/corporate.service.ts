import { prisma } from '../../config';
import { CreateCorporateJobDto, UpdateCorporateJobDto, SkillWeight, JobMatchResult, ApplicantMatchResult } from '../../shared/types';
import { AppError } from '../../shared/utils';
import { eventEmitter } from '../../shared/events';
import { JobType } from '@prisma/client';

export class CorporateService {
    // Create a corporate job
    async createJob(hirerId: string, data: CreateCorporateJobDto) {
        const job = await prisma.corporateJob.create({
            data: {
                hirerId,
                title: data.title,
                role: data.role,
                description: data.description,
                requiredSkills: data.requiredSkills as unknown as any,
                jobType: data.jobType,
                location: data.location,
                salary: data.salary,
            },
            include: {
                hirer: { select: { id: true, name: true, email: true } },
            },
        });

        // Notify matching applicants
        await this.notifyMatchingApplicants(job);

        return job;
    }

    // Get all jobs with optional filters
    async getJobs(filters: { jobType?: string; location?: string; isActive?: boolean }) {
        const jobs = await prisma.corporateJob.findMany({
            where: {
                jobType: filters.jobType as JobType,
                location: filters.location ? { contains: filters.location, mode: 'insensitive' } : undefined,
                isActive: filters.isActive !== undefined ? filters.isActive : true,
            },
            include: {
                hirer: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return jobs;
    }

    // Get job by ID
    async getJobById(jobId: string) {
        const job = await prisma.corporateJob.findUnique({
            where: { id: jobId },
            include: {
                hirer: { select: { id: true, name: true, email: true } },
            },
        });

        if (!job) {
            throw new AppError('Job not found', 404);
        }

        return job;
    }

    // Update job
    async updateJob(jobId: string, hirerId: string, data: UpdateCorporateJobDto) {
        const job = await prisma.corporateJob.findFirst({
            where: { id: jobId, hirerId },
        });

        if (!job) {
            throw new AppError('Job not found or not owned by this hirer', 404);
        }

        const updatedJob = await prisma.corporateJob.update({
            where: { id: jobId },
            data: {
                title: data.title,
                role: data.role,
                description: data.description,
                requiredSkills: data.requiredSkills as unknown as any,
                jobType: data.jobType,
                location: data.location,
                salary: data.salary,
                isActive: data.isActive,
            },
            include: {
                hirer: { select: { id: true, name: true } },
            },
        });

        return updatedJob;
    }

    // Get recommended jobs for an applicant using weighted skill matching
    async getRecommendedJobs(applicantUserId: string) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId: applicantUserId },
            include: { derivedSkills: true },
        });

        if (!profile) {
            throw new AppError('Applicant profile not found', 404);
        }

        const applicantSkills = profile.derivedSkills.map(s => s.name.toLowerCase());

        const jobs = await prisma.corporateJob.findMany({
            where: { isActive: true },
            include: {
                hirer: { select: { id: true, name: true } },
            },
        });

        const jobsWithScore: (typeof jobs[0] & JobMatchResult)[] = jobs.map(job => {
            const requiredSkills = job.requiredSkills as unknown as SkillWeight[];
            const { matchScore, matchedSkills, totalWeight, matchedWeight } = this.calculateMatchScore(applicantSkills, requiredSkills);

            return {
                ...job,
                jobId: job.id,
                matchScore,
                matchedSkills,
                totalWeight,
                matchedWeight,
            };
        });

        // Sort by match score descending
        return jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);
    }

    // Get recommended applicants for a job using weighted skill matching
    async getRecommendedApplicants(jobId: string, hirerId: string) {
        const job = await prisma.corporateJob.findFirst({
            where: { id: jobId, hirerId },
        });

        if (!job) {
            throw new AppError('Job not found or not owned by this hirer', 404);
        }

        const requiredSkills = job.requiredSkills as unknown as SkillWeight[];

        const applicants = await prisma.applicantProfile.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                derivedSkills: true,
            },
        });

        const applicantsWithScore: ApplicantMatchResult[] = applicants.map(applicant => {
            const applicantSkills = applicant.derivedSkills.map(s => s.name.toLowerCase());
            const { matchScore, matchedSkills, totalWeight, matchedWeight } = this.calculateMatchScore(applicantSkills, requiredSkills);

            return {
                applicantId: applicant.id,
                userId: applicant.user.id,
                name: applicant.user.name,
                matchScore,
                matchedSkills,
                totalWeight,
                matchedWeight,
            };
        });

        // Sort by match score descending and filter for meaningful matches
        return applicantsWithScore
            .filter(a => a.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);
    }

    // Calculate weighted match score
    private calculateMatchScore(applicantSkills: string[], requiredSkills: SkillWeight[]): {
        matchScore: number;
        matchedSkills: string[];
        totalWeight: number;
        matchedWeight: number;
    } {
        if (requiredSkills.length === 0) {
            return { matchScore: 0, matchedSkills: [], totalWeight: 0, matchedWeight: 0 };
        }

        const totalWeight = requiredSkills.reduce((sum, skill) => sum + skill.weight, 0);
        let matchedWeight = 0;
        const matchedSkills: string[] = [];

        for (const required of requiredSkills) {
            if (applicantSkills.includes(required.name.toLowerCase())) {
                matchedWeight += required.weight;
                matchedSkills.push(required.name);
            }
        }

        const matchScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) / 100 : 0;

        return { matchScore, matchedSkills, totalWeight, matchedWeight };
    }

    // Notify applicants when a matching job is posted
    private async notifyMatchingApplicants(job: any) {
        const requiredSkills = job.requiredSkills as unknown as SkillWeight[];
        const skillNames = requiredSkills.map(s => s.name.toLowerCase());

        const matchingProfiles = await prisma.applicantProfile.findMany({
            where: {
                derivedSkills: {
                    some: {
                        name: { in: skillNames },
                    },
                },
            },
            include: {
                derivedSkills: true,
            },
        });

        for (const profile of matchingProfiles) {
            const applicantSkills = profile.derivedSkills.map(s => s.name.toLowerCase());
            const { matchScore } = this.calculateMatchScore(applicantSkills, requiredSkills);

            // Only notify if match score > 0.7
            if (matchScore > 0.7) {
                eventEmitter.emit('jobMatch', {
                    userId: profile.userId,
                    jobId: job.id,
                    jobTitle: job.title,
                    matchScore,
                    hirerName: job.hirer?.name || 'Unknown',
                });
            }
        }
    }

    // Get jobs created by a hirer
    async getHirerJobs(hirerId: string) {
        const jobs = await prisma.corporateJob.findMany({
            where: { hirerId },
            orderBy: { createdAt: 'desc' },
        });

        return jobs;
    }
}

export const corporateService = new CorporateService();
