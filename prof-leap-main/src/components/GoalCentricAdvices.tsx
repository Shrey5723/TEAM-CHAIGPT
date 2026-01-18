import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Loader2,
    Compass,
    Target,
    BookOpen,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Plus,
    X,
    Sparkles,
    ExternalLink,
    GraduationCap,
    Lightbulb
} from 'lucide-react';
import { goalAdvicesApi, skillsApi, type DerivedSkill } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface GoalAnalysis {
    goal_designation: string;
    career_scope: 'strong' | 'moderate' | 'risky';
    scope_reason: string;
}

interface SkillToImprove {
    skill_name: string;
    current_rating: number;
    target_rating: number;
    reason: string;
}

interface SkillToLearn {
    skill_name: string;
    reason: string;
}

interface LearningRecommendation {
    skill_name: string;
    free_resources: Array<{ platform: string; resource_name: string }>;
    paid_resources: Array<{ platform: string; course_name: string; cost_level: string }>;
}

interface AnalysisResult {
    goal_analysis: GoalAnalysis[];
    skills_to_improve: SkillToImprove[];
    skills_to_learn: SkillToLearn[];
    learning_recommendations: LearningRecommendation[];
}

export function GoalCentricAdvices() {
    const { toast } = useToast();
    const [skills, setSkills] = useState<DerivedSkill[]>([]);
    const [goals, setGoals] = useState<string[]>([]);
    const [newGoal, setNewGoal] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingSkills, setLoadingSkills] = useState(true);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    useEffect(() => {
        loadSkills();
    }, []);

    const loadSkills = async () => {
        try {
            const data = await skillsApi.list();
            setSkills(data);
        } catch (error) {
            console.error('Failed to load skills', error);
        } finally {
            setLoadingSkills(false);
        }
    };

    const addGoal = () => {
        if (newGoal.trim() && goals.length < 5) {
            setGoals([...goals, newGoal.trim()]);
            setNewGoal('');
        }
    };

    const removeGoal = (index: number) => {
        setGoals(goals.filter((_, i) => i !== index));
    };

    const handleAnalyze = async () => {
        if (goals.length === 0) {
            toast({ title: 'Please add at least one career goal', variant: 'destructive' });
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const data = await goalAdvicesApi.analyze(goals);
            setResult(data);
        } catch (error) {
            toast({ title: 'Analysis failed', description: 'Please try again later', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const getScopeIcon = (scope: string) => {
        switch (scope) {
            case 'strong': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
            case 'moderate': return <TrendingUp className="w-5 h-5 text-yellow-400" />;
            case 'risky': return <AlertTriangle className="w-5 h-5 text-red-400" />;
            default: return <Target className="w-5 h-5 text-cyan-400" />;
        }
    };

    const getScopeColor = (scope: string) => {
        switch (scope) {
            case 'strong': return 'bg-green-500/10 border-green-500/30 text-green-400';
            case 'moderate': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
            case 'risky': return 'bg-red-500/10 border-red-500/30 text-red-400';
            default: return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
        }
    };

    if (loadingSkills) {
        return (
            <div className="flex items-center justify-center min-h-[500px] bg-[#0a0f1c] rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black pointer-events-none" />
                <Loader2 className="w-10 h-10 animate-spin text-cyan-500 relative z-10" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 py-8 bg-[#0a0f1c] min-h-screen rounded-xl overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

            {/* Floating Title */}
            <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="text-center relative z-10"
            >
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-500 drop-shadow-[0_0_25px_rgba(168,85,247,0.6)] font-sans tracking-tight">
                    Goal Centric Advisor
                </h1>
                <p className="text-purple-400/70 mt-3 tracking-[0.3em] uppercase text-xs font-semibold">
                    Career Intelligence Engine
                </p>
            </motion.div>

            {/* Skills Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10"
            >
                <Card className="bg-black/40 border-purple-500/30 backdrop-blur-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-purple-100">Your Current Skill Matrix</h3>
                        <Badge variant="outline" className="ml-auto bg-purple-500/10 border-purple-500/30 text-purple-300">
                            {skills.length} Skills
                        </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {skills.length === 0 ? (
                            <p className="text-purple-400/50 text-sm">No skills derived yet. Add certificates or connect GitHub to derive skills.</p>
                        ) : (
                            skills.slice(0, 12).map((skill) => (
                                <div
                                    key={skill.id}
                                    className="px-3 py-1.5 rounded-lg bg-purple-950/50 border border-purple-500/20 text-purple-200 text-sm flex items-center gap-2"
                                >
                                    <span className="capitalize">{skill.name.replace(/-/g, ' ')}</span>
                                    <span className="text-xs text-purple-400/60">{Math.round(skill.confidence * 100)}%</span>
                                </div>
                            ))
                        )}
                        {skills.length > 12 && (
                            <span className="px-3 py-1.5 text-purple-400/50 text-sm">+{skills.length - 12} more</span>
                        )}
                    </div>
                </Card>
            </motion.div>

            {/* Goal Input Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative z-10"
            >
                <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Compass className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-cyan-100">Define Your Career Goals</h3>
                    </div>

                    <div className="flex gap-2 mb-4">
                        <Input
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                            placeholder="e.g., Machine Learning Engineer, Data Scientist"
                            className="bg-black/50 border-cyan-500/30 text-cyan-100 placeholder:text-cyan-500/40"
                        />
                        <Button
                            onClick={addGoal}
                            disabled={!newGoal.trim() || goals.length >= 5}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {goals.map((goal, idx) => (
                            <div
                                key={idx}
                                className="px-3 py-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-200 text-sm flex items-center gap-2 group"
                            >
                                {goal}
                                <button
                                    onClick={() => removeGoal(idx)}
                                    className="opacity-50 hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        {goals.length === 0 && (
                            <p className="text-cyan-400/50 text-sm">Add up to 5 career goals to analyze</p>
                        )}
                    </div>

                    <Button
                        onClick={handleAnalyze}
                        disabled={loading || goals.length === 0}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold py-6 text-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Analyzing Career Path...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Analyze My Career Trajectory
                            </>
                        )}
                    </Button>
                </Card>
            </motion.div>

            {/* Results Section */}
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6 relative z-10"
                >
                    {/* Career Scope Analysis */}
                    <Card className="bg-black/40 border-purple-500/30 backdrop-blur-md p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            <h3 className="text-xl font-semibold text-purple-100">Career Scope Analysis</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.goal_analysis.map((goal, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "p-4 rounded-xl border",
                                        getScopeColor(goal.career_scope)
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {getScopeIcon(goal.career_scope)}
                                        <h4 className="font-semibold">{goal.goal_designation}</h4>
                                    </div>
                                    <Badge className={cn("mb-2 capitalize", getScopeColor(goal.career_scope))}>
                                        {goal.career_scope} Scope
                                    </Badge>
                                    <p className="text-sm opacity-80">{goal.scope_reason}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Skills to Improve */}
                    {result.skills_to_improve.length > 0 && (
                        <Card className="bg-black/40 border-yellow-500/30 backdrop-blur-md p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Target className="w-5 h-5 text-yellow-400" />
                                <h3 className="text-xl font-semibold text-yellow-100">Skills to Strengthen</h3>
                            </div>
                            <div className="space-y-4">
                                {result.skills_to_improve.map((skill, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-yellow-950/30 border border-yellow-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-yellow-200 capitalize">{skill.skill_name.replace(/-/g, ' ')}</span>
                                            <span className="text-sm text-yellow-400">
                                                {skill.current_rating}% → {skill.target_rating}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-yellow-950/50 rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000"
                                                style={{ width: `${skill.current_rating}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-yellow-400/70">{skill.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Skills to Learn */}
                    {result.skills_to_learn.length > 0 && (
                        <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-md p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Lightbulb className="w-5 h-5 text-cyan-400" />
                                <h3 className="text-xl font-semibold text-cyan-100">New Skills to Acquire</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {result.skills_to_learn.map((skill, idx) => (
                                    <div key={idx} className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-3">
                                        <Plus className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <span className="font-medium text-cyan-200 capitalize">{skill.skill_name}</span>
                                            <p className="text-xs text-cyan-400/70 mt-1">{skill.reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Learning Recommendations */}
                    {result.learning_recommendations.length > 0 && (
                        <Card className="bg-black/40 border-green-500/30 backdrop-blur-md p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <GraduationCap className="w-5 h-5 text-green-400" />
                                <h3 className="text-xl font-semibold text-green-100">Learning Roadmap</h3>
                            </div>
                            <div className="space-y-6">
                                {result.learning_recommendations.map((rec, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-green-950/30 border border-green-500/20">
                                        <h4 className="font-semibold text-green-200 capitalize mb-3 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" />
                                            {rec.skill_name.replace(/-/g, ' ')}
                                        </h4>

                                        {rec.free_resources.length > 0 && (
                                            <div className="mb-3">
                                                <Badge className="mb-2 bg-green-500/10 border-green-500/30 text-green-300">Free Resources</Badge>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                                    {rec.free_resources.map((res, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-sm text-green-300/80 bg-green-950/50 px-3 py-2 rounded-lg">
                                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                            <span>{res.platform}: {res.resource_name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {rec.paid_resources.length > 0 && (
                                            <div>
                                                <Badge className="mb-2 bg-purple-500/10 border-purple-500/30 text-purple-300">Low-Cost Courses</Badge>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                                    {rec.paid_resources.map((res, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-sm text-purple-300/80 bg-purple-950/50 px-3 py-2 rounded-lg">
                                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                            <span>{res.platform}: {res.course_name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </motion.div>
            )}
        </div>
    );
}
