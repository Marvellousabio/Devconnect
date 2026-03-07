import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Search, FileText, CheckCircle, Zap, Activity } from 'lucide-react';

const workflowFeatures = [
  {
    title: 'Deep Linking',
    description: 'Mentioning a task in chat generates a preview card automatically.',
    icon: Zap
  },
  {
    title: 'Command Palette',
    description: 'Keyboard shortcut interface allowing instant navigation.',
    icon: Command
  },
  {
    title: 'Live Preview',
    description: 'Code changes reflected instantly in a preview environment.',
    icon: Activity
  },
  {
    title: 'Activity Heatmaps',
    description: 'Visualizing team velocity and contribution trends.',
    icon: Activity
  }
];

export const WorkflowSection = () => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);

  return (
    <section className="py-24 bg-zinc-950/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Animated UI */}
          <div className="relative aspect-square lg:aspect-video rounded-3xl glass overflow-hidden flex items-center justify-center p-12">
            <div className="absolute inset-0 bg-grid opacity-20" />
            
            {/* Command Palette Mockup */}
            <AnimatePresence>
              {isPaletteOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="w-full max-w-md glass rounded-2xl shadow-2xl overflow-hidden z-10"
                >
                  <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <Search className="w-5 h-5 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Search files, tasks, or users..." 
                      className="bg-transparent border-none outline-none text-sm w-full text-white"
                      readOnly
                      value="Refactor"
                    />
                    <div className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-zinc-400 font-mono">ESC</div>
                  </div>
                  <div className="p-2">
                    <div className="px-3 py-2 rounded-lg bg-brand-primary/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-brand-primary" />
                        <span className="text-sm">Refactor Auth Flow</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">Task #402</span>
                    </div>
                    <div className="px-3 py-2 rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm">Refactor Database Schema</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">Task #398</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Background elements */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-3xl" />
          </div>

          {/* Right: Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold font-display mb-6">Eliminate tool fatigue.</h2>
              <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
                DevConnect brings all your developer tools into one unified interface. No more jumping between tabs.
              </p>

              <div className="space-y-8">
                {workflowFeatures.map((feature, idx) => (
                  <div key={feature.title} className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">{feature.title}</h4>
                      <p className="text-zinc-400 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
