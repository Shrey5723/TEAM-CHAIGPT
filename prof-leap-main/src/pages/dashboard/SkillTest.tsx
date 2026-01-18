import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Target, TrendingUp, Bot, CheckCheck, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { testApi } from '@/lib/api';

export function SkillTestPage() {
    const [status, setStatus] = useState<'START' | 'SUMMARY' | 'TEST' | 'RESULT'>('START');
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [results, setResults] = useState<any>(null);
    const [testId, setTestId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await testApi.start();
            setTestId(res.testId);
            setQuestions(res.questions);
            setStatus('SUMMARY');
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to start test. Ensure you have skills to test.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = (answer: string) => {
        const q = questions[currentIndex];
        setAnswers(prev => ({ ...prev, [q.id]: answer }));
    };

    const handleNext = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setLoading(true);
            try {
                const submission = Object.entries(answers).map(([qid, ans]) => ({ questionId: qid, answer: ans }));
                const res = await testApi.submit(testId!, submission);
                setResults(res.skillUpdates);
                setStatus('RESULT');
            } catch (err) {
                toast({ title: 'Error', description: 'Failed to submit test', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading && status === 'START') {
        return <div className="p-8 text-center bg-card rounded-2xl glass"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /><p className="mt-4">Generating your personalized assessment...</p></div>;
    }

    if (status === 'START') {
        return (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Zap className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold">Test Your Skills</h1>
                    <p className="text-muted-foreground text-lg">
                        Validate your expertise and improve your skill scores through our adaptive assessment engine.
                        Questions are generated specifically based on your profile.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-8">
                        <div className="p-4 rounded-xl glass border border-primary/20">
                            <Target className="w-6 h-6 text-primary mb-2" />
                            <h3 className="font-semibold">Adaptive</h3>
                            <p className="text-sm text-muted-foreground">Adjusts to your level</p>
                        </div>
                        <div className="p-4 rounded-xl glass border border-primary/20">
                            <TrendingUp className="w-6 h-6 text-primary mb-2" />
                            <h3 className="font-semibold">Impactful</h3>
                            <p className="text-sm text-muted-foreground">Boost your scores daily</p>
                        </div>
                        <div className="p-4 rounded-xl glass border border-primary/20">
                            <Bot className="w-6 h-6 text-primary mb-2" />
                            <h3 className="font-semibold">AI Powered</h3>
                            <p className="text-sm text-muted-foreground">Generative questions</p>
                        </div>
                    </div>

                    <Button size="lg" onClick={handleStart} className="mt-8 px-8" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        Start Assessment
                    </Button>
                </div>
            </div>
        );
    }

    if (status === 'SUMMARY') {
        return (
            <div className="max-w-xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Ready to Begin?</h2>
                    <p className="text-muted-foreground">We've generated {questions.length} questions for you.</p>
                </div>

                <div className="p-6 rounded-2xl glass space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span>Total Questions</span>
                        <span className="font-bold">{questions.length}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <span>Difficulty</span>
                        <span className="flex gap-2">
                            <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Easy</Badge>
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Medium</Badge>
                            <Badge variant="secondary" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Hard</Badge>
                        </span>
                    </div>
                    <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">Skills covered:</span>
                        <div className="flex flex-wrap gap-2">
                            {Array.from(new Set(questions.map(q => q.skill))).map((skill: any) => (
                                <Badge key={skill} variant="outline" className="capitalize">{skill}</Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <Button size="lg" className="w-full" onClick={() => setStatus('TEST')}>Begin Test</Button>
            </div>
        );
    }

    if (status === 'TEST') {
        const q = questions[currentIndex];
        const selected = answers[q.id];
        const progress = ((currentIndex + 1) / questions.length) * 100;

        return (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div className="p-8 rounded-2xl glass space-y-6 min-h-[300px]">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">{q.skill}</Badge>
                        <Badge className={cn(
                            "capitalize",
                            q.difficulty === 'EASY' ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" :
                                q.difficulty === 'MEDIUM' ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" :
                                    "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        )}>{q.difficulty.toLowerCase()}</Badge>
                    </div>

                    <h3 className="text-xl font-medium leading-relaxed">{q.question}</h3>

                    <div className="space-y-3 mt-8">
                        {q.options.map((opt: string, idx: number) => (
                            <div
                                key={idx}
                                onClick={() => handleSubmitAnswer(opt)}
                                className={cn(
                                    "p-4 rounded-xl border cursor-pointer transition-all",
                                    selected === opt ? "bg-primary/10 border-primary" : "bg-card/40 border-white/5 hover:bg-primary/5 hover:border-primary/50"
                                )}
                            >
                                {opt}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleNext} disabled={!selected || loading}>
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {currentIndex === questions.length - 1 ? 'Submit Test' : 'Next Question'}
                    </Button>
                </div>
            </div>
        );
    }

    if (status === 'RESULT') {
        return (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCheck className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold">Assessment Complete</h1>
                    <p className="text-muted-foreground">Here is how your skills have improved.</p>
                </div>

                <div className="grid gap-4">
                    {results.map((res: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl glass flex items-center justify-between border border-white/10">
                            <div>
                                <h4 className="font-semibold capitalize">{res.skill}</h4>
                                <div className="text-sm text-muted-foreground flex gap-2 items-center mt-1">
                                    <span>Old: <span className="text-foreground">{res.prevScore.toFixed(1)}</span></span>
                                    <ChevronRight className="w-4 h-4 opacity-50" />
                                    <span>New: <span className="font-bold text-primary">{res.newScore.toFixed(1)}</span></span>
                                </div>
                            </div>
                            <div className={cn(
                                "px-3 py-1 rounded-lg font-bold text-sm",
                                res.delta >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            )}>
                                {res.delta >= 0 ? '+' : ''}{res.delta.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                <Button size="lg" className="w-full" onClick={() => {
                    setStatus('START');
                    setQuestions([]);
                    setAnswers({});
                    setResults(null);
                }}>Take Another Test</Button>
            </div>
        );
    }

    return null;
}
