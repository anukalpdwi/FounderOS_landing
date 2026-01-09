import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme, onNavigate, currentView }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (href.startsWith('#')) {
        // If we are not on home, go home first, then scroll
        if (currentView !== 'home') {
            onNavigate('home');
            setTimeout(() => {
                const element = document.querySelector(href);
                element?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const element = document.querySelector(href);
            element?.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        onNavigate(href);
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#agents' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: 'about' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || currentView !== 'home'
          ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group select-none" onClick={() => onNavigate('home')}>
            {/* FounderOS Logo - Changed Color to Grey/Black/White */}
            <svg 
                className="w-12 h-12 text-gray-900 dark:text-white group-hover:rotate-180 transition-transform duration-500" 
                viewBox="0 0 512 512" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="navLeftGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="currentColor" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="navRightGradient" x1="100%" y1="0%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="currentColor" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="navBottomGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="currentColor" stopOpacity={1} />
                </linearGradient>
              </defs>
              <path
                d="M256 128 L384 204 L384 356 L256 432 L128 356 L128 204 Z"
                stroke="currentColor"
                strokeWidth="20"
                fill="none"
                strokeLinejoin="round"
              />
              <line
                x1="128"
                y1="204"
                x2="256"
                y2="280"
                stroke="url(#navLeftGradient)"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <line
                x1="384"
                y1="204"
                x2="256"
                y2="280"
                stroke="url(#navRightGradient)"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <line
                x1="256"
                y1="432"
                x2="256"
                y2="280"
                stroke="url(#navBottomGradient)"
                strokeWidth="20"
                strokeLinecap="round"
              />
              <circle cx="256" cy="280" r="24" fill="currentColor">
                <animate attributeName="opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="256" cy="280" r="32" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3">
                <animate attributeName="r" values="32;44;32" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
              </circle>
            </svg>
            <span className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-none mt-1">
                FounderOS<span className="text-brand-green">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`text-sm font-medium transition-colors ${currentView === link.href ? 'text-brand-green' : 'text-gray-600 dark:text-gray-300 hover:text-brand-green dark:hover:text-white'}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
                onClick={() => onNavigate('waitlist')}
                className="text-sm font-medium text-gray-900 dark:text-white hover:text-brand-green transition-colors"
            >
              Log in
            </button>
            <button 
                onClick={() => onNavigate('waitlist')}
                className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand-green dark:hover:bg-brand-green transition-colors duration-300 shadow-[0_0_20px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
            >
              Join Waitlist
            </button>
          </div>

          {/* Mobile Menu Toggle & Theme Toggle */}
          <div className="md:hidden flex items-center gap-4">
             <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-900 dark:text-gray-300 hover:text-brand-green p-2 z-50 relative"
            >
              <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                      <motion.div
                          key="close"
                          initial={{ opacity: 0, rotate: -90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 90 }}
                          transition={{ duration: 0.2 }}
                      >
                          <X className="w-6 h-6" />
                      </motion.div>
                  ) : (
                      <motion.div
                          key="menu"
                          initial={{ opacity: 0, rotate: 90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: -90 }}
                          transition={{ duration: 0.2 }}
                      >
                          <Menu className="w-6 h-6" />
                      </motion.div>
                  )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with Fluid Animation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "100vh", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 fixed top-0 left-0 right-0 z-40"
          >
             {/* Extra close button inside the menu for better UX */}
            <div className="absolute top-6 right-4 z-50">
                 <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-900 dark:text-white hover:text-red-500 transition-colors"
                >
                    <X className="w-8 h-8" />
                 </button>
            </div>

            <div className="pt-24 p-4 px-6 pb-8 flex flex-col gap-6 h-full">
              <div className="flex flex-col gap-4">
                {navLinks.map((link, i) => (
                  <motion.a
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + (i * 0.05) }}
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-2xl font-medium text-gray-900 dark:text-gray-300 hover:text-brand-green block py-3 border-b border-gray-100 dark:border-white/5"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>
              
              <div className="flex flex-col gap-3 mt-auto mb-20">
                <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => {
                        onNavigate('waitlist');
                        setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-center text-lg font-medium text-gray-900 dark:text-white hover:text-brand-green py-2"
                >
                  Log in
                </motion.button>
                <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    onClick={() => {
                        onNavigate('waitlist');
                        setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-black dark:bg-brand-green text-white dark:text-black px-5 py-4 rounded-xl text-lg font-bold shadow-xl"
                >
                  Join Waitlist
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;