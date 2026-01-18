import { PrismaClient, UserRole, Sector, JobType, NotificationType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed for Corporate Sector...\n');

    // Clear existing data
    await prisma.notification.deleteMany();
    await prisma.derivedSkill.deleteMany();
    await prisma.gitHubRepo.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.resume.deleteMany();
    await prisma.applicantProfile.deleteMany();
    await prisma.corporateJob.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Cleared existing data\n');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Applicants
    const applicants = await Promise.all([
        prisma.user.create({
            data: {
                email: 'john.developer@example.com',
                password: hashedPassword,
                name: 'John Developer',
                role: UserRole.APPLICANT,
                dob: new Date('1995-05-15'),
                sector: Sector.CORPORATE,
            },
        }),
        prisma.user.create({
            data: {
                email: 'priya.engineer@example.com',
                password: hashedPassword,
                name: 'Priya Engineer',
                role: UserRole.APPLICANT,
                dob: new Date('1998-08-22'),
                sector: Sector.CORPORATE,
            },
        }),
    ]);

    console.log(`✅ Created ${applicants.length} applicants\n`);

    // Create Hirers
    const hirers = await Promise.all([
        prisma.user.create({
            data: {
                email: 'hr@techcorp.com',
                password: hashedPassword,
                name: 'TechCorp HR',
                role: UserRole.HIRER,
                sector: Sector.CORPORATE,
            },
        }),
        prisma.user.create({
            data: {
                email: 'hiring@startup.io',
                password: hashedPassword,
                name: 'Startup Hiring',
                role: UserRole.HIRER,
                sector: Sector.CORPORATE,
            },
        }),
    ]);

    console.log(`✅ Created ${hirers.length} hirers\n`);

    // Create Applicant Profiles
    const profiles = await Promise.all([
        prisma.applicantProfile.create({
            data: {
                userId: applicants[0].id,
                linkedInUrl: 'https://linkedin.com/in/johndev',
                courseraUrl: 'https://coursera.org/user/johndev',
                bio: 'Full-stack developer with 5 years experience in Node.js and React',
            },
        }),
        prisma.applicantProfile.create({
            data: {
                userId: applicants[1].id,
                linkedInUrl: 'https://linkedin.com/in/priyaeng',
                bio: 'Backend engineer passionate about scalable systems',
            },
        }),
    ]);

    console.log(`✅ Created ${profiles.length} applicant profiles\n`);

    // Create Derived Skills
    const skills = await Promise.all([
        // John's skills
        prisma.derivedSkill.create({
            data: {
                applicantId: profiles[0].id,
                name: 'javascript',
                source: 'certificate',
                confidence: 0.90,
            },
        }),
        prisma.derivedSkill.create({
            data: {
                applicantId: profiles[0].id,
                name: 'typescript',
                source: 'github',
                confidence: 0.85,
            },
        }),
        prisma.derivedSkill.create({
            data: {
                applicantId: profiles[0].id,
                name: 'nodejs',
                source: 'github',
                confidence: 0.88,
            },
        }),
        prisma.derivedSkill.create({
            data: {
                applicantId: profiles[0].id,
                name: 'react',
                source: 'certificate',
                confidence: 0.82,
            },
        }),
        // Priya's skills
        prisma.derivedSkill.create({
            data: {
                applicantId: profiles[1].id,
                name: 'python',
                source: 'github',
                confidence: 0.90,
            },
        }),
        prisma.derivedSkill.create({
            data: {
                applicantId: profiles[1].id,
                name: 'nodejs',
                source: 'certificate',
                confidence: 0.75,
            },
        }),
        prisma.derivedSkill.create({
            data: {
                applicantId: profiles[1].id,
                name: 'postgresql',
                source: 'github',
                confidence: 0.80,
            },
        }),
    ]);

    console.log(`✅ Created ${skills.length} derived skills\n`);

    // Create Corporate Jobs
    const jobs = await Promise.all([
        prisma.corporateJob.create({
            data: {
                hirerId: hirers[0].id,
                title: 'Senior Backend Developer',
                role: 'Backend',
                description: 'Build scalable APIs and microservices using Node.js and TypeScript',
                requiredSkills: [
                    { name: 'nodejs', weight: 0.4 },
                    { name: 'typescript', weight: 0.3 },
                    { name: 'postgresql', weight: 0.2 },
                    { name: 'docker', weight: 0.1 },
                ],
                jobType: JobType.FULL_TIME,
                location: 'Bangalore, India',
                salary: '₹18-25 LPA',
            },
        }),
        prisma.corporateJob.create({
            data: {
                hirerId: hirers[0].id,
                title: 'Full Stack Developer',
                role: 'Full Stack',
                description: 'Work on React frontend and Node.js backend',
                requiredSkills: [
                    { name: 'react', weight: 0.35 },
                    { name: 'nodejs', weight: 0.35 },
                    { name: 'javascript', weight: 0.2 },
                    { name: 'mongodb', weight: 0.1 },
                ],
                jobType: JobType.FULL_TIME,
                location: 'Mumbai, India',
                salary: '₹12-18 LPA',
            },
        }),
        prisma.corporateJob.create({
            data: {
                hirerId: hirers[1].id,
                title: 'Python Backend Engineer',
                role: 'Backend',
                description: 'Build data pipelines and APIs',
                requiredSkills: [
                    { name: 'python', weight: 0.5 },
                    { name: 'postgresql', weight: 0.3 },
                    { name: 'docker', weight: 0.2 },
                ],
                jobType: JobType.CONTRACT,
                location: 'Remote',
                salary: '₹10-15 LPA',
            },
        }),
    ]);

    console.log(`✅ Created ${jobs.length} corporate jobs\n`);

    // Create sample notifications
    const notifications = await Promise.all([
        prisma.notification.create({
            data: {
                userId: applicants[0].id,
                type: NotificationType.JOB_MATCH,
                title: 'New Job Match Found!',
                message: 'You matched 90% with "Senior Backend Developer" at TechCorp',
                metadata: { jobId: jobs[0].id, matchScore: 0.9 },
            },
        }),
        prisma.notification.create({
            data: {
                userId: applicants[1].id,
                type: NotificationType.SKILL_DERIVED,
                title: 'New Skill Derived!',
                message: 'Skill "python" derived from GitHub with 90% confidence',
                metadata: { skill: 'python', source: 'github', confidence: 0.9 },
            },
        }),
    ]);

    console.log(`✅ Created ${notifications.length} notifications\n`);

    console.log('🎉 Database seeded successfully!\n');
    console.log('📧 Sample login credentials:');
    console.log('   Applicant: john.developer@example.com / password123');
    console.log('   Applicant: priya.engineer@example.com / password123');
    console.log('   Hirer: hr@techcorp.com / password123');
    console.log('   Hirer: hiring@startup.io / password123');
    console.log('');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
