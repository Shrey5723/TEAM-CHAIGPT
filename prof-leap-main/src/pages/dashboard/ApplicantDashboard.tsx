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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Zap,
  LayoutDashboard,
  User,
  FileText,
  Award,
  Github,
  Briefcase,
  Bell,
  LogOut,
  ChevronRight,
  Upload,
  Plus,
  Target,
  TrendingUp,
  Check,
  Loader2,
  ExternalLink,
  Trash2,
  CheckCheck,
  Bot,
  Code,
  Compass,
  RefreshCw,
  Pencil,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  profileApi,
  resumeApi,
  certificatesApi,
  skillsApi,
  githubApi,
  jobsApi,
  notificationsApi,
  testApi,
  type Profile,
  type Certificate,
  type DerivedSkill,
  type GitHubRepo,
  type RecommendedJob,
  type SelectedJob,
  type Notification,
} from '@/lib/api';
import { SkillTestPage } from './SkillTest';
import { AntiGravityTracker } from '@/components/AntiGravityTracker';
import { GoalCentricAdvices } from '@/components/GoalCentricAdvices';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '' },
  { icon: User, label: 'Profile', path: 'profile' },
  { icon: FileText, label: 'Resume', path: 'resume' },
  { icon: Award, label: 'Certificates', path: 'certificates' },
  { icon: Github, label: 'GitHub', path: 'github' },
  { icon: Target, label: 'Skills', path: 'skills' },
  { icon: Briefcase, label: 'Jobs', path: 'jobs' },
  { icon: Bell, label: 'Notifications', path: 'notifications' },
];

