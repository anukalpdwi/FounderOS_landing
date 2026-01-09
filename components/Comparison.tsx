import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, ArrowRight } from 'lucide-react';

const Comparison: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  const withoutPoints = [
    "Drowning in low-value admin tasks",
    "Burnout from wearing every hat",
    "Missed revenue due to slow execution",
    "Can't afford experienced executives",
    "Chaotic, reactive decision making"
  ];

  const withPoints = [
    "Autonomous execution 24/7/365",
    "Focus purely on product & vision",
    "Instant scaling of operations",
    "Full C-Suite for <$50/month",
    "Data-driven, proactive strategy"
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-white dark:bg-black transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-brand-green/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-gray-900 dark:text-white">Two ways to build. <br/><span className="text-gray-500">Choose wisely.</span></h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">The difference between a struggling startup and a unicorn is often just operational velocity.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto items-stretch">
          
          {/* Without Card - "The Old Way" */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-gray-200 dark:from-white/10 to-transparent overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative h-full bg-gray-50 dark:bg-[#0A0A0A] rounded-[23px] p-8 md:p-12 border border-gray-200 dark:border-white/5 group-hover:border-red-500/20 transition-colors duration-500">
                {/* Noise Texture Overlay for 'Old' feel */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">The Old Way</h3>
                    <X className="w-6 h-6 text-gray-400 dark:text-gray-600 group-hover:text-red-500 transition-colors" />
                </div>
                
                <ul className="space-y-6 relative z-10">
                    {withoutPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-4 text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                            <div className="mt-1 w-5 h-5 rounded-full border border-red-500/20 flex items-center justify-center shrink-0 group-hover:border-red-500/50 group-hover:bg-red-500/10">
                                <X className="w-3 h-3 text-red-500/50 group-hover:text-red-500" />
                            </div>
                            <span className="text-lg font-light">{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
          </motion.div>

          {/* With Card - "FounderOS" (The Future) */}
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative rounded-3xl group"
          >
            {/* Spotlight Border */}
            <div 
                className="pointer-events-none absolute -inset-[1px] rounded-3xl opacity-0 transition-opacity duration-300 z-0"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, #00DC82, transparent 40%)`
                }}
            />
            
            <div className="relative h-full bg-white dark:bg-[#050505] rounded-[23px] p-8 md:p-12 overflow-hidden border border-brand-green/20 dark:border-brand-green/30 z-10 shadow-2xl shadow-brand-green/5">
                
                {/* Scanning Laser Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-green/50 shadow-[0_0_20px_#00DC82] animate-scanline z-20 pointer-events-none opacity-20"></div>

                {/* Inner Glow Spotlight */}
                 <div 
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 rounded-[23px]"
                    style={{
                        opacity,
                        background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(0,220,130,0.05), transparent 40%)`
                    }}
                />

                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        FounderOS <span className="text-brand-green text-sm px-2 py-0.5 rounded-full bg-brand-green/10 border border-brand-green/20">v2.1</span>
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,220,130,0.4)]">
                        <Check className="w-4 h-4 text-brand-green" strokeWidth={3} />
                    </div>
                </div>

                <ul className="space-y-6 relative z-10">
                    {withPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-4 text-gray-800 dark:text-gray-200">
                            <div className="mt-1 w-5 h-5 rounded-full bg-brand-green flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,220,130,0.4)]">
                                <Check className="w-3 h-3 text-white dark:text-black" strokeWidth={3} />
                            </div>
                            <span className="text-lg font-medium tracking-wide">{point}</span>
                        </li>
                    ))}
                </ul>
                
                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/10">
                    <button 
                        onClick={() => onNavigate('waitlist')}
                        className="text-brand-green text-sm font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all"
                    >
                        Deploy Now <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
