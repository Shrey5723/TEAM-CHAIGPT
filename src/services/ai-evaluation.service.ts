import Groq from "groq-sdk";

interface SkillRating {
    skill_name: string;
    skill_rating_Si: number;
}

interface CourseEvaluationResult {
    course_name: string;
    platform: string;
    provider: string;
    overall_rating_R: number;
    real_life_application_A: number;
    skills: SkillRating[];
    n: number;
    evaluation_notes: string;
    final_score: number;
}

interface SimpleEvaluationResult {
    course_name: string;
    platform: string;
    provider: string;
    final_score_using_algo: number;
}

const EVALUATION_PROMPT = `You are an expert course evaluator and industry skill analyst.
Your task is to evaluate an online course.

For the given course, generate ONLY JSON containing the following:

1. Overall Course Value — R (0–10)
Rate based on industry relevance, curriculum depth, and provider reputation.

2. Skills Offered — Sᵢ (0–10 per skill)
Identify core skills actually taught. Rate each skill by depth and utility.
Avoid vague terms like "Success". Focus on hard skills (e.g., Python, React, Project Management).

3. Real-Life Application Score — A (0–10)
Rate based on hands-on assignments and practical projects.

Output format (JSON ONLY, no markdown):
{
  "course_name": "string",
  "platform": "string",
  "provider": "string",
  "overall_rating_R": number,
  "real_life_application_A": number,
  "skills": [
    { "skill_name": "string", "skill_rating_Si": number }
  ],
  "n": number,
  "evaluation_notes": "concise justification"
}

STRICT RULES:
- Return ONLY valid JSON.
- No markdown formatting (like \`\`\`json).
- No extra text.
`;

export class AIEvaluationService {
    private groq: Groq;
    private modelName = 'llama-3.3-70b-versatile'; // Updated to latest supported model

    constructor() {
        const apiKey = process.env.GROQ_API_KEY || '';
        this.groq = new Groq({ apiKey });
    }

    private calculateFinalScore(R: number, A: number, skills: SkillRating[]): number {
        const n = skills.length;
        if (n === 0) return 0;

        const sumSi = skills.reduce((sum, skill) => sum + skill.skill_rating_Si, 0);
        const skillFactor = sumSi / (n * 10);
        const rawScore = (R * A) * skillFactor;

        return Math.round(rawScore * 100) / 100;
    }

    private async callGroq(prompt: string): Promise<string> {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not set');
        }

        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: "system", content: EVALUATION_PROMPT },
                    { role: "user", content: prompt }
                ],
                model: this.modelName,
                temperature: 0.3,
                max_tokens: 1024,
                response_format: { type: "json_object" }
            });

            return completion.choices[0]?.message?.content || "";
        } catch (error: any) {
            console.error('Groq API Error:', error);
            throw error;
        }
    }

    async evaluateCourse(
        courseName: string,
        platform: string,
        provider: string
    ): Promise<CourseEvaluationResult> {
        try {
            const userPrompt = `
Course Name: "${courseName}"
Platform: "${platform}"
Provider: "${provider}"
`;
            const jsonText = await this.callGroq(userPrompt);
            const parsed = JSON.parse(jsonText);

            const finalScore = this.calculateFinalScore(
                parsed.overall_rating_R,
                parsed.real_life_application_A,
                parsed.skills
            );

            return {
                ...parsed,
                final_score: finalScore
            };
        } catch (error) {
            console.error('AI Evaluation Failed:', error);
            return this.getFallbackEvaluation(courseName, platform, provider);
        }
    }

    async getSimpleScore(
        courseName: string,
        platform: string,
        provider: string
    ): Promise<SimpleEvaluationResult> {
        const fullResult = await this.evaluateCourse(courseName, platform, provider);
        return {
            course_name: fullResult.course_name,
            platform: fullResult.platform,
            provider: fullResult.provider,
            final_score_using_algo: fullResult.final_score
        };
    }

    scoreToConfidence(finalScore: number): number {
        return Math.min(finalScore / 100, 0.99);
    }

    private getFallbackEvaluation(
        courseName: string,
        platform: string,
        provider: string
    ): CourseEvaluationResult {
        // Deterministic fallback
        const platformScores: Record<string, number> = {
            'coursera': 7.5, 'udemy': 6.0, 'edx': 7.5,
            'linkedin learning': 6.5, 'udacity': 7.0, 'pluralsight': 6.5, 'default': 5.5
        };

        const R = platformScores[platform.toLowerCase()] || platformScores['default'];
        const A = 6.5;
        const skills: SkillRating[] = [{ skill_name: 'general-skills', skill_rating_Si: 6.5 }];

        return {
            course_name: courseName,
            platform,
            provider,
            overall_rating_R: R,
            real_life_application_A: A,
            skills,
            n: 1,
            evaluation_notes: 'Fallback evaluation - AI unavailable',
            final_score: this.calculateFinalScore(R, A, skills)
        };
    }

    async extractResumeDetails(resumeText: string): Promise<{ cgpa: string | null }> {
        try {
            const prompt = `Extract the CGPA/GPA from the resume text.
Resume Content:
${resumeText.slice(0, 4000)}

Return JSON: { "cgpa": "string or null" }`;

            const jsonText = await this.callGroq(prompt);
            const parsed = JSON.parse(jsonText);
            return { cgpa: parsed.cgpa || null };
        } catch (error) {
            console.error('Resume Extraction Error:', error);
            return { cgpa: null };
        }
    }

    async generateSkillTest(skills: string[]): Promise<any> {
        try {
            const prompt = `
            Create a technical multiple-choice skill test based on these skills: ${skills.join(', ')}.
            
            Generate exactly 15 questions with this distribution:
            - 7 Easy
            - 5 Medium
            - 3 Hard
            
            For each question, provide:
            - question text
            - 4 options
            - correct option index (0-3)
            - difficulty ("easy", "medium", "hard")
            - associated skill (must match one of: ${skills.join(', ')})
            
            Return JSON structure:
            {
                "questions": [
                    {
                        "question": "string",
                        "options": ["string", "string", "string", "string"],
                        "correctIndex": number,
                        "difficulty": "string",
                        "skill": "string"
                    }
                ]
            }
            `;

            const jsonText = await this.callGroq(prompt);
            return JSON.parse(jsonText);
        } catch (error) {
            console.error('Quiz Generation Error:', error);
            // Fallback mock quiz if AI fails
            return {
                questions: [
                    {
                        question: "Failed to generate AI quiz. Please try again.",
                        options: ["OK", "Retry", "Error", "Fail"],
                        correctIndex: 0,
                        difficulty: "easy",
                        skill: "general-skills"
                    }
                ]
            };
        }
    }
}

export const aiEvaluationService = new AIEvaluationService();
