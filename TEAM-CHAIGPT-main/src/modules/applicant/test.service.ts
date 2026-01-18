import { prisma } from '../../config';
import { AppError } from '../../shared/utils';
import { aiEvaluationService } from '../../services';

export class TestService {
    async generateTest(userId: string) {
        // 1. Fetch skills
        const skills = await prisma.derivedSkill.findMany({
            where: { applicant: { userId } },
            select: { name: true, confidence: true }
        });

        if (skills.length === 0) {
            throw new AppError('No skills found to test', 400);
        }

        // De-duplicate skill names
        const uniqueSkillNames = Array.from(new Set(skills.map(s => s.name)));

        // 2. Generate questions
        const questions = await aiEvaluationService.generateSkillQuestions(uniqueSkillNames);

        // 3. Create Test Record
        const test = await prisma.skillTest.create({
            data: {
                userId,
                status: 'IN_PROGRESS',
                questions: {
                    create: questions.map((q: any) => ({
                        skillName: q.skill,
                        questionText: q.question,
                        options: q.options,
                        correctAnswer: q.correct_answer,
                        difficulty: q.difficulty.toUpperCase()
                    }))
                }
            },
            include: { questions: true }
        });

        // 4. Return questions (hide correct answer)
        return {
            testId: test.id,
            questions: test.questions.map(q => ({
                id: q.id,
                skill: q.skillName,
                question: q.questionText,
                options: q.options,
                difficulty: q.difficulty
            }))
        };
    }

    async submitTest(userId: string, testId: string, answers: { questionId: string; answer: string }[]) {
        const test = await prisma.skillTest.findUnique({
            where: { id: testId },
            include: { questions: true }
        });

        if (!test || test.userId !== userId) {
            throw new AppError('Test not found', 404);
        }

        if (test.status === 'COMPLETED') {
            throw new AppError('Test already completed', 400);
        }

        let totalCorrect = 0;
        const skillUpdates: Record<string, { current: number; delta: number }> = {};

        // Fetch current skills to apply updates
        const userSkills = await prisma.derivedSkill.findMany({
            where: { applicant: { userId } }
        });

        // Create a map to find skill records easily. 
        // Note: A user might have multiple 'DerivedDetail' entries for same skill name if from different sources.
        // We should update ALL of them or just one?
        // User says "update only skill_score". 
        // Ideally we update all instances of that skill name for the user.

        // Process answers
        for (const q of test.questions) {
            const userAnswer = answers.find(a => a.questionId === q.id)?.answer;
            const isCorrect = userAnswer === q.correctAnswer;

            // Log answer to DB
            await prisma.skillTestQuestion.update({
                where: { id: q.id },
                data: { userAnswer, isCorrect }
            });

            if (isCorrect) totalCorrect++;

            // Calculate Score Delta logic
            // We use the 'average' confidence of that skill name? Or just pick one?
            // Let's find all skills with that name
            const matchingSkills = userSkills.filter(s => s.name === q.skillName);
            if (matchingSkills.length === 0) continue;

            // Use the max confidence as baseline? Or average?
            // "1 - current_skill / 10".
            // Let's take the first one found or average.
            // Simplest: Update EACH record individually? No, that multiplies impact.
            // Logic: Compute delta based on average, apply to all.

            const avgConfidence = matchingSkills.reduce((sum, s) => sum + s.confidence, 0) / matchingSkills.length;
            const currentScore = avgConfidence * 10;

            let delta = 0;
            if (isCorrect) {
                const base = q.difficulty === 'EASY' ? 0.05 : q.difficulty === 'MEDIUM' ? 0.12 : 0.25;
                delta = base * (1 - currentScore / 10);
            } else {
                const base = q.difficulty === 'EASY' ? 0.03 : q.difficulty === 'MEDIUM' ? 0.07 : 0.12;
                delta = - (base * (currentScore / 10));
            }

            if (!skillUpdates[q.skillName]) skillUpdates[q.skillName] = { current: currentScore, delta: 0 };
            skillUpdates[q.skillName].delta += delta;
        }

        // Apply Caps and Update DB
        const results = [];
        for (const [skillName, data] of Object.entries(skillUpdates)) {
            // Cap delta per test per skill
            let finalDelta = data.delta;
            if (finalDelta > 0.6) finalDelta = 0.6;
            if (finalDelta < -0.4) finalDelta = -0.4;

            let newScore = data.current + finalDelta;
            if (newScore > 10) newScore = 10;
            if (newScore < 0) newScore = 0;

            // Update DB Records
            await prisma.derivedSkill.updateMany({
                where: {
                    applicant: { userId },
                    name: skillName
                },
                data: {
                    confidence: newScore / 10,
                    lastTestedAt: new Date()
                }
            });

            results.push({
                skill: skillName,
                prevScore: Number(data.current.toFixed(2)),
                newScore: Number(newScore.toFixed(2)),
                delta: Number(finalDelta.toFixed(2))
            });
        }

        // Close Test
        await prisma.skillTest.update({
            where: { id: testId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                resultSummary: JSON.stringify(results)
            }
        });

        return {
            testId,
            score: totalCorrect,
            total: test.questions.length,
            skillUpdates: results
        };
    }
}
