import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Code, Bell } from 'lucide-react';

export const MessagingSection = () => {
  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Chat that understands your code.
            </h2>
            <p className="text-xl text-zinc-400 mb-8">
              Context-aware messaging that links directly to your codebase. Share snippets, reference issues, and collaborate in real-time without ever leaving your flow.
            </p>
            
            <div className="space-y-4">
              {[
                'Threaded conversations with code context',
                'Inline code sharing with syntax highlighting',
                'Smart notifications that matter',
                'Integration with GitHub issues & PRs'
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-brand-primary" />
                  </div>
                  <span className="text-zinc-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Chat Preview */}
            <div className="rounded-2xl glass p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary" />
                <div>
                  <p className="text-white font-medium"># engineering</p>
                  <p className="text-zinc-500 text-sm">12 members • 3 online</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">Sarah <span className="text-zinc-500 font-normal">10:23 AM</span></p>
                    <p className="text-zinc-300 text-sm">Hey team, just pushed the new auth flow. Can someone review?</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/50 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">Alex <span className="text-zinc-500 font-normal">10:25 AM</span></p>
                    <div className="bg-zinc-800 rounded-lg p-3 mt-1">
                      <Code className="w-4 h-4 text-brand-primary mb-2" />
                      <code className="text-xs text-zinc-300">
                        {`const auth = await verifyToken(token);\nif (!auth) throw new Error('Unauthorized');`}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/50 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">Mike <span className="text-zinc-500 font-normal">10:28 AM</span></p>
                    <p className="text-zinc-300 text-sm">LGTM! 👍 Ship it!</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-4 py-2">
                  <MessageSquare className="w-4 h-4 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
                  />
                  <Send className="w-4 h-4 text-brand-primary" />
                </div>
              </div>
            </div>

            {/* Floating notification */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -right-4 top-10 p-3 rounded-xl glass shadow-xl"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-accent" />
                <span className="text-xs text-white">New PR review request</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
