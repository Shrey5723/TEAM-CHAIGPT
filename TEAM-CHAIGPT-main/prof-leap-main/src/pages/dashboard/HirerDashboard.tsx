import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
          <span className="text-xl font-bold">SkillMatch</span>
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

function OverviewPage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Jobs', value: '4', icon: Briefcase, color: 'text-primary' },
    { label: 'Total Applicants', value: '48', icon: Users, color: 'text-green-500' },
    { label: 'Views', value: '234', icon: Eye, color: 'text-blue-500' },
    { label: 'Avg Match Rate', value: '72%', icon: TrendingUp, color: 'text-yellow-500' },
  ];

  const recentJobs = [
    { title: 'Senior React Developer', applicants: 15, status: 'Active' },
    { title: 'Full Stack Engineer', applicants: 23, status: 'Active' },
    { title: 'DevOps Engineer', applicants: 10, status: 'Active' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Manage your job postings and discover talent.</p>
        </div>
        <Link to="/dashboard/hirer/post-job">
          <Button variant="hero" className="gap-2">
            <Plus className="w-4 h-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
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
          {recentJobs.map((job) => (
            <div
              key={job.title}
              className="p-4 rounded-xl glass flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{job.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {job.applicants} applicants
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-500 border-green-500/20"
                >
                  {job.status}
                </Badge>
                <Button variant="outline" size="sm">
                  View Candidates
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Candidates */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Top Matching Candidates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'John Doe', skills: ['React', 'TypeScript'], match: 92 },
            { name: 'Jane Smith', skills: ['Python', 'ML'], match: 88 },
            { name: 'Mike Johnson', skills: ['Node.js', 'AWS'], match: 85 },
          ].map((candidate) => (
            <div key={candidate.name} className="p-4 rounded-xl glass">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{candidate.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {candidate.skills.join(' • ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {candidate.match}% Match
                </Badge>
                <Button variant="ghost" size="sm">
                  View Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="p-12 rounded-2xl glass text-center">
        <p className="text-muted-foreground">
          This section is coming soon. Connect your backend to enable full functionality.
        </p>
      </div>
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
          <Route path="/jobs" element={<PlaceholderPage title="My Jobs" />} />
          <Route path="/post-job" element={<PlaceholderPage title="Post New Job" />} />
          <Route path="/candidates" element={<PlaceholderPage title="Candidates" />} />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
        </Routes>
      </main>
    </div>
  );
}