import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Bot, Code, Check } from 'lucide-react';

export const MessagingSection = () => {
  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold font-display mb-6">Communication in Context.</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Discuss code where it lives. Threaded reviews, instant huddles, and automated bot notifications.
          </p>
        </div>

        <div className="relative flex flex-col items-center">
          {/* Desktop to Mobile Transition Visual */}
          <div className="w-full max-w-5xl aspect-video rounded-3xl glass relative overflow-hidden mb-20">
             <div className="absolute inset-0 bg-grid opacity-10" />
             
             {/* Desktop Chat */}
             <div className="absolute inset-0 flex">
                <div className="w-64 border-r border-white/5 p-4 hidden md:block">
                  <div className="space-y-4">
                    <div className="h-2 w-24 bg-white/10 rounded" />
                    <div className="h-8 w-full bg-brand-primary/10 rounded-lg" />
                    <div className="h-8 w-full bg-white/5 rounded-lg" />
                    <div className="h-8 w-full bg-white/5 rounded-lg" />
                  </div>
                </div>
                <div className="flex-1 p-8">
                  <div className="max-w-2xl space-y-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-800" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold">Sarah Chen</span>
                          <span className="text-[10px] text-zinc-500">10:24 AM</span>
                        </div>
                        <p className="text-sm text-zinc-300 bg-white/5 p-3 rounded-2xl rounded-tl-none">
                          Can we look at the auth middleware? I think there's a race condition in the session refresh.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/20" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold">Alex Rivera</span>
                          <span className="text-[10px] text-zinc-500">10:26 AM</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
                          <div className="flex items-center gap-2 mb-2 text-brand-primary">
                            <Code className="w-4 h-4" />
                            <span className="text-xs font-mono">middleware.ts:42</span>
                          </div>
                          <pre className="text-[10px] font-mono text-zinc-400 overflow-hidden">
                            <code>{`if (!session) {
  return await refreshSession(req);
}`}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
             </div>

             {/* Mobile Overlay (Simulated) */}
             <motion.div 
               initial={{ x: '100%' }}
               whileInView={{ x: '0%' }}
               viewport={{ once: true }}
               transition={{ duration: 1, ease: "circOut" }}
               className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-[450px] bg-black border border-white/20 rounded-[40px] shadow-2xl p-4 hidden lg:block"
             >
                <div className="w-20 h-6 bg-zinc-900 rounded-full mx-auto mb-6" />
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-brand-primary text-black p-3 rounded-2xl rounded-tr-none text-xs font-medium max-w-[80%]">
                      Checking the logs now.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800" />
                    <div className="bg-zinc-900 p-3 rounded-2xl rounded-tl-none text-xs text-zinc-300 max-w-[80%]">
                      Found it. Fix deployed to staging.
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] text-green-500 font-bold">Build Success</span>
                  </div>
                </div>
             </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {[
              { title: 'Threaded Code Reviews', desc: 'Discuss specific lines of code inside chat threads.', icon: Code },
              { title: 'Huddles', desc: 'Instant voice or video calls for quick pair programming.', icon: Phone },
              { title: 'Bot Integrations', desc: 'Automated notifications for CI pipelines and approvals.', icon: Bot },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl glass border-white/5">
                <item.icon className="w-8 h-8 text-brand-primary mb-4" />
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