// External AI Tools
const toolItems = [
  { icon: Bot, label: 'Skill Twin', url: 'http://localhost:8005', description: 'AI Digital Twin', external: true },
  { icon: Code, label: 'TechStack Analysis', url: '/dashboard/applicant/progress-tracker', description: 'Career Growth Trajectory', external: false },
  { icon: ClipboardCheck, label: 'Test Your Skills', url: '/dashboard/applicant/skill-test', description: 'Skill Assessment', external: false },
  { icon: Compass, label: 'Goal Advisor', url: '/dashboard/applicant/goal-advices', description: 'Career Path Analysis', external: false },
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

      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const fullPath = `/dashboard/applicant${item.path ? `/${item.path}` : ''}`;
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

        {/* AI Tools Section */}
        <div className="mt-6 pt-4 border-t border-sidebar-border">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">AI Tools</p>
          <ul className="space-y-1">
            {toolItems.map((tool) => (
              <li key={tool.label}>
                {tool.external ? (
                  <a
                    href={`${tool.url}?token=${localStorage.getItem('token')}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground group"
                  >
                    <tool.icon className="w-5 h-5 text-primary" />
                    <span className="flex-1">{tool.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <Link
                    to={tool.url}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground group',
                      location.pathname === tool.url && 'bg-sidebar-accent text-sidebar-accent-foreground'
                    )}
                  >
                    <tool.icon className="w-5 h-5 text-primary" />
                    <span className="flex-1">{tool.label}</span>
                    {location.pathname === tool.url && <ChevronRight className="w-4 h-4" />}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground">Applicant</p>
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

function OverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    profileCompletion: 0,
    skillsCount: 0,
    jobMatches: 0,
    avgMatchScore: 0,
  });
  const [recentJobs, setRecentJobs] = useState<RecommendedJob[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<SelectedJob[]>([]);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [hasCertificates, setHasCertificates] = useState(false);
  const [hasBio, setHasBio] = useState(false);
  const [hasLinkedIn, setHasLinkedIn] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [skills, jobs, profile, certificates, selected] = await Promise.all([
          skillsApi.list().catch(() => []),
          jobsApi.getRecommended().catch(() => []),
          profileApi.get().catch(() => null),
          certificatesApi.list().catch(() => []),
          jobsApi.getSelectedForMe().catch(() => []),
        ]);

        setSelectedJobs(selected);

        const avgScore = jobs.length > 0
          ? Math.round((jobs as RecommendedJob[]).reduce((sum: number, j: RecommendedJob) => sum + (j.matchScore || 0), 0) / jobs.length)
          : 0;

        // Check completion criteria
        let hasResume = false;
        let hasGithub = false;
        let bioFilled = false;
        let linkedInFilled = false;

        if (profile) {
          hasResume = !!profile.resume;
          hasGithub = !!(profile.githubRepos && profile.githubRepos.length > 0);
          bioFilled = !!(profile.bio && profile.bio.trim().length > 0);
          linkedInFilled = !!(profile.linkedInUrl && profile.linkedInUrl.trim().length > 0);
        }

        const hasCerts = certificates.length > 0;

        // Calculate profile completion: 5 criteria, each worth 20%
        let profileCompletion = 0;
        if (hasResume) profileCompletion += 20;
        if (hasGithub) profileCompletion += 20;
        if (bioFilled) profileCompletion += 20;
        if (linkedInFilled) profileCompletion += 20;
        if (hasCerts) profileCompletion += 20;

        setResumeUploaded(hasResume);
        setGithubConnected(hasGithub);
        setHasBio(bioFilled);
        setHasLinkedIn(linkedInFilled);
        setHasCertificates(hasCerts);

        setStats({
          profileCompletion,
          skillsCount: skills.length,
          jobMatches: jobs.length,
          avgMatchScore: avgScore,
        });
        setRecentJobs(jobs.slice(0, 3));
      } catch (error) {
        console.error('Failed to load overview data:', error);
      }
    };
    loadData();
  }, []);

  const statsDisplay = [
    { label: 'Profile Completion', value: `${stats.profileCompletion}%`, icon: User, color: 'text-primary' },
    { label: 'Skills Derived', value: String(stats.skillsCount), icon: Target, color: 'text-green-500' },
    { label: 'Job Matches', value: String(stats.jobMatches), icon: Briefcase, color: 'text-blue-500' },
    { label: 'Match Score Avg', value: `${stats.avgMatchScore}%`, icon: TrendingUp, color: 'text-yellow-500' },
  ];

  const actions = [
    resumeUploaded
      ? { label: 'Resume Uploaded', icon: Check, description: 'Your resume has been processed', path: 'resume', isComplete: true }
      : { label: 'Upload Resume', icon: Upload, description: 'Add your resume to derive skills', path: 'resume', isComplete: false },
    { label: 'Add Certificate', icon: Plus, description: 'Boost your profile with certifications', path: 'certificates', isComplete: false },
    githubConnected
      ? { label: 'GitHub Connected', icon: Check, description: 'Repositories synced', path: 'github', isComplete: true }
      : { label: 'Connect GitHub', icon: Github, description: 'Showcase your projects', path: 'github', isComplete: false },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your profile.</p>
      </div>

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

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link
              key={action.label}
              to={`/dashboard/applicant/${action.path}`}
              className="p-6 rounded-2xl glass hover-lift group"
            >
              <action.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                {action.label}
              </h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Job Matches</h2>
        <div className="space-y-4">
          {/* Selected Jobs First */}
          {selectedJobs.map((job) => (
            <div
              key={`selected-${job.id}`}
              className="p-4 rounded-xl glass flex items-center justify-between ring-2 ring-green-500 bg-green-500/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium">{job.title}</h4>
                  <p className="text-sm text-muted-foreground">{job.hirer?.name || 'Company'}</p>
                  <p className="text-xs text-green-500 mt-1">You've been selected for this role!</p>
                </div>
              </div>
              <Badge className="bg-green-500 text-white">
                Selected! ⭐
              </Badge>
            </div>
          ))}

          {/* Regular Job Matches */}
          {recentJobs.length === 0 && selectedJobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No job matches yet. Add skills to see recommendations.
            </p>
          ) : (
            recentJobs.map((job) => (
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
                    <p className="text-sm text-muted-foreground">{job.hirer?.name || 'Company'}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-sm',
                    job.matchScore >= 80
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : job.matchScore >= 70
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  )}
                >
                  {Math.round(job.matchScore)}% Match
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Profile Page
function ProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    linkedInUrl: '',
    courseraUrl: '',
    bio: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileApi.get();
        setProfile(data);
        setForm({
          linkedInUrl: data.linkedInUrl || '',
          courseraUrl: data.courseraUrl || '',
          bio: data.bio || '',
        });
      } catch {
        // Profile might not exist yet
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = profile ? profileApi.update : profileApi.create;
      const data = await method(form);
      setProfile(data);
      toast({ title: 'Profile saved successfully!' });
    } catch (error) {
      toast({ title: 'Failed to save profile', variant: 'destructive' });
    } finally {
      setSaving(false);
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
      <h1 className="text-3xl font-bold">Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="p-6 rounded-2xl glass space-y-4">
          <div>
            <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
            <Input
              id="linkedInUrl"
              placeholder="https://linkedin.com/in/yourprofile"
              value={form.linkedInUrl}
              onChange={(e) => setForm({ ...form, linkedInUrl: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              rows={4}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}

// Resume Page
function ResumePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingCgpa, setSavingCgpa] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cgpaInput, setCgpaInput] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileApi.get();
        setProfile(data);
        if (data.resume?.cgpa) {
          setCgpaInput(data.resume.cgpa);
        }
      } catch {
        // No profile yet
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Allow 'application/pdf' OR .pdf extension (case insensitive)
    const isPdfMime = file.type === 'application/pdf';
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');

    if (!isPdfMime && !isPdfExt) {
      console.error('Invalid file type:', file.type, file.name);
      toast({
        title: 'Invalid file format',
        description: `Expected PDF, got ${file.type || 'unknown type'}. Please upload a .pdf file.`,
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      console.log('Uploading resume:', file.name, file.size);
      await resumeApi.upload(file);
      const updatedProfile = await profileApi.get();
      setProfile(updatedProfile);
      if (updatedProfile.resume?.cgpa) {
        setCgpaInput(updatedProfile.resume.cgpa);
      }
      toast({ title: 'Resume uploaded successfully!' });
    } catch (error: any) {
      console.error('Resume upload error:', error);
      toast({
        title: 'Failed to upload resume',
        description: error.message || 'Server error occurred',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      // Reset input value to allow re-uploading the same file if needed
      e.target.value = '';
    }
  };

  const handleSaveCgpa = async () => {
    if (!cgpaInput.trim()) {
      toast({ title: 'Please enter your CGPA', variant: 'destructive' });
      return;
    }

    setSavingCgpa(true);
    try {
      await resumeApi.updateCgpa(cgpaInput.trim());
      const updatedProfile = await profileApi.get();
      setProfile(updatedProfile);
      toast({ title: 'CGPA saved successfully!' });
    } catch (error) {
      toast({ title: 'Failed to save CGPA', variant: 'destructive' });
    } finally {
      setSavingCgpa(false);
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
      <h1 className="text-3xl font-bold">Resume</h1>

      <div className="p-6 rounded-2xl glass">
        <div className="flex items-center gap-4 mb-6">
          <FileText className="w-12 h-12 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Upload Your Resume</h2>
            <p className="text-muted-foreground">PDF format only. We'll extract your skills automatically.</p>
          </div>
        </div>

        {profile?.resume ? (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">{profile.resume.filename}</p>
                  <p className="text-sm text-muted-foreground">
                    Uploaded on {new Date(profile.resume.uploadedAt).toLocaleDateString()}
                    {profile.resume.cgpa && ` • CGPA: ${profile.resume.cgpa}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <label className="block">
          <input
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            )}
            <p className="font-medium">{uploading ? 'Uploading...' : 'Click to upload PDF'}</p>
            <p className="text-sm text-muted-foreground">or drag and drop</p>
          </div>
        </label>
      </div>

      {/* CGPA Input Section */}
      {profile?.resume && (
        <div className="p-6 rounded-2xl glass">
          <div className="flex items-center gap-4 mb-4">
            <TrendingUp className="w-10 h-10 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Academic Performance</h2>
              <p className="text-muted-foreground">Enter your CGPA for better job matching</p>
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="cgpa">CGPA / GPA</Label>
              <Input
                id="cgpa"
                placeholder="e.g., 8.5 or 3.7/4.0"
                value={cgpaInput}
                onChange={(e) => setCgpaInput(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveCgpa} disabled={savingCgpa}>
              {savingCgpa ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Save CGPA
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            Your CGPA will be used in TechStack Analysis and career recommendations.
          </p>
        </div>
      )}
    </div>
  );
}

// Certificates Page
function CertificatesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', companyName: '', platform: '', date: '' });

  // Edit State
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [editForm, setEditForm] = useState({ name: '', companyName: '', platform: '', date: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const data = await certificatesApi.list();
        setCertificates(data);
      } catch {
        // No certificates
      } finally {
        setLoading(false);
      }
    };
    loadCertificates();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.companyName || !form.platform) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setAdding(true);
    try {
      const newCert = await certificatesApi.addManual(form);
      setCertificates([...certificates, newCert]);
      setForm({ name: '', companyName: '', platform: '', date: '' });
      setShowForm(false);
      toast({ title: 'Certificate added successfully!' });
    } catch (error) {
      toast({ title: 'Failed to add certificate', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleEditClick = (cert: Certificate) => {
    setEditingCert(cert);
    setEditForm({
      name: cert.name,
      companyName: cert.companyName,
      platform: cert.platform,
      date: cert.date ? new Date(cert.date).toISOString().split('T')[0] : ''
    });
  };

  const handleUpdate = async () => {
    if (!editingCert) return;
    setUpdating(true);
    try {
      const updated = await certificatesApi.update(editingCert.id, editForm);
      setCertificates(prev => prev.map(c => c.id === updated.id ? updated : c));
      setEditingCert(null);
      toast({ title: 'Certificate updated!', description: 'Skills are being re-analyzed.' });
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setUpdating(false);
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
        <h1 className="text-3xl font-bold">Certificates</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Certificate
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="p-6 rounded-2xl glass space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Certificate Name</Label>
              <Input
                id="name"
                placeholder="e.g., Machine Learning Specialization"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="companyName">Company/Issuer</Label>
              <Input
                id="companyName"
                placeholder="e.g., DeepLearning.AI"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Input
                id="platform"
                placeholder="e.g., Coursera"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={adding}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.length === 0 ? (
          <div className="col-span-2 p-12 rounded-2xl glass text-center">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No certificates yet. Add your first certificate to boost your profile!</p>
          </div>
        ) : (
          certificates.map((cert) => (
            <div key={cert.id} className="p-4 rounded-xl glass relative group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Award className="w-8 h-8 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">{cert.name}</h3>
                    <p className="text-sm text-muted-foreground">{cert.companyName}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary">{cert.platform}</Badge>
                      {cert.date && <Badge variant="outline">{new Date(cert.date).toLocaleDateString()}</Badge>}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleEditClick(cert)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>


      <Dialog open={!!editingCert} onOpenChange={(open) => !open && setEditingCert(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Name</Label>
              <Input
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Company/Issuer</Label>
              <Input
                value={editForm.companyName}
                onChange={e => setEditForm({ ...editForm, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Input
                value={editForm.platform}
                onChange={e => setEditForm({ ...editForm, platform: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={editForm.date}
                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCert(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}

// GitHub Page
function GitHubPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const location = useLocation();

  useEffect(() => {
    const handleOAuth = async () => {
      // Check for 'code' query param from GitHub callback
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');

      if (code) {
        try {
          // You would need to add this method to your API service
          await githubApi.oauthCallback(code);
          toast({ title: 'GitHub connected successfully!' });
          // Remove code from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          const data = await githubApi.getRepos();
          setRepos(data);
        } catch (error) {
          toast({ title: 'Failed to connect GitHub', variant: 'destructive' });
        }
      }
    };

    const loadRepos = async () => {
      try {
        const data = await githubApi.getRepos();
        setRepos(data);
      } catch {
        // Not connected
      } finally {
        setLoading(false);
      }
    };

    handleOAuth().then(() => loadRepos());
  }, [location.search, toast]);

  const handleConnect = async () => {
    try {
      const { authUrl } = await githubApi.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      toast({ title: 'Failed to initiate GitHub connection', variant: 'destructive' });
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
      <h1 className="text-3xl font-bold">GitHub Integration</h1>

      {repos.length === 0 ? (
        <div className="p-6 rounded-2xl glass space-y-4 text-center">
          <Github className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">Connect your GitHub</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Link your GitHub account to automatically showcase your projects and verify your coding skills.
          </p>
          <Button onClick={handleConnect} size="lg" className="mt-4">
            <Github className="w-5 h-5 mr-2" />
            Connect with GitHub
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            We only access your public repositories to analyze languages and activity.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Repositories ({repos.length})</h2>
            <Button
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive/10"
              onClick={async () => {
                if (window.confirm('Are you sure you want to disconnect? This will remove all synced repositories.')) {
                  setLoading(true);
                  try {
                    await githubApi.disconnect();
                    setRepos([]);
                    toast({ title: 'GitHub disconnected successfully' });
                  } catch (error) {
                    toast({ title: 'Failed to disconnect', variant: 'destructive' });
                  } finally {
                    setLoading(false);
                  }
                }
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect / Resync
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repos.map((repo) => (
              <div key={repo.id} className="p-4 rounded-xl glass">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{repo.repoName}</h3>
                  <a
                    href={repo.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex flex-wrap gap-1">
                  {repo.languages.map((lang) => (
                    <Badge key={lang} variant="secondary" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Updated: {new Date(repo.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Skills Page
function SkillsPage() {
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<DerivedSkill[]>([]);
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const data = await skillsApi.list();
        setSkills(data);
      } catch {
        // No skills
      } finally {
        setLoading(false);
      }
    };
    loadSkills();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await certificatesApi.sync();
      const data = await skillsApi.list();
      setSkills(data);
      toast({ title: 'Skills re-evaluated and synced successfully!', description: 'Your certificates have been analyzed with the latest AI model.' });
    } catch {
      toast({ title: 'Failed to sync skills', variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const groupedSkills = skills.reduce((acc, skill) => {
    let sourceKey = skill.source || 'other';

    // Group by certificate if available
    if (skill.certificate) {
      sourceKey = `cert:${skill.certificate.name}`;
    } else if (skill.source === 'certificate' || skill.source === 'certificate-ai') {
      // Fallback for certs without name populated
      sourceKey = 'cert:Unknown Certificate';
    }

    if (!acc[sourceKey]) acc[sourceKey] = [];
    acc[sourceKey].push(skill);
    return acc;
  }, {} as Record<string, DerivedSkill[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Derived Skills</h1>
          <p className="text-muted-foreground">
            Skills automatically extracted from your resume, certificates, and GitHub.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
          <RefreshCw className={cn("w-4 h-4 mr-2", syncing && "animate-spin")} />
          Sync Analysis
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="p-12 rounded-2xl glass text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No skills derived yet. Upload your resume or add certificates to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([source, sourceSkills]) => {
            const isCert = source.startsWith('cert:');
            const displayTitle = isCert ? source.replace('cert:', '') :
              source === 'github' ? 'GitHub Projects' :
                source === 'resume' ? 'Resume Analysis' : source;
            return (
              <div key={source} className="p-6 rounded-2xl glass">
                <h2 className="text-lg font-semibold mb-4 capitalize flex items-center gap-2">
                  {isCert && <Award className="w-5 h-5 text-primary" />}
                  {source === 'github' && <Github className="w-5 h-5 text-primary" />}
                  {source === 'resume' && <FileText className="w-5 h-5 text-primary" />}

                  {isCert ? (
                    <span className="flex items-center gap-2">
                      {sourceSkills.some(s => s.source === 'certificate-ai') && (
                        <Badge variant="secondary" className="mr-2 text-xs">AI Verified</Badge>
                      )}
                      {displayTitle}
                    </span>
                  ) : displayTitle}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {sourceSkills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className="px-3 py-1.5"
                    >
                      {skill.name}
                      <span className="ml-2 text-xs opacity-60">
                        {Math.round(skill.confidence * 100)}%
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Jobs Page
function JobsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await jobsApi.getRecommended();
        setJobs(data);
      } catch {
        // No jobs
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recommended Jobs</h1>
        <p className="text-muted-foreground">
          Jobs matched based on your skills and profile.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="p-12 rounded-2xl glass text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No job recommendations yet. Add more skills to see matching jobs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-6 rounded-2xl glass">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <p className="text-muted-foreground">{job.hirer?.name || 'Company'}</p>
                </div>
                <Badge
                  className={cn(
                    'text-lg px-4 py-1',
                    job.matchScore >= 80
                      ? 'bg-green-500 hover:bg-green-600'
                      : job.matchScore >= 70
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-yellow-500 hover:bg-yellow-600'
                  )}
                >
                  {Math.round(job.matchScore)}% Match
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {job.jobType && <span className="capitalize">{job.jobType.replace('_', ' ')}</span>}
                {job.location && <span>{job.location}</span>}
                {job.salary && <span>{job.salary}</span>}
              </div>

              {job.description && (
                <p className="text-sm mb-4 line-clamp-2">{job.description}</p>
              )}

              {job.matchedSkills && job.matchedSkills.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Matched Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {job.matchedSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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

// Skill Test Page

export default function ApplicantDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/github" element={<GitHubPage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/skill-test" element={<SkillTestPage />} />
          <Route path="/progress-tracker" element={<AntiGravityTracker />} />
          <Route path="/goal-advices" element={<GoalCentricAdvices />} />
        </Routes>
      </main>
    </div>
  );
}