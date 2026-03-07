import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, Tag } from 'lucide-react';

const issues = [
  {
    id: 'DC-142',
    title: 'Implement OAuth2 flow for GitHub integration',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah K.',
    tags: ['backend', 'security']
  },
  {
    id: 'DC-143',
    title: 'Fix memory leak in WebSocket handler',
    status: 'todo',
    priority: 'critical',
    assignee: 'Alex M.',
    tags: ['bug', 'performance']
  },
  {
    id: 'DC-144',
    title: 'Add dark mode toggle to settings',
    status: 'done',
    priority: 'low',
    assignee: 'Mike R.',
    tags: ['frontend', 'ui']
  }
];

export const IssueSection = () => {
  return (
    <section className="py-32 relative bg-zinc-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Issues that actually get solved.
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Track bugs, features, and tasks with intelligent automation that keeps your team moving forward.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl glass overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">Sprint 24</span>
              <span className="text-zinc-500 text-sm">Mar 1 - Mar 15</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-zinc-400 text-sm">12 done</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-primary" />
                <span className="text-zinc-400 text-sm">5 in progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-500" />
                <span className="text-zinc-400 text-sm">3 todo</span>
              </div>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-3 divide-x divide-white/5">
            {/* Todo */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-zinc-500 uppercase">To Do</span>
                <span className="text-xs text-zinc-600">3</span>
              </div>
              <div className="space-y-3">
                {issues.filter(i => i.status === 'todo').map((issue) => (
                  <div key={issue.id} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-primary/30 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-zinc-500">{issue.id}</span>
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    </div>
                    <p className="text-sm text-white mb-3">{issue.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {issue.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-brand-primary/10 text-brand-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-zinc-700" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-zinc-500 uppercase">In Progress</span>
                <span className="text-xs text-zinc-600">5</span>
              </div>
              <div className="space-y-3">
                {issues.filter(i => i.status === 'in-progress').map((issue) => (
                  <motion.div
                    whileHover={{ y: -2 }}
                    key={issue.id}
                    className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-zinc-500">{issue.id}</span>
                      <Clock className="w-3 h-3 text-brand-primary" />
                    </div>
                    <p className="text-sm text-white mb-3">{issue.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {issue.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-brand-primary/10 text-brand-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-brand-primary/50" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Done */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-zinc-500 uppercase">Done</span>
                <span className="text-xs text-zinc-600">12</span>
              </div>
              <div className="space-y-3">
                {issues.filter(i => i.status === 'done').map((issue) => (
                  <div key={issue.id} className="p-3 rounded-xl bg-white/5 border border-white/10 opacity-60">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-zinc-500">{issue.id}</span>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    </div>
                    <p className="text-sm text-zinc-400 mb-3 line-through">{issue.title}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {issue.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-green-500/50" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
