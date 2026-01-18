import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  Clock,
  Briefcase,
  Building2,
  DollarSign,
  Filter,
} from 'lucide-react';

// Mock data for demonstration
const mockJobs = [
  {
    id: '1',
    title: 'Senior React Developer',
    role: 'Frontend Engineer',
    description: 'Build next-gen web applications with React and TypeScript.',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$120k - $150k',
    jobType: 'FULL_TIME',
    requiredSkills: [
      { name: 'react', weight: 3 },
      { name: 'typescript', weight: 2 },
      { name: 'nodejs', weight: 1 },
    ],
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    role: 'Software Engineer',
    description: 'Work on both frontend and backend systems for our platform.',
    company: 'StartupXYZ',
    location: 'Remote',
    salary: '$100k - $130k',
    jobType: 'FULL_TIME',
    requiredSkills: [
      { name: 'python', weight: 3 },
      { name: 'react', weight: 2 },
      { name: 'postgresql', weight: 2 },
    ],
    createdAt: '2026-01-14',
  },
  {
    id: '3',
    title: 'Machine Learning Engineer',
    role: 'ML Engineer',
    description: 'Design and implement ML models for production systems.',
    company: 'AI Dynamics',
    location: 'New York, NY',
    salary: '$140k - $180k',
    jobType: 'FULL_TIME',
    requiredSkills: [
      { name: 'python', weight: 3 },
      { name: 'tensorflow', weight: 3 },
      { name: 'pytorch', weight: 2 },
    ],
    createdAt: '2026-01-13',
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    role: 'Platform Engineer',
    description: 'Manage cloud infrastructure and CI/CD pipelines.',
    company: 'CloudScale',
    location: 'Austin, TX',
    salary: '$110k - $140k',
    jobType: 'CONTRACT',
    requiredSkills: [
      { name: 'aws', weight: 3 },
      { name: 'kubernetes', weight: 3 },
      { name: 'terraform', weight: 2 },
    ],
    createdAt: '2026-01-12',
  },
];

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Internship',
};

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requiredSkills.some((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesLocation =
      !locationFilter ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect <span className="gradient-text">Role</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse jobs matched to your skills. Our AI ensures the best fit for
              your expertise.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, roles, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-background border-border"
                />
              </div>
              <div className="relative md:w-64">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 h-12 bg-background border-border"
                />
              </div>
              <Button variant="default" size="lg" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </motion.div>

          {/* Results Count */}
          <div className="mb-6 text-muted-foreground">
            Showing {filteredJobs.length} jobs
          </div>

          {/* Job Cards */}
          <div className="space-y-4">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass rounded-2xl p-6 hover-lift cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-7 h-7 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <Badge variant="secondary" className="shrink-0">
                        {jobTypeLabels[job.jobType]}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill) => (
                        <Badge
                          key={skill.name}
                          variant="outline"
                          className="bg-primary/5 border-primary/20 text-primary"
                        >
                          {skill.name}
                          <span className="ml-1 opacity-60">×{skill.weight}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button variant="default" className="shrink-0">
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">
                No jobs found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}