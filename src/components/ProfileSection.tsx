import React from 'react';
import { motion } from 'framer-motion';
import { Award, Github, Linkedin, Twitter, ExternalLink, Code2 } from 'lucide-react';

export const ProfileSection = () => {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Your Developer Identity Reimagined.</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Build your reputation with verified contributions. Turn your work into a living portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile Card */}
          <div className="lg:col-span-1">
            <div className="p-8 rounded-3xl glass flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary p-1">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                    <img src="https://picsum.photos/seed/dev/200/200" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center border-4 border-black">
                  <Award className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">Alex Rivera</h3>
              <p className="text-zinc-500 text-sm mb-6">Senior Full Stack Engineer</p>
              
              <div className="flex gap-4 mb-8">
                <Github className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer" />
                <Linkedin className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer" />
                <Twitter className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer" />
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Reputation</span>
                  <span className="text-brand-primary font-bold">2,480 XP</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-[75%] h-full bg-brand-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dashboard Visual */}
          <div className="lg:col-span-2">
            <div className="p-8 rounded-3xl glass h-full">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-lg font-bold">Contribution Activity</h4>
                <div className="flex gap-2">
                  <span className="text-[10px] text-zinc-500">Last 12 months</span>
                </div>
              </div>

              {/* Simulated Contribution Graph */}
              <div className="grid grid-cols-12 gap-2 mb-10">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`aspect-square rounded-sm ${
                      i % 7 === 0 ? 'bg-brand-primary' : 
                      i % 5 === 0 ? 'bg-brand-primary/60' : 
                      i % 3 === 0 ? 'bg-brand-primary/30' : 'bg-white/5'
                    }`} 
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Code2 className="w-5 h-5 text-brand-secondary" />
                    <span className="text-sm font-bold">Top Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Rust', 'WebGL', 'Node.js'].map(skill => (
                      <span key={skill} className="px-2 py-1 rounded bg-zinc-800 text-[10px] text-zinc-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold">Recent Projects</span>
                    <ExternalLink className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">DevConnect UI</span>
                      <span className="text-zinc-500">24 commits</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">Fast-API-Core</span>
                      <span className="text-zinc-500">12 commits</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
