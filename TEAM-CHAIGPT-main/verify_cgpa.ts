
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkResumeData() {
    console.log("🔍 Checking Resume table structure and data...");

    try {
        const resumes = await prisma.resume.findMany({
            take: 5,
            orderBy: { uploadedAt: 'desc' },
            select: {
                id: true,
                filename: true,
                cgpa: true, // Querying this field verifies it exists in the schema
                uploadedAt: true
            }
        });

        console.log(`\n✅ Found ${resumes.length} resumes.`);
        console.log("---------------------------------------------------");
        resumes.forEach(r => {
            console.log(`📄 File: ${r.filename}`);
            console.log(`   CGPA: ${r.cgpa || "NULL (Not extracted)"}`);
            console.log(`   Time: ${r.uploadedAt}`);
            console.log("---------------------------------------------------");
        });

    } catch (error) {
        console.error("\n❌ Error querying database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkResumeData();
