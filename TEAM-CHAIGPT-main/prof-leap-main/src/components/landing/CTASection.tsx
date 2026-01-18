import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-32 overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card/50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 rounded-full blur-[150px]" />

      <div className="relative container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-8">
            <Sparkles className="w-4 h-4" />
            Ready to Transform Your Hiring?
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Start Matching{' '}
            <span className="gradient-text">Today</span>
          </h2>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of companies and candidates using intelligent skill matching
            to find the perfect fit.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=APPLICANT">
              <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
                I'm Looking for Jobs
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/register?role=HIRER">
              <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                I'm Hiring Talent
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
