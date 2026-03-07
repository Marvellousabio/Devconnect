import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, Users } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Create Project',
    description: 'Initialize your workspace in seconds with pre-configured templates or start from scratch.',
    icon: CheckCircle2
  },
  {
    number: '02',
    title: 'Invite Team',
    description: 'Add collaborators with role-based permissions and real-time presence indicators.',
    icon: Users
  },
  {
    number: '03',
    title: 'Track Progress',
    description: 'Visualize your sprint with Kanban boards, burndown charts, and automated updates.',
    icon: Clock
  },
  {
    number: '04',
    title: 'Ship Faster',
    description: 'Deploy directly from the platform with integrated CI/CD and instant feedback loops.',
    icon: ArrowRight
  }
];

export const WorkflowSection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            From idea to production.
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            A streamlined workflow that keeps your team focused on what matters most—shipping great software.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/20 to-transparent" />
              )}

              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-brand-primary/30 transition-colors group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-bold text-zinc-700 font-display group-hover:text-brand-primary transition-colors">
                    {step.number}
                  </span>
                  <step.icon className="w-5 h-5 text-zinc-500 group-hover:text-brand-primary transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
