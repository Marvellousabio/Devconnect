import React from 'react';
import { motion } from 'framer-motion';
import { Code2, MessageSquare, Kanban, GitBranch, Zap, Shield } from 'lucide-react';

const modules = [
  {
    icon: Code2,
    title: 'Code Editor',
    description: 'Full-featured IDE with AI-powered completions, real-time collaboration, and seamless Git integration.',
    color: 'from-brand-primary to-brand-secondary'
  },
  {
    icon: MessageSquare,
    title: 'Team Chat',
    description: 'Integrated messaging with code snippet sharing, markdown support, and threaded conversations.',
    color: 'from-green-400 to-emerald-600'
  },
  {
    icon: Kanban,
    title: 'Kanban Boards',
    description: 'Visual project management with drag-and-drop cards, sprint planning, and progress tracking.',
    color: 'from-orange-400 to-red-500'
  },
  {
    icon: GitBranch,
    title: 'Repository',
    description: 'Complete Git workflow with PR reviews, CI/CD pipelines, and automated deployments.',
    color: 'from-blue-400 to-indigo-600'
  },
  {
    icon: Zap,
    title: 'AI Assistant',
    description: 'Smart automation for code reviews, bug detection, and intelligent suggestions.',
    color: 'from-purple-400 to-pink-500'
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Enterprise-grade security with SSO, role-based access, and audit logs.',
    color: 'from-cyan-400 to-blue-500'
  }
];

export const CoreModules = () => {
  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Everything you need to ship.
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Six powerful modules working in perfect harmony to accelerate your development workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, idx) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-6 rounded-2xl glass hover:bg-white/5 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <module.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{module.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
