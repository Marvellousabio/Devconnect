import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileSearch, ShieldAlert, UserPlus, Code2 } from 'lucide-react';

export const AISection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative rounded-3xl glass p-8 overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-10" />
              
              <div className="relative space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-display">DevConnect Intelligence</h3>
                </div>

                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4"
                  >
                    <FileSearch className="w-5 h-5 text-brand-primary shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold mb-1">Auto Documentation</p>
                      <p className="text-xs text-zinc-400">Generated README.md based on recent commits in /src/api.</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-start gap-4"
                  >
                    <ShieldAlert className="w-5 h-5 text-brand-accent shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold mb-1">Bug Prediction</p>
                      <p className="text-xs text-zinc-400">Potential memory leak detected in session.ts:124. Review suggested.</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4"
                  >
                    <UserPlus className="w-5 h-5 text-brand-secondary shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-bold mb-1">Smart Assign</p>
                      <p className="text-xs text-zinc-400">Recommended @alex for this task based on expertise in WebGL.</p>
                    </div>
                  </motion.div>
                </div>

                {/* Simulated AI Typing */}
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                    <span className="text-[10px] text-zinc-500 font-mono">AI is analyzing your codebase...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-4xl md:text-6xl font-bold font-display mb-6">Intelligence that understands.</h2>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              DevConnect includes a native AI layer that indexes your entire project history, documentation, and code structure to provide context-aware assistance.
            </p>
            <ul className="space-y-4">
              {[
                'Automatically generate project documentation.',
                'Identify risky commits before they merge.',
                'Recommend developers based on skill profiles.'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-zinc-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
