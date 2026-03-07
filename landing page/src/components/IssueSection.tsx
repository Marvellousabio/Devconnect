import React from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Tag, GitMerge, Milestone, BarChart3 } from 'lucide-react';

const data = [
  { name: 'Mon', value: 40 },
  { name: 'Tue', value: 30 },
  { name: 'Wed', value: 60 },
  { name: 'Thu', value: 45 },
  { name: 'Fri', value: 90 },
  { name: 'Sat', value: 75 },
  { name: 'Sun', value: 95 },
];

export const IssueSection = () => {
  return (
    <section className="py-24 bg-zinc-950/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold font-display mb-6">Track less. Ship more.</h2>
            <p className="text-zinc-400 text-lg mb-10">
              Automate the mundane. AI-powered labeling, dependency mapping, and real-time burndown tracking.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'Automated Labeling', icon: Tag, desc: 'AI generated tags based on descriptions.' },
                { title: 'Dependency Mapping', icon: GitMerge, desc: 'Graph visualization of issue relationships.' },
                { title: 'Milestone Tracking', icon: Milestone, desc: 'Grouping tasks into releases.' },
                { title: 'Burndown Charts', icon: BarChart3, desc: 'Real time sprint progress tracking.' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl glass border-white/5">
                  <item.icon className="w-5 h-5 text-brand-primary mb-2" />
                  <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative p-8 rounded-3xl glass overflow-hidden min-h-[400px]">
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold">Sprint Velocity</h3>
                  <p className="text-xs text-zinc-500">Real-time team performance</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-2 py-1 rounded bg-brand-primary/10 text-[10px] text-brand-primary font-bold">ACTIVE</div>
                </div>
              </div>

              <div className="flex-1 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#52525b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#00f2ff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#00f2ff" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 uppercase">Completed</p>
                  <p className="text-xl font-bold text-brand-primary">84%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 uppercase">Remaining</p>
                  <p className="text-xl font-bold text-zinc-300">12</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 uppercase">Velocity</p>
                  <p className="text-xl font-bold text-brand-secondary">42.5</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
