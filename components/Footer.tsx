import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';

const Footer: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-white/10 pt-20 pb-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Pre-footer CTA */}
        <div className="text-center mb-24">
            <div className="w-24 h-24 mx-auto mb-8 relative">
                 {/* Big Logo */}
                 <svg 
                    className="w-24 h-24 text-gray-900 dark:text-white relative z-10" 
                    viewBox="0 0 512 512" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                 >
                    <defs>
                        <linearGradient id="footerCtaLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="currentColor" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="footerCtaRight" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="currentColor" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="footerCtaBottom" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="currentColor" stopOpacity={1} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M256 128 L384 204 L384 356 L256 432 L128 356 L128 204 Z"
                        stroke="currentColor"
                        strokeWidth="15"
                        fill="none"
                        strokeLinejoin="round"
                    />
                    <line x1="128" y1="204" x2="256" y2="280" stroke="url(#footerCtaLeft)" strokeWidth="15" strokeLinecap="round" />
                    <line x1="384" y1="204" x2="256" y2="280" stroke="url(#footerCtaRight)" strokeWidth="15" strokeLinecap="round" />
                    <line x1="256" y1="432" x2="256" y2="280" stroke="url(#footerCtaBottom)" strokeWidth="15" strokeLinecap="round" />
                    <circle cx="256" cy="280" r="24" fill="currentColor">
                        <animate attributeName="opacity" values="1;0.6;1" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="256" cy="280" r="40" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3">
                        <animate attributeName="r" values="40;52;40" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
                    </circle>
                 </svg>
                 <div className="absolute inset-0 bg-brand-green/20 blur-2xl"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">Your AI co-founder is ready. <br /> Are you?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">Join 1,500+ founders who stopped drowning in operations and started building their vision.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <button 
                    onClick={() => onNavigate && onNavigate('waitlist')}
                    className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2"
                 >
                    Join Waitlist
                    <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => onNavigate && onNavigate('waitlist')}
                    className="px-8 py-3 bg-brand-green text-black rounded-full font-bold hover:bg-[#00c272] transition-colors shadow-[0_0_20px_rgba(0,220,130,0.3)]"
                >
                    Book Live Demo
                </button>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-200 dark:border-white/10 pt-16">
          <div className="col-span-2 md:col-span-1">
             <div className="flex items-center gap-3 mb-4">
                {/* Small Logo - Changed to Gray/White */}
                <svg 
                    className="w-9 h-9 text-gray-900 dark:text-white" 
                    viewBox="0 0 512 512" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                 >
                    <defs>
                        <linearGradient id="footerSmLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="currentColor" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="footerSmRight" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="currentColor" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="footerSmBottom" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="currentColor" stopOpacity={1} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M256 128 L384 204 L384 356 L256 432 L128 356 L128 204 Z"
                        stroke="currentColor"
                        strokeWidth="24"
                        fill="none"
                        strokeLinejoin="round"
                    />
                    <line x1="128" y1="204" x2="256" y2="280" stroke="url(#footerSmLeft)" strokeWidth="24" strokeLinecap="round" />
                    <line x1="384" y1="204" x2="256" y2="280" stroke="url(#footerSmRight)" strokeWidth="24" strokeLinecap="round" />
                    <line x1="256" y1="432" x2="256" y2="280" stroke="url(#footerSmBottom)" strokeWidth="24" strokeLinecap="round" />
                    <circle cx="256" cy="280" r="24" fill="currentColor"></circle>
                 </svg>
                <span className="text-xl font-bold text-gray-900 dark:text-white">FounderOS</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Your autonomous AI co-founder that runs your startup 24/7.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-brand-green transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Integrations</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
                <li><button onClick={() => onNavigate && onNavigate('about')} className="hover:text-brand-green transition-colors">About</button></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Contact</a></li>
            </ul>
          </div>

           <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
                <li><button onClick={() => onNavigate && onNavigate('privacy')} className="hover:text-brand-green transition-colors">Privacy Policy</button></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-brand-green transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-gray-500 gap-4">
            <div className="flex flex-col gap-2">
                <p>© 2025 FounderOS AI. All rights reserved.</p>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                    <span>
                        Built by <a href="https://www.goldenbirdtech.com" target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline font-medium">The GoldenBird Tech</a>
                    </span>
                    <span className="hidden sm:inline text-gray-400">|</span>
                    <span>
                        Founder & CEO: <a href="https://www.linkedin.com/in/anukalp-dwivedi" target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline font-medium">Anukalp Dwivedi</a>
                    </span>
                </div>
            </div>
            
            <div className="flex gap-6">
                <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">GitHub</a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;