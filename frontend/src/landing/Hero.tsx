import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Layout, MousePointer2, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-brand-primary/10 blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-secondary/10 blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-brand-primary mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
            </span>
            v2.0 is now live
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
          >
            The Operating System for <br /> Agile Developers.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Stop context switching. DevConnect merges your codebase, your conversations, and your sprint boards into a single synchronized environment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/register" className="px-8 py-4 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Initialize Workspace
            </Link>
            <button className="px-8 py-4 rounded-full bg-zinc-900 text-white font-bold border border-white/10 hover:bg-zinc-800 transition-colors">
              View Demo
            </button>
            <button className="px-8 py-4 rounded-full bg-transparent text-zinc-400 font-bold hover:text-white transition-colors flex items-center gap-2">
              Explore Open Source
            </button>
          </motion.div>
        </div>

        {/* Hero Visual - Split Screen */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 rounded-3xl glass shadow-2xl"
        >
          {/* Left Panel: Code Editor */}
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/5 overflow-hidden flex flex-col h-[400px]">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex gap-4">
                <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> App.tsx
                </span>
                <span className="text-[10px] text-zinc-600 font-mono">Navbar.tsx</span>
              </div>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed overflow-hidden relative">
              <div className="text-zinc-500">1</div>
              <div className="text-zinc-500">2</div>
              <div className="text-zinc-500">3</div>
              <div className="absolute top-6 left-12 right-6">
                <p><span className="text-brand-secondary">import</span> {'{'} motion {'}'} <span className="text-brand-secondary">from</span> <span className="text-green-400">"framer-motion"</span>;</p>
                <p><span className="text-brand-secondary">export const</span> <span className="text-brand-primary">Hero</span> = () ={'>'} {'{'}</p>
                <p className="pl-4"><span className="text-brand-secondary">return</span> (</p>
                <p className="pl-8 text-zinc-400">{'<'}<span className="text-brand-primary">motion.div</span></p>
                <p className="pl-12 text-zinc-400">initial={'{'}{'{'} opacity: 0 {'}'}{'}'}</p>
                <p className="pl-12 text-zinc-400">animate={'{'}{'{'} opacity: 1 {'}'}{'}'}</p>
                <p className="pl-8 text-zinc-400">{'>'}</p>
                <div className="flex items-center">
                  <p className="pl-12 text-zinc-300">Hello DevConnect</p>
                  <motion.div 
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.2,
                      times: [0, 0.4, 0.6, 1],
                      repeatDelay: 0.8
                    }}
                    className="w-2 h-5 bg-brand-primary ml-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Kanban Board */}
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/5 overflow-hidden flex flex-col h-[400px]">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Sprint Board</span>
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full border border-black bg-zinc-800" />
                ))}
              </div>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 h-full">
              {['Todo', 'In Progress', 'Done'].map((col, idx) => (
                <div key={col} className="flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{col}</span>
                  {idx === 0 && (
                    <motion.div 
                      whileHover={{ y: -2, scale: 1.02 }}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
                    >
                      <div className="w-full h-1 bg-brand-primary/30 rounded-full mb-2" />
                      <p className="text-[10px] text-zinc-300">Refactor Auth Flow</p>
                    </motion.div>
                  )}
                  {idx === 1 && (
                    <motion.div 
                      whileHover={{ y: -2, scale: 1.02 }}
                      className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 cursor-pointer"
                    >
                      <div className="w-full h-1 bg-brand-primary rounded-full mb-2" />
                      <p className="text-[10px] text-zinc-100">Implement GSAP</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full bg-brand-primary/20" />
                        </div>
                        <MousePointer2 className="w-3 h-3 text-brand-primary animate-bounce" />
                      </div>
                    </motion.div>
                  )}
                  {idx === 2 && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 opacity-50">
                      <p className="text-[10px] text-zinc-400 line-through">Setup CI/CD</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Floating UI Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 p-4 rounded-2xl glass shadow-xl hidden lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <p className="text-xs font-bold">New PR Approved</p>
                <p className="text-[10px] text-zinc-500">by @marvellous</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -left-10 p-4 rounded-2xl glass shadow-xl hidden lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                <Layout className="w-4 h-4 text-brand-primary" />
              </div>
              <p className="text-xs font-medium">Deployment Successful</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
