import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Zap,
  LayoutDashboard,
  Briefcase,
  Users,
  Bell,
  LogOut,
  ChevronRight,
  Plus,
  User,
  TrendingUp,
  Eye,
  Loader2,
  Trash2,
  Check,
  CheckCheck,
  Target,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  hirerApi,
  notificationsApi,
  type Job,
  type JobInput,
  type RecommendedApplicant,
  type Notification,
} from '@/lib/api';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '' },
  { icon: Briefcase, label: 'My Jobs', path: 'jobs' },
  { icon: Plus, label: 'Post Job', path: 'post-job' },
  { icon: Users, label: 'Candidates', path: 'candidates' },
  { icon: Bell, label: 'Notifications', path: 'notifications' },
];

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">SAKSHAM</span>
        </Link>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const fullPath = `/dashboard/hirer${item.path ? `/${item.path}` : ''}`;
            const isActive = location.pathname === fullPath;

            return (
              <li key={item.path}>
                <Link
                  to={fullPath}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground">Employer</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

// Overview Page
function OverviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    avgMatchRate: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const myJobs = await hirerApi.getMyJobs();
        setJobs(myJobs);

        // Calculate stats
        const activeJobs = myJobs.filter(j => j.isActive).length;
        setStats({
          activeJobs,
          totalApplicants: 0, // Would need applicant counts per job
          avgMatchRate: 72, // Placeholder
        });
      } catch (error) {
        console.error('Failed to load overview data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const statsDisplay = [
    { label: 'Active Jobs', value: String(stats.activeJobs), icon: Briefcase, color: 'text-primary' },
    { label: 'Total Jobs', value: String(jobs.length), icon: Users, color: 'text-green-500' },
    { label: 'Views', value: '234', icon: Eye, color: 'text-blue-500' },
    { label: 'Avg Match Rate', value: `${stats.avgMatchRate}%`, icon: TrendingUp, color: 'text-yellow-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Manage your job postings and discover talent.</p>
        </div>
        <Link to="/dashboard/hirer/post-job">
          <Button variant="default" className="gap-2">
            <Plus className="w-4 h-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsDisplay.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl glass"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={cn('w-6 h-6', stat.color)} />
              <Badge variant="secondary">{stat.label}</Badge>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Job Postings</h2>
          <Link to="/dashboard/hirer/jobs">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="p-8 rounded-xl glass text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No jobs posted yet. Create your first job posting!</p>
              <Link to="/dashboard/hirer/post-job">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
              </Link>
            </div>
          ) : (
            jobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl glass flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {job.requiredSkills?.length || 0} required skills
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      job.isActive
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                    )}
                  >
                    {job.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Link to={`/dashboard/hirer/candidates?job=${job.id}`}>
                    <Button variant="outline" size="sm">
                      View Candidates
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// My Jobs Page
function MyJobsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await hirerApi.getMyJobs();
        setJobs(data);
      } catch (error) {
        toast({ title: 'Failed to load jobs', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const toggleJobStatus = async (job: Job) => {
    try {
      const updated = await hirerApi.updateJob(job.id, { isActive: !job.isActive } as Partial<JobInput>);
      setJobs(jobs.map(j => j.id === job.id ? { ...j, isActive: !j.isActive } : j));
      toast({ title: `Job ${job.isActive ? 'deactivated' : 'activated'}` });
    } catch (error) {
      toast({ title: 'Failed to update job', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Jobs</h1>
        <Link to="/dashboard/hirer/post-job">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="p-12 rounded-2xl glass text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No jobs posted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-6 rounded-2xl glass">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p className="text-muted-foreground">{job.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      job.isActive
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                    )}
                  >
                    {job.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleJobStatus(job)}
                  >
                    {job.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <span className="capitalize">{job.jobType?.replace('_', ' ').toLowerCase()}</span>
                {job.location && <span>📍 {job.location}</span>}
                {job.salary && <span>💰 {job.salary}</span>}
              </div>

              {job.description && (
                <p className="text-sm mb-4 line-clamp-2">{job.description}</p>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {job.requiredSkills?.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill.name} ({skill.weight}%)
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Link to={`/dashboard/hirer/candidates?job=${job.id}`}>
                  <Button variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    View Candidates
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Post Job Page
function PostJobPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<JobInput>({
    title: '',
    role: '',
    description: '',
    requiredSkills: [],
    jobType: 'FULL_TIME',
    location: '',
    salary: '',
  });
  const [newSkill, setNewSkill] = useState({ name: '', weight: 10 });

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    setForm({
      ...form,
      requiredSkills: [...form.requiredSkills, { ...newSkill }],
    });
    setNewSkill({ name: '', weight: 10 });
  };

  const removeSkill = (index: number) => {
    setForm({
      ...form,
      requiredSkills: form.requiredSkills.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.role || form.requiredSkills.length === 0) {
      toast({ title: 'Please fill in required fields and add at least one skill', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await hirerApi.createJob(form);
      toast({ title: 'Job posted successfully!' });
      navigate('/dashboard/hirer/jobs');
    } catch (error) {
      toast({ title: 'Failed to post job', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Post New Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="p-6 rounded-2xl glass space-y-4">
          <h2 className="text-lg font-semibold">Job Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Senior React Developer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                placeholder="e.g., Frontend Engineer"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the job responsibilities and requirements..."
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="jobType">Job Type</Label>
              <Select
                value={form.jobType}
                onValueChange={(value: JobInput['jobType']) => setForm({ ...form, jobType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="FREELANCE">Freelance</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Remote, NYC"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                placeholder="e.g., $100k-$150k"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass space-y-4">
          <h2 className="text-lg font-semibold">Required Skills *</h2>
          <p className="text-sm text-muted-foreground">Add skills with weights (importance percentage)</p>

          <div className="flex gap-2">
            <Input
              placeholder="Skill name"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              className="flex-1"
            />
            <Input
              type="number"
              min={1}
              max={100}
              placeholder="Weight %"
              value={newSkill.weight}
              onChange={(e) => setNewSkill({ ...newSkill, weight: parseInt(e.target.value) || 10 })}
              className="w-24"
            />
            <Button type="button" onClick={addSkill}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {form.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.requiredSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1.5">
                  {skill.name} ({skill.weight}%)
                  <button
                    type="button"
                    className="ml-2 hover:text-destructive"
                    onClick={() => removeSkill(index)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Briefcase className="w-4 h-4 mr-2" />}
          Post Job
        </Button>
      </form>
    </div>
  );
}

// Candidates Page
function CandidatesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<RecommendedApplicant[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());
  const [selectingId, setSelectingId] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await hirerApi.getMyJobs();
        setJobs(data);

        // Check for job param in URL
        const params = new URLSearchParams(window.location.search);
        const jobId = params.get('job');
        if (jobId && data.some(j => j.id === jobId)) {
          setSelectedJob(jobId);
        } else if (data.length > 0) {
          setSelectedJob(data[0].id);
        }
      } catch (error) {
        toast({ title: 'Failed to load jobs', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  useEffect(() => {
    const loadCandidates = async () => {
      if (!selectedJob) return;

      setLoadingCandidates(true);
      try {
        const data = await hirerApi.getRecommendedApplicants(selectedJob);
        setCandidates(data);

        // Load existing selections for this job
        const selections = await hirerApi.getSelectionsForJob(selectedJob);
        setSelectedApplicants(new Set(selections.map((s: any) => s.applicant.id)));
      } catch (error) {
        console.error('Failed to load candidates:', error);
        setCandidates([]);
      } finally {
        setLoadingCandidates(false);
      }
    };
    loadCandidates();
  }, [selectedJob]);

  const handleSelectApplicant = async (applicantId: string) => {
    if (!selectedJob) return;

    setSelectingId(applicantId);
    try {
      if (selectedApplicants.has(applicantId)) {
        // Unselect
        await hirerApi.unselectApplicant(selectedJob, applicantId);
        setSelectedApplicants(prev => {
          const next = new Set(prev);
          next.delete(applicantId);
          return next;
        });
        toast({ title: 'Applicant unselected' });
      } else {
        // Select
        await hirerApi.selectApplicant(selectedJob, applicantId);
        setSelectedApplicants(prev => new Set(prev).add(applicantId));
        toast({ title: 'Applicant selected! They will be notified.' });
      }
    } catch (error) {
      toast({ title: 'Failed to update selection', variant: 'destructive' });
    } finally {
      setSelectingId(null);
    }
  };

  const openSkillTwin = (userId: string) => {
    window.open(`http://localhost:8005?userId=${userId}`, '_blank');
  };

  const openTechStack = (userId: string) => {
    window.open(`http://localhost:8006?userId=${userId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Recommended Candidates</h1>

      {jobs.length === 0 ? (
        <div className="p-12 rounded-2xl glass text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Post a job first to see recommended candidates.</p>
          <Link to="/dashboard/hirer/post-job">
            <Button className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Post Job
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="p-6 rounded-2xl glass">
            <Label>Select Job</Label>
            <Select value={selectedJob || ''} onValueChange={setSelectedJob}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a job to view candidates" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadingCandidates ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-8 rounded-xl glass text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No matching candidates found for this job yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((candidate) => {
                const isSelected = selectedApplicants.has(candidate.id);
                const isSelecting = selectingId === candidate.id;

                return (
                  <div key={candidate.id} className={cn(
                    "p-6 rounded-2xl glass transition-all",
                    isSelected && "ring-2 ring-green-500"
                  )}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{candidate.user?.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.user?.email}</p>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          'text-lg px-3',
                          candidate.matchScore >= 80
                            ? 'bg-green-500'
                            : candidate.matchScore >= 60
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                        )}
                      >
                        {Math.round(candidate.matchScore)}%
                      </Badge>
                    </div>

                    {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-2">Matched Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {candidate.matchedSkills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {candidate.derivedSkills && candidate.derivedSkills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">All Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {candidate.derivedSkills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill.name}
                            </Badge>
                          ))}
                          {candidate.derivedSkills.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{candidate.derivedSkills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSkillTwin(candidate.userId)}
                        className="gap-1"
                      >
                        <Target className="w-4 h-4" />
                        Skill Twin
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTechStack(candidate.userId)}
                        className="gap-1"
                      >
                        <TrendingUp className="w-4 h-4" />
                        TechStack
                      </Button>
                      <Button
                        variant={isSelected ? "secondary" : "default"}
                        size="sm"
                        onClick={() => handleSelectApplicant(candidate.id)}
                        disabled={isSelecting}
                        className={cn("gap-1", isSelected && "bg-green-500/20 text-green-500 hover:bg-green-500/30")}
                      >
                        {isSelecting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isSelected ? (
                          <CheckCheck className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Notifications Page
function NotificationsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await notificationsApi.list();
        setNotifications(data);
      } catch {
        // No notifications
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      toast({ title: 'Failed to mark as read', variant: 'destructive' });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast({ title: 'All notifications marked as read' });
    } catch (error) {
      toast({ title: 'Failed to mark all as read', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      toast({ title: 'Failed to delete notification', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 rounded-2xl glass text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'p-4 rounded-xl glass flex items-start gap-4',
                !notification.isRead && 'border-l-4 border-primary'
              )}
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                notification.type === 'JOB_MATCH' ? 'bg-green-500/10' :
                  notification.type === 'SKILL_DERIVED' ? 'bg-blue-500/10' :
                    'bg-primary/10'
              )}>
                {notification.type === 'JOB_MATCH' ? (
                  <Briefcase className="w-5 h-5 text-green-500" />
                ) : notification.type === 'SKILL_DERIVED' ? (
                  <Target className="w-5 h-5 text-blue-500" />
                ) : (
                  <Bell className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h4 className={cn('font-medium', !notification.isRead && 'text-primary')}>
                  {notification.title}
                </h4>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {!notification.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(notification.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HirerDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/jobs" element={<MyJobsPage />} />
          <Route path="/post-job" element={<PostJobPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </main>
    </div>
  );
}