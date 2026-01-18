import { prisma } from '../config';

interface GoalAnalysisInput {
    goals: string[];
    skills: { name: string; confidence: number }[];
}

interface GoalAnalysisResult {
    goal_analysis: Array<{
        goal_designation: string;
        career_scope: 'strong' | 'moderate' | 'risky';
        scope_reason: string;
    }>;
    skills_to_improve: Array<{
        skill_name: string;
        current_rating: number;
        target_rating: number;
        reason: string;
    }>;
    skills_to_learn: Array<{
        skill_name: string;
        reason: string;
    }>;
    learning_recommendations: Array<{
        skill_name: string;
        free_resources: Array<{ platform: string; resource_name: string }>;
        paid_resources: Array<{ platform: string; course_name: string; cost_level: string }>;
    }>;
}

const GOAL_ANALYSIS_PROMPT = `You are a senior AI systems architect and career-intelligence engine.

Your task is to analyze a user's CURRENT SKILL PROFILE against their TARGET CAREER GOALS and provide actionable guidance.

**INPUT:**
- User's current skills with ratings (0-100)
- Target career goal designations

**YOUR ANALYSIS MUST:**
1. Evaluate career scope for each goal (strong/moderate/risky) based on:
   - Current market demand
   - Near-future relevance (2-4 years)
   - Hiring trends
   - Technology adoption
   - Saturation risk

2. Identify skills that need improvement (user has them but needs higher proficiency)

3. Identify skills that must be learned (user doesn't have them)

4. Recommend specific learning resources:
   - FREE resources from trusted platforms (YouTube, freeCodeCamp, MIT OCW, etc.)
   - PAID resources that are low-cost, high-value (Coursera, Udemy, edX)

**STRICT RULES:**
- No markdown
- No emojis  
- No explanations outside JSON
- No motivational language
- No promises of job placement
- Be analytical and honest about career scope
- Base ratings on industry standards

**MANDATORY OUTPUT FORMAT (JSON ONLY):**
{
  "goal_analysis": [
    {
      "goal_designation": "string",
      "career_scope": "strong | moderate | risky",
      "scope_reason": "concise factual explanation"
    }
  ],
  "skills_to_improve": [
    {
      "skill_name": "string",
      "current_rating": number,
      "target_rating": number,
      "reason": "why this skill matters for the goal"
    }
  ],
  "skills_to_learn": [
    {
      "skill_name": "string",
      "reason": "why this skill is required for the goal"
    }
  ],
  "learning_recommendations": [
    {
      "skill_name": "string",
      "free_resources": [
        { "platform": "string", "resource_name": "string" }
      ],
      "paid_resources": [
        { "platform": "string", "course_name": "string", "cost_level": "low" }
      ]
    }
  ]
}`;

export class GoalAnalysisService {
    // High-quality FREE models in order of preference (all are :free tier)
    private modelCascade = [
        'meta-llama/llama-4-maverick:free',      // Llama 4 - Excellent reasoning
        'qwen/qwen3-235b-a22b:free',             // Qwen 235B - Very capable
        'mistralai/mistral-small-3.1-24b-instruct:free', // Mistral Small - Great for JSON
        'google/gemma-3-27b-it:free',            // Gemma 3 27B - Reliable
        'deepseek/deepseek-r1-distill-llama-70b:free', // DeepSeek - Good fallback
    ];

    private getApiKey(): string {
        return process.env.OPENROUTER_API_KEY || '';
    }

    private async callWithFallback(messages: any[]): Promise<string> {
        const apiKey = this.getApiKey();
        if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

        let lastError: Error | null = null;

        // Try each model in the cascade until one succeeds
        for (const model of this.modelCascade) {
            try {
                console.log(`🎯 Goal Analysis: Trying model ${model}`);
                const result = await this.makeOpenRouterRequest(apiKey, model, messages);
                console.log(`✅ Success with model: ${model}`);
                return result;
            } catch (error: any) {
                console.warn(`⚠️ Model ${model} failed: ${error.message}`);
                lastError = error;
                // Continue to next model
            }
        }

        // All models failed
        console.error(`❌ All ${this.modelCascade.length} models failed`);
        throw lastError || new Error('All models failed');
    }

    private async makeOpenRouterRequest(apiKey: string, model: string, messages: any[]): Promise<string> {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": model,
                "messages": messages,
                "max_tokens": 2000  // Reduced to stay within limits
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as any;
        return data.choices?.[0]?.message?.content || "";
    }

    async analyze(userId: string, goals: string[]): Promise<GoalAnalysisResult> {
        // 1. Fetch user's current skills
        const profile = await prisma.applicantProfile.findUnique({
            where: { userId },
            include: {
                derivedSkills: true
            }
        });

        if (!profile) {
            throw new Error('Profile not found. Create a profile first.');
        }

        const skills = profile.derivedSkills.map(s => ({
            name: s.name,
            confidence: Math.round(s.confidence * 100)
        }));

        console.log(`🎯 Analyzing goals for user ${userId}:`, goals);
        console.log(`📊 User has ${skills.length} skills`);

        // 2. Build user prompt
        const userPrompt = `
**USER'S CURRENT SKILLS:**
${skills.length > 0 ? skills.map(s => `- ${s.name}: ${s.confidence}/100`).join('\n') : 'No skills derived yet'}

**TARGET CAREER GOALS:**
${goals.map(g => `- ${g}`).join('\n')}

Analyze the skill gap and provide career-centric advice.`;

        const messages = [
            { role: "system", content: GOAL_ANALYSIS_PROMPT },
            { role: "user", content: userPrompt }
        ];

        try {
            const text = await this.callWithFallback(messages);

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonText = jsonMatch ? jsonMatch[0] : text.trim();

            const parsed = JSON.parse(jsonText) as GoalAnalysisResult;
            console.log(`✅ Goal analysis complete:`, {
                goalsAnalyzed: parsed.goal_analysis?.length || 0,
                skillsToImprove: parsed.skills_to_improve?.length || 0,
                skillsToLearn: parsed.skills_to_learn?.length || 0
            });

            return parsed;
        } catch (error) {
            console.error('❌ Goal Analysis Error:', error);
            // Return fallback response
            return this.getFallbackAnalysis(goals, skills);
        }
    }

    private getFallbackAnalysis(goals: string[], skills: { name: string; confidence: number }[]): GoalAnalysisResult {
        return {
            goal_analysis: goals.map(goal => ({
                goal_designation: goal,
                career_scope: 'moderate' as const,
                scope_reason: 'Analysis temporarily unavailable. Please try again later.'
            })),
            skills_to_improve: skills.filter(s => s.confidence < 70).slice(0, 3).map(s => ({
                skill_name: s.name,
                current_rating: s.confidence,
                target_rating: 85,
                reason: 'Higher proficiency recommended for competitive roles'
            })),
            skills_to_learn: [
                { skill_name: 'communication', reason: 'Essential for all professional roles' }
            ],
            learning_recommendations: []
        };
    }
}

export const goalAnalysisService = new GoalAnalysisService();
