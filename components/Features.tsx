import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { BrainCircuit, Zap, Landmark, ShieldCheck, Terminal, Bot, Rocket, ChevronDown } from 'lucide-react';

// --- Sub-Components ---

// 1. Desktop Feature Card (Scroll Trigger)
const FeatureCard = ({ feature, index, activeFeature, setActiveFeature }: any) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-50% 0px -50% 0px" });

    useEffect(() => {
        if (isInView) {
            setActiveFeature(index);
        }
    }, [isInView, index, setActiveFeature]);

    return (
        <div ref={ref} className="min-h-[80vh] flex items-center justify-center py-10">
            <motion.div 
                animate={{ 
                    opacity: activeFeature === index ? 1 : 0.2,
                    scale: activeFeature === index ? 1.05 : 0.95,
                    x: activeFeature === index ? 0 : -20
                }}
                transition={{ duration: 0.5 }}
                className={`p-8 md:p-10 rounded-3xl border backdrop-blur-sm transition-all duration-500 w-full max-w-xl ${
                    activeFeature === index 
                    ? 'bg-white/80 dark:bg-white/5 border-brand-green/50 shadow-2xl dark:shadow-[0_0_30px_-10px_rgba(0,220,130,0.2)]' 
                    : 'bg-transparent border-transparent'
                }`}
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-xl ${activeFeature === index ? 'bg-brand-green/20 text-brand-green' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'} transition-colors`}>
                        <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className={`text-2xl font-bold ${activeFeature === index ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                        {feature.title}
                    </h3>
                </div>
                <p className={`text-lg leading-relaxed ${activeFeature === index ? 'text-gray-600 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}`}>
                    {feature.description}
                </p>
            </motion.div>
        </div>
    );
};

// 2. Shared Visual Component (The Graph/Terminal)
const FeatureVisual = ({ activeFeature, isMobile, logs, chartData }: any) => {
    const radius = isMobile ? 80 : 130; // Responsive radius for network

    return (
        <div className="glass-card rounded-3xl p-1 border border-gray-200 dark:border-white/10 bg-white dark:bg-black/80 aspect-auto min-h-[400px] md:aspect-[16/9] lg:h-[600px] w-full relative overflow-hidden flex flex-col shadow-2xl">
            {/* Fake Browser/App Header */}
            <div className="h-10 md:h-12 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center px-4 md:px-6 gap-2 shrink-0">
                <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="mx-auto text-[10px] md:text-xs text-gray-500 font-mono flex items-center gap-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-brand-green animate-pulse"></div>
                        founder_os_core_v2.0
                </div>
            </div>

            <div className="flex-grow relative p-4 md:p-12 overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-black/90">
                    {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

                <AnimatePresence mode="wait">
                    {activeFeature === 0 && (
                        <motion.div 
                            key="terminal"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full max-w-lg bg-[#1e1e1e] rounded-xl border border-white/10 shadow-2xl overflow-hidden font-mono text-[10px] md:text-sm"
                        >
                            <div className="bg-[#2d2d2d] px-3 md:px-4 py-2 flex items-center justify-between border-b border-white/5">
                                <span className="text-gray-400">Execution Log</span>
                                <Terminal className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                            </div>
                            <div className="p-3 md:p-4 space-y-2 md:space-y-3 text-gray-300 min-h-[200px]">
                                {logs.map((log: string, i: number) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex gap-2"
                                    >
                                        <span className="text-blue-400">➜</span>
                                        <span className={i === logs.length - 1 ? "animate-pulse" : ""}>{log}</span>
                                    </motion.div>
                                ))}
                                {logs.length === 0 && (
                                    <div className="text-gray-600 italic">Initializing agent swarm...</div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeFeature === 1 && (
                        <motion.div 
                            key="network"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5 }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            {/* Central Node */}
                            <div className="absolute z-20 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white dark:bg-brand-green/10 border border-brand-green text-brand-green flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,220,130,0.2)]">
                                <Bot className="w-6 h-6 md:w-8 md:h-8 mb-1" />
                                <span className="text-[8px] md:text-[10px] font-bold uppercase">Core</span>
                            </div>

                            {/* Data Packets */}
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={`packet-${i}`}
                                    className="absolute w-2 h-2 bg-brand-green dark:bg-white rounded-full z-10"
                                    animate={{
                                        scale: [0, 1.2, 0],
                                        opacity: [0, 1, 0],
                                        offsetDistance: "100%",
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear",
                                        delay: i * 0.6
                                    }}
                                    style={{
                                        // Path from edge to center (approximated based on responsive radius)
                                        offsetPath: `path("M -${radius} -${radius} L 0 0")`, 
                                        top: "50%",
                                        left: "50%"
                                    }}
                                />
                            ))}

                            {/* Orbiting Nodes */}
                            {[0, 1, 2, 3].map((i) => {
                                const angle = (i * 90); // 4 nodes evenly spaced
                                return (
                                    <motion.div
                                        key={i}
                                        className="absolute top-1/2 left-1/2"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                                        style={{ width: 0, height: 0 }} // Wrapper is centered
                                    >
                                        <motion.div
                                            style={{
                                                position: 'absolute',
                                                top: -24, // Half of height (48px / 2)
                                                left: -24, // Half of width
                                                width: 48,
                                                height: 48,
                                                rotate: angle, // Initial rotation offset for distribution
                                            }}
                                        >
                                           <motion.div
                                                className="w-12 h-12 md:w-16 md:h-16 -ml-6 -mt-6 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center z-10 shadow-lg"
                                                style={{ x: radius }}
                                                animate={{ rotate: -360 }} // Counter rotate to keep icon upright
                                                transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                                           >
                                                <div className="bg-gray-100 dark:bg-black/50 p-2 rounded-full">
                                                    {i === 0 ? <Landmark className="w-4 h-4 md:w-5 md:h-5 text-blue-500" /> :  // CFO
                                                     i === 1 ? <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" /> :  // Legal
                                                     i === 2 ? <Terminal className="w-4 h-4 md:w-5 md:h-5 text-orange-500" /> : // CTO
                                                     <Rocket className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />} {/* CMO */}
                                                </div>
                                           </motion.div>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                            
                            {/* Orbit Ring */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 animate-spin-slow text-black dark:text-white" style={{ animationDuration: '40s' }}>
                                <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="6 6" />
                                <circle cx="50%" cy="50%" r={radius + 15} stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 4" opacity="0.5" />
                            </svg>
                        </motion.div>
                    )}

                    {activeFeature === 2 && (
                        <motion.div 
                            key="chart"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-lg h-48 md:h-64 flex items-end justify-between gap-2 md:gap-4 px-4 md:px-8 pb-4 md:pb-8 relative"
                        >
                            <div className="absolute top-0 left-0 text-gray-400 text-[10px] md:text-xs font-mono">Runway Projection</div>
                            
                            {/* Bars */}
                            {chartData.map((height: number, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 0.5, type: "spring" }}
                                    className="w-full bg-purple-500/20 border-t border-purple-500 rounded-t-sm relative group z-10"
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        ${Math.round(height)}k
                                    </div>
                                    <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-purple-500/10 to-transparent"></div>
                                </motion.div>
                            ))}

                            {/* Overlay Line Chart - Responsive viewBox */}
                            <div className="absolute inset-0 px-4 md:px-8 pb-4 md:pb-8 flex items-end pointer-events-none">
                                <div className="w-full h-full relative">
                                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <motion.path 
                                            d="M 0 60 C 20 40, 40 50, 60 20 S 80 30, 100 0" 
                                            fill="none" 
                                            stroke="#00DC82" 
                                            strokeWidth="1.5" 
                                            vectorEffect="non-scaling-stroke" 
                                            strokeDasharray="5 5"
                                            animate={{ strokeDashoffset: [0, 20] }}
                                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        />
                                    </svg>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeFeature === 3 && (
                        <motion.div 
                            key="security"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-4 w-full max-w-md relative"
                        >
                            <motion.div 
                                className="absolute top-0 left-0 w-full h-1 bg-brand-green/50 shadow-[0_0_15px_rgba(0,220,130,0.5)] z-20 pointer-events-none"
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-yellow-500/30 p-4 md:p-6 relative overflow-hidden shadow-lg">
                                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="p-1.5 md:p-2 bg-yellow-500/10 rounded-lg text-yellow-600 dark:text-yellow-500">
                                            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                        <div>
                                            <div className="text-gray-900 dark:text-white font-bold text-xs md:text-sm">High Value Transaction</div>
                                            <div className="text-gray-500 text-[10px] md:text-xs">CFO Agent requests approval</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] md:text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-2 py-1 rounded">Pending</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-6 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                                    Initiate transfer of $15,000 to AWS for yearly reserved instance? Projected saving: 18%.
                                </p>
                                <div className="flex gap-3">
                                    <button className="flex-1 bg-brand-green text-black font-bold py-2 rounded text-[10px] md:text-xs hover:bg-green-400 transition-colors">
                                        Approve
                                    </button>
                                    <button className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold py-2 rounded text-[10px] md:text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                                        Deny
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};


// --- Main Component ---

const Features: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Simulation States
  const [logs, setLogs] = useState<string[]>([]);
  const [chartData, setChartData] = useState([40, 65, 55, 80, 45, 90, 100]);

  const features = [
    {
      id: 0,
      title: "Autonomous Execution",
      description: "Unlike other AI tools that just chat, FounderOS connects to your tools and does the work. It sends emails, schedules meetings, and updates your CRM.",
      icon: Zap,
    },
    {
      id: 1,
      title: "Swarm Intelligence",
      description: "Your 7 AI executives talk to each other. The CMO Agent alerts the Sales Agent about a new campaign, and the CFO Agent adjusts the budget automatically.",
      icon: BrainCircuit,
    },
    {
      id: 2,
      title: "Financial Forecasting",
      description: "Real-time cash flow analysis and runway prediction. Your CFO agent monitors burn rate and suggests optimizations to extend your runway.",
      icon: Landmark,
    },
    {
      id: 3,
      title: "Human-in-the-Loop",
      description: "You maintain full control. Set permission levels for different agents. Approve high-stakes decisions with a single click in Slack.",
      icon: ShieldCheck,
    }
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', checkMobile);
    checkMobile();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Terminal Simulation
  useEffect(() => {
    if (activeFeature === 0) {
        setLogs([]);
        const messages = [
            "Analyzing inbox...",
            "Found 3 high-priority investor emails",
            "Drafting responses using Context: 'Series A Deck'",
            "Scheduling follow-up with @MarcAndreesen",
            "Task complete. Waiting for approval..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i < messages.length) {
                setLogs(prev => [...prev, messages[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 800);
        return () => clearInterval(interval);
    }
  }, [activeFeature]);

  // Chart Simulation
  useEffect(() => {
      if (activeFeature === 2) {
          const interval = setInterval(() => {
              setChartData(prev => prev.map(val => Math.max(20, Math.min(100, val + (Math.random() * 20 - 10)))));
          }, 1500);
          return () => clearInterval(interval);
      }
  }, [activeFeature]);

  return (
    <section id="features" className="bg-gray-50 dark:bg-black relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 md:mb-20"
        >
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
                Not just a chatbot. <br className="hidden md:block" />
                <span className="text-gradient-green">A complete operating system.</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
                Explore how FounderOS fundamentally changes how you build companies.
            </p>
        </motion.div>

        {isMobile ? (
             /* --- Mobile Layout: Vertical Accordion (Corrected for No Horizontal Scroll) --- */
             <div className="flex flex-col gap-4">
                {features.map((feature, idx) => {
                    const isActive = activeFeature === idx;
                    return (
                        <div 
                            key={idx}
                            onClick={() => setActiveFeature(idx)}
                            className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                                isActive 
                                ? 'bg-white dark:bg-white/10 border-brand-green/50 shadow-[0_0_20px_-5px_rgba(0,220,130,0.2)]' 
                                : 'bg-gray-100 dark:bg-white/5 border-transparent dark:border-white/5'
                            }`}
                        >
                            <button className="w-full flex items-center gap-4 p-6 text-left focus:outline-none">
                                 <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-brand-green/20 text-brand-green' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                                    <feature.icon className="w-6 h-6" />
                                 </div>
                                 <span className={`text-lg font-bold transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {feature.title}
                                 </span>
                                 <ChevronDown 
                                    className={`w-5 h-5 ml-auto text-gray-500 transition-transform duration-300 ${isActive ? 'rotate-180 text-brand-green' : ''}`} 
                                 />
                            </button>

                            <AnimatePresence initial={false}>
                                {isActive && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-6 pb-6 pt-0">
                                            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                                {feature.description}
                                            </p>
                                            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                                                 <FeatureVisual activeFeature={activeFeature} isMobile={true} logs={logs} chartData={chartData} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
             </div>
        ) : (
            /* --- Desktop Layout: Scrollytelling --- */
            <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
                {/* Left Column: Scrolling Cards */}
                <div className="lg:col-span-5 relative z-10">
                    <div className="flex flex-col">
                        {features.map((feature, idx) => (
                            <FeatureCard 
                                key={idx} 
                                feature={feature} 
                                index={idx} 
                                activeFeature={activeFeature} 
                                setActiveFeature={setActiveFeature} 
                            />
                        ))}
                    </div>
                </div>

                {/* Right Column: Sticky Visual */}
                <div className="lg:col-span-7 sticky top-0 h-screen flex items-center justify-center">
                    <div className="w-full relative">
                         <div className="absolute -inset-10 bg-brand-green/5 blur-3xl rounded-full opacity-20 pointer-events-none"></div>
                         <FeatureVisual activeFeature={activeFeature} isMobile={false} logs={logs} chartData={chartData} />
                    </div>
                </div>
            </div>
        )}
      </div>
    </section>
  );
};

export default Features;