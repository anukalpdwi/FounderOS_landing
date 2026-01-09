import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { PricingFeature } from '../types';

const features: PricingFeature[] = [
  { text: "All 7 AI Executive Agents", included: true },
  { text: "Unlimited Tasks & Workflows", included: true },
  { text: "Institutional Memory", included: true },
  { text: "Priority Support", included: true },
  { text: "400+ Tool Integrations", included: true },
  { text: "Slack Integration", included: true },
  { text: "Analytics Dashboard", included: true },
  { text: "Self-Improving AI", included: true },
];

const Pricing: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <section id="pricing" className="py-32 bg-gray-100 dark:bg-black relative overflow-hidden transition-colors duration-300">
      {/* Background glow behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-brand-green/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-7xl font-bold mb-6 tracking-tight text-gray-900 dark:text-white">Lock In. <span className="text-gray-500">For real.</span></h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Replace $300k/year in hires—get FounderOS AI for just $50/mo</p>
        </motion.div>

        <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative group rounded-[2rem] p-[2px] overflow-hidden shadow-2xl"
        >
            {/* Spinning Border Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-green/50 to-transparent translate-x-[-100%] group-hover:animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 rounded-[2rem]"></div>
            
            <div className="relative bg-white dark:bg-[#050505] rounded-[1.9rem] p-8 md:p-14 overflow-hidden transition-colors duration-300">
                 <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/20 to-transparent"></div>
                 
                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand-green text-black px-6 py-2 rounded-b-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,220,130,0.4)] z-20">
                    Most Popular
                 </div>
            
                <div className="text-center mb-12 mt-4">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Professional</h3>
                    <div className="flex items-end justify-center gap-1 mb-4">
                        <span className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tighter">$50</span>
                        <span className="text-gray-500 mb-2 font-medium">/month</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Everything you need to run your startup autonomously</p>
                </div>

                <div className="grid md:grid-cols-2 gap-y-5 gap-x-12 mb-12 max-w-2xl mx-auto">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 group/item">
                            <div className="bg-brand-green/10 p-1 rounded-full group-hover/item:bg-brand-green/20 transition-colors">
                                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                            </div>
                            <span className="text-gray-600 dark:text-gray-300 font-medium group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">{feature.text}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                    <button 
                        onClick={() => onNavigate('waitlist')}
                        className="w-full sm:w-auto px-10 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-1"
                    >
                        Join Waitlist
                    </button>
                    <button 
                        onClick={() => onNavigate('waitlist')}
                        className="w-full sm:w-auto px-10 py-4 bg-transparent border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-all hover:-translate-y-1"
                    >
                        Book a Demo
                    </button>
                </div>
                
                <p className="text-center text-xs text-gray-500 mt-8">
                    14-day free trial • No credit card required • Cancel anytime
                </p>
            </div>
        </motion.div>

        <p className="text-center text-gray-500 mt-12 text-sm">
            Enterprise plans available for teams and agencies. <a href="#" className="text-brand-green hover:underline">Contact sales</a>
        </p>
      </div>
    </section>
  );
};

export default Pricing;
