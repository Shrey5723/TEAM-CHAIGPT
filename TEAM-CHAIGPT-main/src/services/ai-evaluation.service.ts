
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
    final_score: number; // Calculated using the formula
}

interface SimpleEvaluationResult {
    course_name: string;
    platform: string;
    provider: string;
    final_score_using_algo: number;
}

const EVALUATION_PROMPT = `You are an expert course evaluator and industry skill analyst.
Your task is to evaluate an online course using:

* Course name
* Platform
* Course provider / company (e.g., OpenAI, DeepLearning.AI, Google, Meta)

You must base your analysis on:

* Public knowledge of the course or similar courses
* Typical syllabus structure
* Provider credibility
* Platform standards
* Industry relevance

Be **critical and realistic**, not generous.
If exact details are unavailable, make **reasonable inferences** from comparable courses.

### **TASK REQUIREMENTS (STRICT)**

For the given course, generate **ONLY JSON** containing the following:

### **1️⃣ Overall Course Value — R (0–10)**

Rate the course based on:
* Industry relevance
* Curriculum depth
* Skill usefulness
* Provider reputation
* Platform quality

Decimals allowed.

### **2️⃣ Skills Offered — Sᵢ (0–10 per skill)**

* Identify **multiple granular, specific skills actually taught** (e.g., "PyTorch", "Model Training", "Backpropagation" instead of just "Deep Learning")
* **LIST ALL RELEVANT SKILLS** (aim for 5-10 specific skills).
* Rate each skill by:
  * Depth
  * Practical clarity
  * Industry usability
* Avoid vague or marketing terms

### **3️⃣ Real-Life Application Score — A (0–10)**

Rate based on:
* Hands-on assignments
* Real implementations
* Projects or deployments
* Practical applicability

Penalize theory-heavy courses.

### **MANDATORY OUTPUT FORMAT (JSON ONLY)**
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
  "evaluation_notes": "concise factual justification (1–2 lines)"
}

### **STRICT RULES**

* ❌ No markdown
* ❌ No explanation outside JSON
* ❌ No emojis
* ❌ No marketing language
* ✅ Be analytical and neutral
* ✅ Beginner courses must not score high by default`;

export class AIEvaluationService {
    // Models configuration
    private primaryModelId = 'google/gemini-3-pro-preview';
    private fallbackModelId = 'google/gemini-2.0-flash-exp:free';

    // Track which model is currently failing to avoid retrying bad models immediately (optional simple state)
    private useFallback = false;

    private getApiKey(): string {
        return process.env.OPENROUTER_API_KEY || '';
    }

    /**
     * Calculate final score using the formula:
     * V_org = (R × A) × (ΣSᵢ / (n × 10))
     * Returns a score from 0-100
     */
    private calculateFinalScore(R: number, A: number, skills: SkillRating[]): number {
        const n = skills.length;
        if (n === 0) return 0;

        const sumSi = skills.reduce((sum, skill) => sum + skill.skill_rating_Si, 0);
        const skillFactor = sumSi / (n * 10);
        const rawScore = (R * A) * skillFactor;

        // Normalize to 0-100 scale (raw max is 100 when R=10, A=10, skillFactor=1)
        return Math.round(rawScore * 100) / 100;
    }

    /**
     * Call OpenRouter API with fallback logic
     */
    private async callWithFallback(messages: any[]): Promise<string> {
        const apiKey = this.getApiKey();
        if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

        // Try primary model first (unless we already switched to fallback permanently for this instance)
        // ideally we reset for each request or keep it? User said "if this model will not work... switch".
        // We'll try primary first every time unless we want to be sticky. Let's try primary first.
        let currentModel = this.primaryModelId;

        try {
            return await this.makeOpenRouterRequest(apiKey, currentModel, messages);
        } catch (error: any) {
            console.warn(`⚠️ Primary model ${currentModel} failed: ${error.message}. Switching to fallback...`);

            // Switch to fallback
            currentModel = this.fallbackModelId;
            try {
                return await this.makeOpenRouterRequest(apiKey, currentModel, messages);
            } catch (fallbackError: any) {
                console.error(`❌ Fallback model ${currentModel} also failed: ${fallbackError.message}`);
                throw fallbackError;
            }
        }
    }

