import React from 'react';
import { motion } from 'framer-motion';

export const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-secondary/10 opacity-50" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.1),transparent_50%)]"
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass p-12 md:p-20 rounded-[40px] border-white/10 relative"
        >
          <h2 className="text-4xl md:text-6xl font-bold font-display mb-6 tracking-tight">Build the Future Together.</h2>
          <p className="text-zinc-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of developers who have reclaimed their focus. Start your first project on DevConnect today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              Create Free Account
            </button>
            <button className="px-10 py-5 rounded-full bg-zinc-900 text-white font-bold text-lg border border-white/10 hover:bg-zinc-800 transition-colors">
              Talk to Sales
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
