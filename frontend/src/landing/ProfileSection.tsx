import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Link as LinkIcon, Github, Twitter } from 'lucide-react';

export const ProfileSection = () => {
  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Your profile, unified.
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Showcase your contributions, skills, and activity across all your projects in one beautiful profile.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl glass p-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary p-1">
                  <div className="w-full h-full rounded-2xl bg-zinc-900 flex items-center justify-center">
                    <User className="w-12 h-12 text-zinc-400" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-zinc-900" />
              </div>
              
              <div className="text-center md:text-left flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">Marvellous Ogunleke</h3>
                <p className="text-zinc-400 mb-4">Full Stack Developer</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Lagos, Nigeria
                  </div>
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    marvel.dev
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Github className="w-5 h-5 text-zinc-400" />
                </button>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Twitter className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { value: '247', label: 'Contributions' },
                { value: '42', label: 'Projects' },
                { value: '1.2k', label: 'Followers' },
                { value: '89', label: 'Reviews' }
              ].map((stat, idx) => (
                <div key={idx} className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-zinc-400 uppercase mb-3">Top Skills</h4>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'GraphQL'].map(skill => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="text-sm font-bold text-zinc-400 uppercase mb-3">Recent Activity</h4>
              <div className="space-y-3">
                {[
                  { action: 'Merged PR', project: 'devconnect-frontend', time: '2 hours ago' },
                  { action: 'Opened issue', project: 'api-service', time: '5 hours ago' },
                  { action: 'Deployed to', project: 'production', time: '1 day ago' }
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-zinc-300">{activity.action}</span>
                      <span className="text-sm text-zinc-500">{activity.project}</span>
                    </div>
                    <span className="text-xs text-zinc-600">{activity.time}</span>
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
