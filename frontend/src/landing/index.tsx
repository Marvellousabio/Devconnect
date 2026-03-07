import React, { useEffect } from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { CoreModules } from './CoreModules';
import { WorkflowSection } from './WorkflowSection';
import { MessagingSection } from './MessagingSection';
import { IssueSection } from './IssueSection';
import { AISection } from './AISection';
import { ProfileSection } from './ProfileSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './index.css';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  useEffect(() => {
    // Global smooth scroll or parallax effects can be added here
    
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
    <div className="min-h-screen selection:bg-brand-primary/30 landing-page">
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
