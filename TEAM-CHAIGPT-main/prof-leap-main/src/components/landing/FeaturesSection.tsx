import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  FileText, 
  Award, 
  Github, 
  Brain, 
  Target, 
  Bell,
  Zap,
  Shield
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Smart Resume Parsing',
    description: 'Upload your resume and let AI extract key information including CGPA and skills automatically.',
  },
  {
    icon: Award,
    title: 'Certificate Verification',
    description: 'Add professional certificates from Coursera, Udemy, and more. Skills derived instantly.',
  },
  {
    icon: Github,
    title: 'GitHub Integration',
    description: 'Connect your GitHub to showcase projects. We analyze languages and activity for skill verification.',
  },
  {
    icon: Brain,
    title: 'AI Skill Derivation',
    description: 'Our AI evaluates your credentials against industry standards for accurate skill confidence scores.',
  },
  {
    icon: Target,
    title: 'Weighted Matching',
    description: 'Hirers define skill weights. Our algorithm finds candidates with the best skill overlap.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get notified instantly when new jobs match your skills or when skills are derived.',
  },
  {
    icon: Zap,
    title: 'Skill Assessments',
    description: 'Take AI-generated tests to validate and improve your skill scores over time.',
  },
  {
    icon: Shield,
    title: 'Trust-Based Scoring',
    description: 'Skill confidence based on source reputation, recency, and validation results.',
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="relative py-32 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div className="relative container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From skill discovery to perfect matches, our platform handles the complexity so you can focus on what matters.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl glass hover-lift cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
