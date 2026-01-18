import { UserRole, Sector, JobType } from '@prisma/client';

// Extend Express Request to include authenticated user
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

export interface AuthPayload {
    id: string;
    email: string;
    role: UserRole;
}

export interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

// Auth DTOs
export interface RegisterDto {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    dob?: string;
    sector?: Sector;
}

export interface LoginDto {
    email: string;
    password: string;
}

// Applicant DTOs
export interface CreateApplicantProfileDto {
    linkedInUrl?: string;
    courseraUrl?: string;
    bio?: string;
}

export interface UpdateApplicantProfileDto {
    linkedInUrl?: string;
    courseraUrl?: string;
    bio?: string;
}

// Corporate Job DTOs
export interface SkillWeight {
    name: string;
    weight: number;
}

export interface CreateCorporateJobDto {
    title: string;
    role: string;
    description?: string;
    requiredSkills: SkillWeight[];
    jobType: JobType;
    location?: string;
    salary?: string;
}

export interface UpdateCorporateJobDto {
    title?: string;
    role?: string;
    description?: string;
    requiredSkills?: SkillWeight[];
    jobType?: JobType;
    location?: string;
    salary?: string;
    isActive?: boolean;
}

// GitHub DTOs
export interface GitHubConnectDto {
    accessToken: string;
}

// Matching result
export interface JobMatchResult {
    jobId: string;
    matchScore: number;
    matchedSkills: string[];
    totalWeight: number;
    matchedWeight: number;
}

export interface ApplicantMatchResult {
    id: string;
    userId: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    matchScore: number;
    matchedSkills: string[];
    totalWeight: number;
    matchedWeight: number;
    derivedSkills?: any[];
}
