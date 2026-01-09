import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Landmark, 
  Rocket, 
  Terminal, 
  TrendingUp, 
  HeartHandshake, 
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';
import { Agent } from '../types';

const agents: Agent[] = [
  {
    title: 'CEO Agent',
    role: 'Chief Executive Officer',
    description: 'Strategic planning, goal-setting, and high-level decision coordination.',
    icon: Target,
    color: 'text-emerald-500 dark:text-emerald-400'
  },
  {
    title: 'CFO Agent',
    role: 'Chief Financial Officer',
    description: 'Financial forecasting, budget management, and investor reporting.',
    icon: Landmark,
    color: 'text-blue-500 dark:text-blue-400'
  },
  {
    title: 'CMO Agent',
    role: 'Chief Marketing Officer',
    description: 'Content strategy, campaign management, and growth execution.',
    icon: Rocket,
    color: 'text-purple-500 dark:text-purple-400'
  },
  {
    title: 'CTO Agent',
    role: 'Chief Technology Officer',
    description: 'Tech stack decisions, infrastructure monitoring, and API integration.',
    icon: Terminal,
    color: 'text-orange-500 dark:text-orange-400'
  },
  {
    title: 'Sales Agent',
    role: 'Head of Sales',
    description: 'Pipeline management, lead qualification, and outreach automation.',
    icon: TrendingUp,
    color: 'text-green-600 dark:text-green-400'
  },
  {
    title: 'HR Agent',
    role: 'Head of People',
    description: 'Recruiting automation, onboarding workflows, and team coordination.',
    icon: HeartHandshake,
    color: 'text-pink-500 dark:text-pink-400'
  },
  {
    title: 'Legal Agent',
    role: 'General Counsel',
    description: 'Contract review, compliance tracking, and risk management.',
    icon: ShieldCheck,
    color: 'text-yellow-500 dark:text-yellow-400'
  },
  {
      title: 'Orchestrator',
      role: 'System Core',
      description: 'Manages communication flow and conflict resolution between agents.',
      icon: BrainCircuit,
      color: 'text-gray-900 dark:text-white'
  }
];

const Agents: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <section id="agents" className="py-32 bg-gray-50 dark:bg-black relative overflow-hidden transition-colors duration-300">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-gray-50 to-gray-50 dark:from-gray-900 dark:via-black dark:to-black opacity-80"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-green/30 bg-brand-green/5 text-brand-green text-xs font-semibold uppercase tracking-wider mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
            Swarm Intelligence v2.0
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-gray-900 dark:text-white"
          >
            Meet your new <br className="hidden md:block" />
            <span className="text-gray-500 dark:text-gray-400">Executive Team.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Seven specialized agents. One shared brain. They communicate, collaborate, and execute autonomously.
          </motion.p>
        </div>

        {/* Spotlight Grid Container */}
        <div 
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative"
        >
          {/* Spotlight Overlay (Shared across all cards) */}
          <div 
            className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0 rounded-3xl"
            style={{
                opacity,
                background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(0,220,130,0.06), transparent 40%)`
            }}
          />

          {agents.map((agent, index) => (
            <div key={index} className="group relative h-full">
                {/* Border Glow on Hover */}
                <div 
                    className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                    style={{
                        background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(0,220,130,0.15), transparent 40%)` 
                    }}
                ></div>

                <div className="relative h-full bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/5 rounded-2xl p-6 md:p-8 hover:bg-gray-50 dark:hover:bg-[#0F0F0F] transition-colors duration-300 flex flex-col z-10 overflow-hidden shadow-sm hover:shadow-md">
                    
                    <div className="flex items-center justify-between mb-6">
                        <div className={`p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 ${agent.color} group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-white/10 transition-all duration-300 shadow-sm`}>
                            <agent.icon className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse"></div>
                             <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono uppercase tracking-wider">Online</span>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-green transition-colors">{agent.title}</h3>
                    <div className="text-xs font-mono text-gray-500 mb-4">{agent.role}</div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-grow">
                        {agent.description}
                    </p>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Agents;