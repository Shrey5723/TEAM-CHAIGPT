import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area } from 'recharts';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkles, Activity, Layers, Code, Loader2, Award, Pencil } from 'lucide-react';
import { skillsApi, profileApi, certificatesApi, type DerivedSkill, type Profile, type Certificate, type GitHubRepo } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Helper to sum array
const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

interface MonthlyData {
    monthKey: string; // YYYY-MM (for sorting)
    monthLabel: string; // MMM-yy
    cgpa: number;
    github_scores: number[];
    certification_scores: number[];
    cumulativeScore: number;
    cgpaContribution: number;
    githubContribution: number;
    certContribution: number;
    sortDate: number;
    items: { type: 'github' | 'cert' | 'cgpa', name: string, score: number, date: string, id?: string }[];
}

export function AntiGravityTracker() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<MonthlyData[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);

    // Edit State
    const [editingCert, setEditingCert] = useState<Certificate | null>(null);
    const [editForm, setEditForm] = useState({ name: '', date: '', platform: '', companyName: '' });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [skills, profile, certs] = await Promise.all([
                skillsApi.list(),
                profileApi.get().catch(() => null as Profile | null),
                certificatesApi.list().catch(() => [] as Certificate[])
            ]);

            setCertificates(certs);
            processData(skills, profile, certs);
        } catch (error) {
            console.error("Failed to load tracker data", error);
        } finally {
            setLoading(false);
        }
    };

    const processData = (skills: DerivedSkill[], profile: Profile | null, certs: Certificate[]) => {
        // Group by Month-Year
        const groups: Record<string, MonthlyData> = {};

        const getMonthKey = (dateStr: string) => {
            const d = new Date(dateStr);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        };

        const getMonthLabel = (dateStr: string) => {
            const d = new Date(dateStr);
            // Format: Jan-26
            const month = d.toLocaleString('default', { month: 'short' });
            const year = String(d.getFullYear()).slice(-2);
            return `${month}-${year}`;
        };

        const ensureGroup = (dateStr: string) => {
            const key = getMonthKey(dateStr);
            if (!groups[key]) {
                groups[key] = {
                    monthKey: key,
                    monthLabel: getMonthLabel(dateStr),
                    sortDate: new Date(dateStr).getTime(), // Approximate sort date (start of month effectively)
                    cgpa: 0,
                    github_scores: [],
                    certification_scores: [],
                    items: [],
                    cumulativeScore: 0,
                    cgpaContribution: 0,
                    githubContribution: 0,
                    certContribution: 0
                };
            }
            return groups[key];
        };

        // 1. Process GitHub Repos (Use Profile.githubRepos)
        if (profile?.githubRepos) {
            profile.githubRepos.forEach((repo: GitHubRepo) => {
                const group = ensureGroup(repo.lastUpdated);
                const score = 50; // Baseline score per repo
                group.github_scores.push(score);
                group.items.push({ type: 'github', name: repo.repoName, score, date: repo.lastUpdated });
            });
        }

        // 2. Process Certificates
        // We map skills to certificates to get the accurate score sum
        certs.forEach(cert => {
            // Find skills for this cert
            const certSkills = skills.filter(s => s.certificateId === cert.id || (s.certificate?.name === cert.name));
            let certScore = 0;

            if (certSkills.length > 0) {
                certScore = sum(certSkills.map(s => Math.round(s.confidence * 100)));
            } else {
                certScore = 50; // Fallback if no skills derived yet
            }

            const dateStr = cert.date ? cert.date.toString() : (cert.uploadedAt || new Date().toISOString());
            const group = ensureGroup(dateStr);
            group.certification_scores.push(certScore);
            group.items.push({ type: 'cert', name: cert.name, score: certScore, date: dateStr, id: cert.id });
        });

        // 3. Process CGPA
        let resumeCgpa = 0;
        if (profile?.resume?.cgpa) {
            resumeCgpa = parseFloat(profile.resume.cgpa);
            // Add CGPA entry on upload date
            const dateStr = profile.resume.uploadedAt || new Date().toISOString();
            const group = ensureGroup(dateStr);
            group.items.push({ type: 'cgpa', name: "Resume CGPA", score: resumeCgpa * 10, date: dateStr });
        }

        // Convert to Array
        const dataArr = Object.values(groups);

        // Sort by date
        dataArr.sort((a, b) => a.monthKey.localeCompare(b.monthKey));

        // Calculate Cumulative
        let cumulativeScore = 0;
        const processed = dataArr.map((item) => {
            // Apply global CGPA to every month in cumulative sum? 
            // User Logic: "CGPA contribution = CGPA * 10".
            // If we add it every month, it grows linearly.
            // If we add it once (base), it shifts the line up.
            // The sample logic (Step 972): "Cumulative score = previous month + all contributions".
            // "CGPA contribution = CGPA * 10".
            // This implies it is added EVERY MONTH.
            // So score += CGPA*10 at each step.

            const cgpaContribution = resumeCgpa * 10;
            const githubContribution = sum(item.github_scores);
            const certContribution = sum(item.certification_scores);
            const monthlyTotal = cgpaContribution + githubContribution + certContribution;

            cumulativeScore += monthlyTotal;

            return {
                ...item,
                cgpa: resumeCgpa,
                cumulativeScore,
                cgpaContribution,
                githubContribution,
                certContribution
            };
        });

        setChartData(processed);
    };

    const handleEditClick = (certId: string) => {
        const cert = certificates.find(c => c.id === certId);
        if (cert) {
            setEditingCert(cert);
            setEditForm({
                name: cert.name,
                companyName: cert.companyName,
                platform: cert.platform,
                // Format date for Input type="date" (YYYY-MM-DD)
                date: cert.date ? new Date(cert.date).toISOString().split('T')[0] : ''
            });
        }
    };

    const handleUpdate = async () => {
        if (!editingCert) return;
        setUpdating(true);
        try {
            await certificatesApi.update(editingCert.id, editForm);
            toast({ title: 'Certificate updated!', description: 'Analysis sync initiated.' });
            setEditingCert(null);
            // Reload data to reflect changes
            await loadData();
        } catch (error) {
            toast({ title: 'Update failed', variant: 'destructive' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px] bg-[#0a0f1c] rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black pointer-events-none" />
                <Loader2 className="w-10 h-10 animate-spin text-cyan-500 relative z-10" />
            </div>
        );
    }

    if (chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] bg-[#0a0f1c] rounded-xl text-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
                <Sparkles className="w-12 h-12 text-cyan-500 mb-4 opacity-50 relative z-10" />
                <h2 className="text-2xl font-bold text-cyan-100 relative z-10">No Data Detected</h2>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 py-8 bg-[#0a0f1c] min-h-screen rounded-xl overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

            {/* Floating Title */}
            <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="text-center relative z-10"
            >
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_25px_rgba(6,182,212,0.6)] font-sans tracking-tight">
                    TechStack Analysis
                </h1>
                <p className="text-cyan-400/70 mt-3 tracking-[0.3em] uppercase text-xs font-semibold"></p>
            </motion.div>

            {/* Dataset Card */}
            <motion.div
                initial={{ y: 0 }}
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="relative z-10"
            >
                <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-md overflow-hidden relative group shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Layers className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-xl font-semibold text-cyan-100">Temporal Data Nodes</h3>
                        </div>

                        <div className="overflow-x-auto min-h-[200px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-cyan-500/20 text-cyan-400/60 uppercase text-xs tracking-wider">
                                        <th className="p-4">Timeline</th>
                                        <th className="p-4">Components (Hover for Hologram)</th>
                                        <th className="p-4 text-right">Cumulative Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-cyan-500/10">
                                    {chartData.map((row) => (
                                        <tr
                                            key={row.monthKey}
                                            className="group/row hover:bg-cyan-500/10 transition-colors duration-300 relative"
                                        >
                                            <td className="p-4 text-cyan-200 font-medium whitespace-nowrap">
                                                {row.monthLabel}
                                                <span className="text-xs text-cyan-500/50 block font-mono mt-1">{row.monthKey}</span>
                                            </td>
                                            <td className="p-4 w-full">
                                                {/* Holographic Reveal on Hover */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="px-2 py-1 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                                                            CGPA: <span className="text-cyan-100 font-bold">{row.cgpa}</span>
                                                        </div>
                                                        <span className="text-xs text-cyan-500/60">→ {Math.round(row.cgpaContribution)} pts</span>
                                                    </div>

                                                    {/* Hover reveal full details */}
                                                    <div className="h-0 overflow-hidden group-hover/row:h-auto transition-all duration-500 ease-out opacity-0 group-hover/row:opacity-100 pl-4 border-l-2 border-purple-500/50">
                                                        {/* List detailed items */}
                                                        {row.items.map((item, idx) => (
                                                            <div key={idx} className="flex flex-wrap items-center gap-2 mt-2">
                                                                {item.type === 'github' && <Code className="w-3 h-3 text-purple-400" />}
                                                                {item.type === 'cert' && <Award className="w-3 h-3 text-yellow-400" />}

                                                                <span className={cn("text-xs", item.type === 'github' ? "text-purple-300" : "text-yellow-300")}>
                                                                    {item.name}: <span className="font-mono text-white">{item.score}</span> pts
                                                                </span>

                                                                {/* Edit Button for Certs */}
                                                                {item.type === 'cert' && item.id && (
                                                                    <button
                                                                        onClick={() => handleEditClick(item.id!)}
                                                                        className="ml-2 hover:bg-white/10 p-1 rounded-full text-cyan-400 transition-colors"
                                                                        title="Edit Certificate"
                                                                    >
                                                                        <Pencil className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-mono text-2xl text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                                                {Math.round(row.cumulativeScore)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Chart Card */}
            <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="relative z-10"
            >
                <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-xl p-6 h-[450px] shadow-[0_0_40px_rgba(6,182,212,0.05)]">
                    <ResponsiveContainer width="100%" height="80%">
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                </linearGradient>
                                <filter id="glow" height="130%">
                                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                    <feOffset dx="0" dy="0" result="offsetblur" />
                                    <feFlood floodColor="#06b6d4" result="color" />
                                    <feComposite in2="offsetblur" operator="in" />
                                    <feMerge>
                                        <feMergeNode />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#0e7490" opacity={0.2} vertical={false} />
                            <XAxis
                                dataKey="monthLabel"
                                stroke="#22d3ee"
                                opacity={0.5}
                                tick={{ fill: '#67e8f9', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#22d3ee"
                                opacity={0.5}
                                tick={{ fill: '#67e8f9', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#06b6d4', backdropFilter: 'blur(10px)', color: '#fff', borderRadius: '12px' }}
                                itemStyle={{ color: '#22d3ee' }}
                                cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="cumulativeScore"
                                stroke="#06b6d4"
                                strokeWidth={3}
                                dot={{ r: 6, fill: "#083344", stroke: "#22d3ee", strokeWidth: 2 }}
                                activeDot={{ r: 8, fill: "#22d3ee", stroke: "#fff", strokeWidth: 2, className: "animate-pulse" }}
                                animationDuration={2000}
                                filter="url(#glow)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    {/* Axis Label Overlay */}
                    <div className="absolute bottom-4 left-0 right-0 text-center text-cyan-500/30 text-xs tracking-[0.5em] uppercase">
                        Real-Time Chronological Vector
                    </div>
                </Card>
            </motion.div>

            {/* Edit Certificate Dialog */}
            <Dialog open={!!editingCert} onOpenChange={(open) => !open && setEditingCert(null)}>
                <DialogContent className="bg-[#0a0f1c] border-cyan-500/30 text-cyan-100 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Certificate Node</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Event Name</Label>
                            <Input
                                value={editForm.name}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                className="bg-black/50 border-cyan-500/30 text-cyan-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Temporal Marker (Date)</Label>
                            <Input
                                type="date"
                                value={editForm.date}
                                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                className="bg-black/50 border-cyan-500/30 text-cyan-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Origin (Platform)</Label>
                            <Input
                                value={editForm.platform}
                                onChange={e => setEditForm({ ...editForm, platform: e.target.value })}
                                className="bg-black/50 border-cyan-500/30 text-cyan-100"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs text-cyan-500/50">
                            <p>Modifying this node will recalibrate the entire trajectory graph.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingCert(null)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={updating} className="bg-cyan-600 hover:bg-cyan-500 text-white">
                            {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Recalibrate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
