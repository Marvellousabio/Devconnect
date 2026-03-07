import React, { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CoreModules } from './components/CoreModules';
import { WorkflowSection } from './components/WorkflowSection';
import { MessagingSection } from './components/MessagingSection';
import { IssueSection } from './components/IssueSection';
import { AISection } from './components/AISection';
import { ProfileSection } from './components/ProfileSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    // Global smooth scroll or parallax effects can be added here
    // For now, we rely on Framer Motion for most animations as requested
    
    // Example GSAP scroll trigger for background elements
    gsap.to('.bg-grid', {
      backgroundPosition: '0 100px',
      ease: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    });
  }, []);

  return (
    <div className="min-h-screen selection:bg-brand-primary/30">
      <Navbar />
      
      <main>
        <Hero />
        
        <div className="relative">
          {/* Subtle background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-20 pointer-events-none" />
          
          <CoreModules />
          <WorkflowSection />
          <MessagingSection />
          <IssueSection />
          <AISection />
          <ProfileSection />
          <CTASection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
