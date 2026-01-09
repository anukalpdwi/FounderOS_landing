import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { ArrowRight, Play, Bot, Globe, Database, Cpu, MessageSquare, Zap, LayoutGrid, TrendingUp, ShieldCheck } from 'lucide-react';

// --- Professional "Living" Background System ---
const HeroBackground = ({ theme }: { theme: 'dark' | 'light' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        // Configuration
        const particleCount = width < 768 ? 40 : 80;
        // Dark Mode: White particles (subtle)
        // Light Mode: Slate-900 particles (high contrast)
        const baseColor = theme === 'dark' ? '255, 255, 255' : '15, 23, 42'; 

        interface Particle {
            x: number;
            y: number;
            size: number;
            speedY: number;
            opacity: number;
        }

        const particles: Particle[] = [];

        const createParticle = (resetY = false): Particle => ({
            x: Math.random() * width,
            y: resetY ? height + Math.random() * 50 : Math.random() * height,
            size: Math.random() * 1.5 + 0.5,
            speedY: Math.random() * -0.3 - 0.1, // Slow float up
            opacity: Math.random() * 0.5 + 0.1
        });

        for (let i = 0; i < particleCount; i++) particles.push(createParticle());

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.y += p.speedY;
                if (p.y < -10) Object.assign(p, createParticle(true));

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                
                // Opacity Adjustment: 
                // Dark mode: keep subtle (0.3 multiplier)
                // Light mode: make clearer (0.5 multiplier) so it's "live"
                ctx.fillStyle = `rgba(${baseColor}, ${p.opacity * (theme === 'dark' ? 0.3 : 0.5)})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        animate();

        return () => window.removeEventListener('resize', handleResize);
    }, [theme]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Aurora Gradients - Enhanced for Light Mode */}
            <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-brand-green/20 dark:bg-brand-green/5 blur-[120px] rounded-full" 
            />
             <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 15, repeat: Infinity, delay: 1 }}
                className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-500/20 dark:bg-blue-900/10 blur-[120px] rounded-full" 
            />
            <div className={`absolute inset-0 bg-gradient-to-b ${theme === 'dark' ? 'from-black via-transparent to-black' : 'from-white via-transparent to-gray-50'}`}></div>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
};

// --- The "Command Center" Visualization Components ---

const CommandNode = ({ icon: Icon, label, color, position, active }: any) => (
    <div className={`absolute ${position} flex flex-col items-center gap-2 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-40 grayscale'}`}>
        <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-2xl ${color} border border-white/20 dark:border-white/10 flex items-center justify-center shadow-lg backdrop-blur-md`}>
            {active && <div className="absolute inset-0 bg-white/40 animate-ping rounded-2xl opacity-20"></div>}
            <Icon className="w-6 h-6 text-white" />
            {/* Status Indicator */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-black ${active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
        </div>
        <div className="bg-white/80 dark:bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-black/5 dark:border-white/10 text-[10px] font-bold uppercase tracking-wider shadow-sm">
            {label}
        </div>
    </div>
);

const ConnectionLine = ({ angle, active, theme }: any) => {
    return (
        <div className="absolute top-1/2 left-1/2 w-[140px] md:w-[180px] h-[1px] origin-left" style={{ transform: `rotate(${angle}deg)` }}>
             {/* Base Line */}
            <div className="w-full h-full bg-gray-300 dark:bg-white/10"></div>
            {/* Active Flow */}
            {active && (
                <motion.div 
                    initial={{ x: 0, opacity: 0 }}
                    animate={{ x: '100%', opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 h-[2px] w-12 bg-gradient-to-r from-transparent via-brand-green to-transparent"
                />
            )}
        </div>
    );
};

const DashboardScreen = ({ theme }: { theme: 'dark' | 'light' }) => {
    const [step, setStep] = useState(0);

    // Simulation Loop: Cycles through active nodes
    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % 4);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full relative flex items-center justify-center">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[size:30px_30px] opacity-[0.05] bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]"></div>
            
            {/* Central Intelligence Core */}
            <div className="relative z-20">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center relative shadow-[0_0_60px_-10px_rgba(0,220,130,0.3)]">
                    <div className="absolute inset-0 border-2 border-dashed border-brand-green/50 rounded-full animate-spin-slow"></div>
                    <Cpu className="w-8 h-8 md:w-10 md:h-10 relative z-10" />
                    {/* Pulsing Rings */}
                    <div className="absolute inset-0 bg-brand-green/20 rounded-full animate-ping opacity-20"></div>
                </div>
                <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold tracking-widest uppercase text-brand-green">
                    FounderOS Core
                </div>
            </div>

            {/* Connecting Lines (Radiating from Center) */}
            <ConnectionLine angle={-45} active={step === 1} theme={theme} /> {/* Top Left */}
            <ConnectionLine angle={-135} active={step === 2} theme={theme} /> {/* Bottom Left */}
            <ConnectionLine angle={45} active={step === 3} theme={theme} /> {/* Top Right */}
            <ConnectionLine angle={135} active={step === 0} theme={theme} /> {/* Bottom Right */}

            {/* Satellite Nodes */}
            <CommandNode 
                icon={Database} 
                label="Finance / Stripe" 
                color="bg-indigo-500" 
                position="top-8 left-8 md:top-16 md:left-24" 
                active={step === 1} 
            />
            <CommandNode 
                icon={MessageSquare} 
                label="Comms / Slack" 
                color="bg-purple-500" 
                position="bottom-8 left-8 md:bottom-16 md:left-24" 
                active={step === 2} 
            />
            <CommandNode 
                icon={Globe} 
                label="Sales / Hubspot" 
                color="bg-orange-500" 
                position="top-8 right-8 md:top-16 md:right-24" 
                active={step === 3} 
            />
             <CommandNode 
                icon={LayoutGrid} 
                label="Product / Jira" 
                color="bg-blue-500" 
                position="bottom-8 right-8 md:bottom-16 md:right-24" 
                active={step === 0} 
            />
        </div>
    )
}

// --- Main Hero Component ---
const Hero: React.FC<{ theme: 'dark' | 'light', onNavigate: (page: string) => void }> = ({ theme, onNavigate }) => {
  const { scrollY } = useScroll();
  const yContent = useTransform(scrollY, [0, 1000], [0, 100]);
  const opacityHero = useTransform(scrollY, [0, 600], [1, 0]);

  // 3D Tilt & Parallax Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]); 
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);
  const springConfig = { damping: 25, stiffness: 120 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width - 0.5) * 100);
    y.set(((event.clientY - rect.top) / rect.height - 0.5) * 100);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden min-h-screen flex flex-col justify-center">
      <HeroBackground theme={theme} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div style={{ opacity: opacityHero, y: yContent }} className="text-center max-w-5xl mx-auto mb-16 md:mb-24">
          
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 text-xs font-semibold text-gray-800 dark:text-gray-200 backdrop-blur-md mb-8 shadow-sm"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
            </span>
            <span>FounderOS 2.1 is Live</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[0.95] mb-8 text-gray-900 dark:text-white"
          >
            Your AI Co-Founder. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green via-emerald-500 to-teal-400">Runs the company.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Stop playing startup. Start building an empire. 
            FounderOS executes operations, finance, and sales while you sleep.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
          >
            <button 
                onClick={() => onNavigate('waitlist')}
                className="w-full sm:w-auto px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-green/20"
            >
                <Play className="w-4 h-4 fill-current" /> Watch Demo
            </button>
            <button 
                onClick={() => onNavigate('waitlist')}
                className="w-full sm:w-auto px-8 py-4 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-gray-900 dark:text-white rounded-full font-bold hover:bg-white/80 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
            >
              Join Waitlist <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>

        {/* --- 3D Command Center Visualization --- */}
        <div 
            className="relative perspective-1000 w-full max-w-6xl mx-auto h-[450px] md:h-[650px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
          <motion.div
            initial={{ opacity: 0, rotateX: 20 }}
            animate={{ opacity: 1, rotateX: 0 }}
            style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
            transition={{ duration: 1 }}
            className="relative w-full h-full"
          >
            {/* Main Glass Dashboard */}
            <div className="absolute inset-0 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-2xl rounded-[2rem] border border-white/40 dark:border-white/10 shadow-2xl dark:shadow-[0_0_100px_-30px_rgba(0,220,130,0.15)] overflow-hidden flex flex-col">
                
                {/* Dashboard Header */}
                <div className="h-14 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-6 bg-gray-50/50 dark:bg-white/5">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-black/50 rounded-lg border border-black/5 dark:border-white/5 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                        <Zap className="w-3 h-3 text-brand-green" /> Live Operations
                    </div>
                    <div className="w-12"></div>
                </div>

                {/* Dashboard Body */}
                <div className="flex-1 relative overflow-hidden p-6 md:p-10">
                    <DashboardScreen theme={theme} />

                    {/* Live Log (Bottom Left) */}
                    <div className="absolute bottom-6 left-6 z-30 hidden md:block">
                         <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl p-4 w-72 shadow-xl">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2">System Activity</div>
                            <div className="space-y-2 font-mono text-[10px] text-gray-600 dark:text-gray-300">
                                <div className="flex gap-2"><span className="text-green-500">➜</span> Connecting to Stripe API...</div>
                                <div className="flex gap-2"><span className="text-green-500">➜</span> Analyzing Q3 Revenue...</div>
                                <div className="flex gap-2"><span className="text-blue-500">ℹ</span> Sales Agent initiated outreach</div>
                            </div>
                         </div>
                    </div>

                    {/* Metric Card (Top Right) */}
                    <div className="absolute top-6 right-6 z-30 hidden md:block">
                        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl p-4 w-48 shadow-xl">
                             <div className="text-xs text-gray-500 mb-1">Weekly Growth</div>
                             <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                +24% <TrendingUp className="w-4 h-4 text-brand-green" />
                             </div>
                             <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 mt-2 rounded-full overflow-hidden">
                                 <div className="h-full w-[70%] bg-brand-green rounded-full"></div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
