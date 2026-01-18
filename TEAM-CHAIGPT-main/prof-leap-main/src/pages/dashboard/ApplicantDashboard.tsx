import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const stats = [
    { label: 'Profile Completion', value: '65%', icon: User, color: 'text-primary' },
    { label: 'Skills Derived', value: '8', icon: Target, color: 'text-green-500' },
    { label: 'Job Matches', value: '12', icon: Briefcase, color: 'text-blue-500' },
    { label: 'Match Score Avg', value: '78%', icon: TrendingUp, color: 'text-yellow-500' },
  ];

  const actions = [
    { label: 'Upload Resume', icon: Upload, description: 'Add your resume to derive skills', path: 'resume' },
    { label: 'Add Certificate', icon: Plus, description: 'Boost your profile with certifications', path: 'certificates' },
    { label: 'Connect GitHub', icon: Github, description: 'Showcase your projects', path: 'github' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your profile.</p>
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

      {/* Quick Actions */}
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

      {/* Recent Matches */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Job Matches</h2>
        <div className="space-y-4">
          {[
            { title: 'Senior React Developer', company: 'TechCorp', match: 85 },
            { title: 'Full Stack Engineer', company: 'StartupXYZ', match: 72 },
            { title: 'Frontend Lead', company: 'DesignHub', match: 68 },
          ].map((job) => (
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
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'text-sm',
                  job.match >= 80
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : job.match >= 70
                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                )}
              >
                {job.match}% Match
              </Badge>
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

export default function ApplicantDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
          <Route path="/resume" element={<PlaceholderPage title="Resume" />} />
          <Route path="/certificates" element={<PlaceholderPage title="Certificates" />} />
          <Route path="/github" element={<PlaceholderPage title="GitHub" />} />
          <Route path="/skills" element={<PlaceholderPage title="Skills" />} />
          <Route path="/jobs" element={<PlaceholderPage title="Recommended Jobs" />} />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
        </Routes>
      </main>
    </div>
  );
}