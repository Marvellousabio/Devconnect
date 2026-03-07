import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/10 via-transparent to-transparent" />
      
      <div className="max-w-4xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-400">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Join thousands of developers who have already revolutionized their development process with DevConnect.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg flex items-center gap-2 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-shadow"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <button className="px-8 py-4 rounded-full bg-transparent text-white font-bold text-lg border border-white/20 hover:bg-white/5 transition-colors">
              Schedule Demo
            </button>
          </div>

          <p className="mt-8 text-sm text-zinc-500">
            No credit card required • Start with our free tier • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};
