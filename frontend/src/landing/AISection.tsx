import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Bot } from 'lucide-react';

export const AISection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-secondary/10 blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Your intelligent development partner.
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Advanced AI that understands your codebase, anticipates issues, and suggests solutions before you even ask.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Bot,
              title: 'Smart Code Review',
              description: 'AI analyzes your PRs for potential bugs, security issues, and optimization opportunities.',
              color: 'from-brand-primary to-brand-secondary'
            },
            {
              icon: Zap,
              title: 'Instant Context',
              description: 'Ask questions about any part of your codebase and get accurate, contextual answers instantly.',
              color: 'from-orange-400 to-red-500'
            },
            {
              icon: Shield,
              title: 'Security Scanning',
              description: 'Automatic detection of vulnerabilities and security anti-patterns in your code.',
              color: 'from-green-400 to-emerald-600'
            }
          ].map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-2xl glass hover:bg-white/5 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-zinc-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Chat Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-2xl glass"
        >
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
            <Bot className="w-5 h-5 text-brand-secondary" />
            <span className="text-white font-medium">DevConnect AI</span>
            <span className="text-xs text-green-500">● Online</span>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-secondary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-brand-secondary" />
              </div>
              <div className="bg-white/5 rounded-xl p-3 max-w-md">
                <p className="text-sm text-zinc-300">I noticed you're implementing authentication. Would you like me to add password reset functionality? I can generate the complete flow in about 50 lines of code.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
