import { prisma } from './src/config';

async function checkSkills() {
    try {
        console.log("🔍 Checking Database for Skills...");

        // 1. Get all profiles
        const profiles = await prisma.applicantProfile.findMany({
            include: {
                user: true,
                derivedSkills: true,
                certificates: true
            }
        });

        console.log(`found ${profiles.length} profiles.`);

        for (const p of profiles) {
            console.log(`\n👤 User: ${p.user.name} (${p.user.email})`);
            console.log(`   ID: ${p.userId}`);
            console.log(`   📜 Certificates: ${p.certificates.length}`);
            console.log(`   🧠 Derived Skills: ${p.derivedSkills.length}`);

            if (p.derivedSkills.length > 0) {
                console.log(`   ✅ Skills found: ${p.derivedSkills.map(s => s.name).join(', ')}`);
            } else {
                console.log(`   ❌ NO SKILLS FOUND`);
            }
        }

    } catch (error) {
        console.error("Error checking DB:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSkills();
