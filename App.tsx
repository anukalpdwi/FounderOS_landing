import React, { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react";
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Comparison from './components/Comparison';
import Agents from './components/Agents';
import Features from './components/Features';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import About from './components/About';
import Waitlist from './components/Waitlist';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    // Check system preference or localStorage on mount
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  return (
    <div className={`min-h-screen relative selection:bg-brand-green selection:text-black transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900 bg-gray-50'}`}>
      <div className="bg-noise"></div>
      <Navbar theme={theme} toggleTheme={toggleTheme} onNavigate={handleNavigate} currentView={currentView} />
      
      <main className="relative z-10">
        {currentView === 'home' && (
            <>
                <Hero theme={theme} onNavigate={handleNavigate} />
                <Comparison onNavigate={handleNavigate} />
                <Agents />
                <Features />
                <Stats />
                <Testimonials />
                <Pricing onNavigate={handleNavigate} />
            </>
        )}

        {currentView === 'about' && (
            <About onNavigate={handleNavigate} />
        )}

        {currentView === 'waitlist' && (
            <Waitlist />
        )}
      </main>
      
      {currentView !== 'waitlist' && <Footer onNavigate={handleNavigate} />}
      <Analytics />
    </div>
  );
};

export default App;
