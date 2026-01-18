import { prisma } from '../../config';
import { GitHubConnectDto } from '../../shared/types';
import { AppError } from '../../shared/utils';
import { eventEmitter } from '../../shared/events';

interface GitHubRepoData {
    name: string;
    html_url: string;
    updated_at: string;
    language: string | null;
}

interface GitHubReadmeData {
    content: string;
    encoding: string;
}

interface GitHubUser {
    login: string;
}

export class GitHubService {
    private readonly GITHUB_API_BASE = 'https://api.github.com';
    private readonly GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
    private readonly GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
    private readonly GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5173/github/callback';

    // Generate GitHub OAuth URL
    getAuthUrl(): string {
        const params = new URLSearchParams({
            client_id: this.GITHUB_CLIENT_ID,
            redirect_uri: this.GITHUB_CALLBACK_URL,
            scope: 'read:user repo',
            state: Math.random().toString(36).substring(7),
        });
        return `https://github.com/login/oauth/authorize?${params.toString()}`;
    }

    // Handle OAuth callback - exchange code for access token
    async handleOAuthCallback(userId: string, code: string) {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: this.GITHUB_CLIENT_ID,
                client_secret: this.GITHUB_CLIENT_SECRET,
                code: code,
            }),
        });

        const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };

        if (tokenData.error || !tokenData.access_token) {
            throw new AppError('Failed to exchange code for access token', 400);
        }

        // Use the access token to fetch repos (reuse existing connect logic)
        return this.connect(userId, { accessToken: tokenData.access_token });
    }

    // Connect GitHub and fetch repos
    async connect(userId: string, data: GitHubConnectDto) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new AppError('Applicant profile not found. Create a profile first.', 404);
        }

        // Fetch repos from GitHub
        const repos = await this.fetchRepos(data.accessToken);

        // Store repos in database
        for (const repo of repos) {
            const readme = await this.fetchReadme(data.accessToken, repo.name);

            await prisma.gitHubRepo.upsert({
                where: {
                    id: `${profile.id}-${repo.name}`,
                },
                create: {
                    applicantId: profile.id,
                    repoName: repo.name,
                    repoUrl: repo.html_url,
                    lastUpdated: new Date(repo.updated_at),
                    readme: readme,
                    languages: repo.language ? [repo.language] : [],
                },
                update: {
                    lastUpdated: new Date(repo.updated_at),
                    readme: readme,
                    languages: repo.language ? [repo.language] : [],
                    fetchedAt: new Date(),
                },
            });

            // Derive skills from GitHub languages
            if (repo.language) {
                await this.deriveSkillFromLanguage(userId, profile.id, repo.language, repo.updated_at);
            }
        }

        return {
            message: 'GitHub connected successfully',
            reposCount: repos.length,
        };
    }

    // Fetch repos from GitHub API
    private async fetchRepos(accessToken: string): Promise<GitHubRepoData[]> {
        try {
            const response = await fetch(`${this.GITHUB_API_BASE}/user/repos?sort=updated&per_page=20`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new AppError('Invalid GitHub access token', 401);
                }
                throw new AppError('Failed to fetch GitHub repositories', 500);
            }

            return await response.json() as GitHubRepoData[];
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to connect to GitHub', 500);
        }
    }

    // Fetch README content for a repo
    private async fetchReadme(accessToken: string, repoName: string): Promise<string | null> {
        try {
            // First get user info
            const userResponse = await fetch(`${this.GITHUB_API_BASE}/user`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (!userResponse.ok) return null;
            const userData = await userResponse.json() as GitHubUser;

            // Fetch README
            const response = await fetch(`${this.GITHUB_API_BASE}/repos/${userData.login}/${repoName}/readme`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (!response.ok) return null;

            const data = await response.json() as GitHubReadmeData;

            // Decode base64 content
            if (data.encoding === 'base64') {
                return Buffer.from(data.content, 'base64').toString('utf-8');
            }

            return data.content;
        } catch {
            return null;
        }
    }

    // Derive skill from programming language with deterministic confidence
    private async deriveSkillFromLanguage(userId: string, applicantId: string, language: string, lastUpdated: string) {
        const normalizedLang = language.toLowerCase();

        // Check if skill already exists
        const existingSkill = await prisma.derivedSkill.findFirst({
            where: {
                applicantId,
                name: normalizedLang,
                source: 'github',
            },
        });

        if (existingSkill) return;

        // Calculate confidence based on repo activity
        const daysSinceUpdate = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24));

        // Confidence decreases with age: recent repos = higher confidence
        let confidence = 0.90;
        if (daysSinceUpdate > 30) confidence = 0.80;
        if (daysSinceUpdate > 90) confidence = 0.70;
        if (daysSinceUpdate > 180) confidence = 0.60;
        if (daysSinceUpdate > 365) confidence = 0.50;

        const skill = await prisma.derivedSkill.create({
            data: {
                applicantId,
                name: normalizedLang,
                source: 'github',
                confidence,
            },
        });

        // Emit notification
        eventEmitter.emit('skillDerived', {
            userId,
            skillName: normalizedLang,
            source: 'github',
            confidence,
        });

        return skill;
    }

    // Get stored repos for a user
    async getRepos(userId: string) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: { githubRepos: true },
        });

        if (!profile) {
            throw new AppError('Applicant profile not found', 404);
        }

        return profile.githubRepos;
    }

    // Disconnect GitHub - remove all repos
    async disconnect(userId: string) {
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new AppError('Applicant profile not found', 404);
        }

        // Delete all GitHub repos for this applicant
        await prisma.gitHubRepo.deleteMany({
            where: {
                applicantId: profile.id,
            },
        });

        return { message: 'GitHub disconnected successfully' };
    }
}

export const githubService = new GitHubService();