    private async makeOpenRouterRequest(apiKey: string, model: string, messages: any[]): Promise<string> {
        console.log(`🤖 Using OpenRouter model: ${model}`);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                // "HTTP-Referer": "http://localhost:3000", // Optional
                // "X-Title": "Skill Intelligence App", // Optional
            },
            body: JSON.stringify({
                "model": model,
                "messages": messages,
                "max_tokens": 2000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as any;
        return data.choices?.[0]?.message?.content || "";
    }

    /**
     * Evaluate a course using AI
     */
    async evaluateCourse(
        courseName: string,
        platform: string,
        provider: string
    ): Promise<CourseEvaluationResult> {
        try {
            const userPrompt = `Course Name: "${courseName}" Platform: "${platform}" Provider / Company: "${provider}"`;

            const messages = [
                { role: "system", content: EVALUATION_PROMPT },
                { role: "user", content: userPrompt }
            ];

            const text = await this.callWithFallback(messages);

            // Clean up response - extract JSON block if present
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? jsonMatch[0] : text.trim();

            const parsed = JSON.parse(jsonText);

            // Calculate final score using the formula
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
            console.error('AI Evaluation Error:', error);
            // Fallback to deterministic scoring
            return this.getFallbackEvaluation(courseName, platform, provider);
        }
    }

    /**
     * Get simplified score only (for database storage)
     */
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

    /**
     * Convert final score (0-100) to confidence (0-1)
     */
    scoreToConfidence(finalScore: number): number {
        return Math.min(finalScore / 100, 0.99);
    }

    /**
     * Fallback deterministic evaluation when AI fails
     */
    private getFallbackEvaluation(
        courseName: string,
        platform: string,
        provider: string
    ): CourseEvaluationResult {
        // Platform-based base score
        const platformScores: Record<string, number> = {
            'coursera': 7.5,
            'udemy': 6.0,
            'edx': 7.5,
            'linkedin learning': 6.5,
            'udacity': 7.0,
            'pluralsight': 6.5,
            'default': 5.5
        };

        // Provider bonuses
        const providerBonuses: Record<string, number> = {
            'google': 1.5,
            'deeplearning.ai': 1.5,
            'meta': 1.2,
            'microsoft': 1.5,
            'aws': 1.5,
            'ibm': 1.2,
            'stanford': 1.5,
            'mit': 1.5
        };

        const R = platformScores[platform.toLowerCase()] || platformScores['default'];
        const A = 6.5; // Default practical application
        const bonus = providerBonuses[provider.toLowerCase()] || 0;

        const adjustedR = Math.min(R + bonus, 10);

        // Extract skills from title if AI fails
        const commonKeywords = [
            'python', 'java', 'javascript', 'react', 'node', 'sql', 'machine learning',
            'deep learning', 'data science', 'analytics', 'project management', 'communication',
            'leadership', 'marketing', 'finance', 'excel', 'tableau', 'power bi', 'aws', 'azure',
            'cloud', 'devops', 'kubernetes', 'docker', 'c++', 'c#', 'rust', 'go', 'ruby',
            'regression', 'classification', 'nlp', 'vision', 'html', 'css', 'typescript',
            'supervised', 'unsupervised', 'reinforcement', 'neural networks', 'gan', 'transformers',
            'statistics', 'probability', 'linear algebra', 'calculus', 'economics', 'accounting'
        ];

        const foundSkills: SkillRating[] = [];
        const lowerTitle = courseName.toLowerCase();

        commonKeywords.forEach(keyword => {
            if (lowerTitle.includes(keyword)) {
                foundSkills.push({ skill_name: keyword, skill_rating_Si: 7.0 });
            }
        });

        const skills: SkillRating[] = foundSkills.length > 0
            ? foundSkills
            : [{ skill_name: 'general-skills', skill_rating_Si: 6.5 }];

        return {
            course_name: courseName,
            platform,
            provider,
            overall_rating_R: adjustedR,
            real_life_application_A: A,
            skills,
            n: 1,
            evaluation_notes: 'Fallback evaluation - AI service unavailable',
            final_score: this.calculateFinalScore(adjustedR, A, skills)
        };
    }

    /**
     * Extract details from resume text (e.g., CGPA)
     */
    async extractResumeDetails(resumeText: string): Promise<{ cgpa: string | null }> {
        try {
            const systemPrompt = `You are a resume parser. Extract the CGPA/GPA from the provided resume text.
            
            Rules:
            - search for "CGPA", "GPA", "Score", "Grade" related to education.
            - Return JSON ONLY: { "cgpa": "string value" }
            - If found (e.g., "9.5/10", "3.8", "85%"), return it as a string.
            - If NOT found, return null for the value.
            - Do not invent numbers.
            `;

            const userPrompt = `Resume Content:\n${resumeText.slice(0, 5000)}`; // Limit context if needed

            const messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ];

            const text = await this.callWithFallback(messages);

            // Clean up JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? jsonMatch[0] : text.trim();

            const parsed = JSON.parse(jsonText);
            return { cgpa: parsed.cgpa || null };
        } catch (error) {
            console.error('Resume Extraction Error:', error);
            return { cgpa: null };
        }
    }

    // Generate skill assessment questions
    async generateSkillQuestions(skills: string[]) {
        const systemPrompt = `You are an expert technical assessment engine. 
Generate exactly 15 multiple-choice questions to test the following skills: ${skills.join(', ')}.

Rules:
1. Difficulty Distribution: 7 Easy, 5 Medium, 3 Hard.
2. Ensure every skill provided is tested at least once.
3. Questions must be technical and specific.
4. Output strict JSON.

Output JSON Schema:
{
  "questions": [
    {
      "skill": "exact skill name from list",
      "difficulty": "EASY" | "MEDIUM" | "HARD",
      "question": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correct_answer": "exact string of correct option"
    }
  ]
}`;

        try {
            const jsonText = await this.callWithFallback([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: "Generate the assessment now." }
            ]);

            // Extract JSON
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(jsonText);

            return parsed.questions || [];
        } catch (error) {
            console.error('Question Generation Error:', error);
            return this.getFallbackQuestions(skills);
        }
    }

    private getFallbackQuestions(skills: string[]) {
        return skills.map((skill, i) => ({
            skill,
            difficulty: 'EASY',
            question: `What is a core concept of ${skill}?`,
            options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
            correct_answer: 'Concept A'
        }));
    }
}

export const aiEvaluationService = new AIEvaluationService();
