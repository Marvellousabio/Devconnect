import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, 
  LayoutGrid, 
  MessageSquare, 
  Bug, 
  GitBranch, 
  Users 
} from 'lucide-react';

const modules = [
  {
    title: 'Cloud IDE',
    description: 'Collaborative browser based code editing with real time syncing.',
    icon: Cloud,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  {
    title: 'Sprint Boards',
    description: 'Dynamic Kanban and Scrum boards designed for developer workflows.',
    icon: LayoutGrid,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  },
  {
    title: 'DevStreams',
    description: 'Contextual chat rooms linked directly to repositories or project milestones.',
    icon: MessageSquare,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  },
  {
    title: 'Issue Engine',
    description: 'Advanced bug tracking with automated triage and priority weighting.',
    icon: Bug,
    color: 'text-red-400',
    bg: 'bg-red-400/10'
  },
  {
    title: 'Repo Hub',
    description: 'Integrated Git interface for branches, pull requests, and commits.',
    icon: GitBranch,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10'
  },
  {
    title: 'Talent Matrix',
    description: 'Developer profiles displaying skills, contribution graphs, and experience.',
    icon: Users,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10'
  }
];

export const CoreModules = () => {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">Built for the modern stack.</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Everything you need to build, track, and ship high-quality software without the overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, idx) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-8 rounded-3xl glass group cursor-pointer relative overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-2xl ${module.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <module.icon className={`w-6 h-6 ${module.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{module.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {module.description}
              </p>
              
              {/* Decorative Gradient */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-primary/5 blur-3xl group-hover:bg-brand-primary/10 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
