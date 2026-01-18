import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Zap, LogOut, User, Briefcase } from 'lucide-react';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:shadow-[0_0_20px_-5px_hsl(217_91%_60%/0.6)] transition-shadow duration-300">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SkillMatch</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/#features"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Features
            </Link>
            <Link
              to="/#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              How It Works
            </Link>
            <Link
              to="/jobs"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Browse Jobs
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to={user?.role === 'HIRER' ? '/dashboard/hirer' : '/dashboard/applicant'}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    {user?.role === 'HIRER' ? (
                      <Briefcase className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
