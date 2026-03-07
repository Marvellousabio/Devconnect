import React from 'react';
import { Github, Twitter, Linkedin, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-20">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tighter font-display text-white">DevConnect</span>
            </Link>
            <p className="text-zinc-500 text-sm max-w-xs mb-8">
              The operating system for agile developers. Merging codebase, conversations, and sprint boards.
            </p>
            <div className="flex gap-4">
              <Github className="w-5 h-5 text-zinc-500 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-zinc-500 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-zinc-500 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="w-5 h-5 text-zinc-500 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li className="hover:text-white cursor-pointer">Features</li>
              <li className="hover:text-white cursor-pointer">Integrations</li>
              <li className="hover:text-white cursor-pointer">Pricing</li>
              <li className="hover:text-white cursor-pointer">Changelog</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li className="hover:text-white cursor-pointer">Documentation</li>
              <li className="hover:text-white cursor-pointer">API Reference</li>
              <li className="hover:text-white cursor-pointer">Community</li>
              <li className="hover:text-white cursor-pointer">Open Source</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li className="hover:text-white cursor-pointer">About</li>
              <li className="hover:text-white cursor-pointer">Blog</li>
              <li className="hover:text-white cursor-pointer">Careers</li>
              <li className="hover:text-white cursor-pointer">Contact</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li className="hover:text-white cursor-pointer">Privacy</li>
              <li className="hover:text-white cursor-pointer">Terms</li>
              <li className="hover:text-white cursor-pointer">Security</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
          <p className="text-zinc-600 text-xs">
            © 2026 DevConnect Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-zinc-600 text-xs hover:text-zinc-400 cursor-pointer">System Status</span>
            <span className="text-zinc-600 text-xs hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
