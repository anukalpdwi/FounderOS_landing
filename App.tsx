import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import Dashboard from './components/Dashboard';
import Privacy from './components/Privacy';

// Home page component with all sections
const HomePage: React.FC<{ theme: string; onNavigate: (path: string) => void }> = ({ theme, onNavigate }) => (
  <>
    <Hero theme={theme} onNavigate={onNavigate} />
    <Comparison onNavigate={onNavigate} />
    <Agents />
    <Features />
    <Stats />
    <Testimonials />
    <Pricing onNavigate={onNavigate} />
  </>
);

// Layout wrapper with Navbar and Footer
const Layout: React.FC<{ 
  children: React.ReactNode; 
  theme: 'dark' | 'light'; 
  toggleTheme: () => void;
  showFooter?: boolean;
}> = ({ children, theme, toggleTheme, showFooter = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavigate = (path: string) => {
    // Handle hash navigation for same-page scrolling
    if (path.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(path);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.querySelector(path);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Map view names to actual routes
      const routeMap: Record<string, string> = {
        'home': '/',
        'about': '/about',
        'waitlist': '/waitlist',
        'privacy': '/privacy',
        'dashboard': '/dashboard',
      };
      const route = routeMap[path] || `/${path}`;
      navigate(route);
      window.scrollTo(0, 0);
    }
  };

  // Get current view name from path for navbar styling
  const getCurrentView = () => {
    const pathMap: Record<string, string> = {
      '/': 'home',
      '/about': 'about',
      '/waitlist': 'waitlist',
      '/privacy': 'privacy',
      '/dashboard': 'dashboard',
    };
    return pathMap[location.pathname] || 'home';
  };

  return (
    <>
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onNavigate={handleNavigate} 
        currentView={getCurrentView()} 
      />
      <main className="relative z-10">
        {children}
      </main>
      {showFooter && <Footer onNavigate={handleNavigate} />}
    </>
  );
};

// Main App content with routes
const AppContent: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleNavigate = (path: string) => {
    // Handle hash navigation for same-page scrolling
    if (path.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(path);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.querySelector(path);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Map view names to actual routes
      const routeMap: Record<string, string> = {
        'home': '/',
        'about': '/about',
        'waitlist': '/waitlist',
        'privacy': '/privacy',
        'dashboard': '/dashboard',
      };
      const route = routeMap[path] || `/${path}`;
      navigate(route);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className={`min-h-screen relative selection:bg-brand-green selection:text-black transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900 bg-gray-50'}`}>
      <div className="bg-noise"></div>
      
      <Routes>
        {/* Dashboard has its own layout without navbar/footer */}
        <Route 
          path="/dashboard" 
          element={
            <Dashboard theme={theme} toggleTheme={toggleTheme} onNavigate={handleNavigate} />
          } 
        />
        
        {/* Home page */}
        <Route 
          path="/" 
          element={
            <Layout theme={theme} toggleTheme={toggleTheme}>
              <HomePage theme={theme} onNavigate={handleNavigate} />
            </Layout>
          } 
        />
        
        {/* About page */}
        <Route 
          path="/about" 
          element={
            <Layout theme={theme} toggleTheme={toggleTheme}>
              <About onNavigate={handleNavigate} />
            </Layout>
          } 
        />
        
        {/* Waitlist page */}
        <Route 
          path="/waitlist" 
          element={
            <Layout theme={theme} toggleTheme={toggleTheme} showFooter={false}>
              <Waitlist />
            </Layout>
          } 
        />
        
        {/* Privacy & Policy page */}
        <Route 
          path="/privacy" 
          element={
            <Layout theme={theme} toggleTheme={toggleTheme}>
              <Privacy onNavigate={handleNavigate} />
            </Layout>
          } 
        />
      </Routes>
      
      <Analytics />
    </div>
  );
};

// Root App component with Router wrapper
const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
