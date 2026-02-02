import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Settings, Activity, 
  Terminal, Zap, Plus, MoreHorizontal,
  Bot, RefreshCw, BarChart, ChevronRight, X
} from 'lucide-react';

// --- Sub-components ---
const ActivityWave = () => (
  <div className="flex items-end gap-1 h-3 mb-1">
    {[1,2,3,4].map(i => (
      <motion.div 
        key={i}
        animate={{ height: ['20%', '100%', '20%'] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
        className="w-1 bg-emerald-400 rounded-full opacity-80"
      />
    ))}
  </div>
);

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'paused' | 'error';
  efficiency: number;
  tasksCompleted: number;
  cost: string;
  avatar: string;
  currentTask?: string;
  models?: string[];
  lastActive?: string;
}

interface LogEntry {
  id: string;
  time: string;
  agent: string;
  type: 'success' | 'info' | 'warning' | 'error';
  msg: string;
}

const MOCK_AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Marketing Director',
    role: 'Growth & Social',
    status: 'active',
    efficiency: 98,
    tasksCompleted: 1420,
    cost: '$0.04/task',
    avatar: '📣', 
    currentTask: 'Analyzing viral trends on Twitter (X)...',
    models: ['GPT-4', 'DALL-E 3', 'Twitter API'],
    lastActive: 'Now'
  },
  {
    id: '2',
    name: 'Sales Development',
    role: 'Outbound Leads',
    status: 'paused',
    efficiency: 85,
    tasksCompleted: 840,
    cost: '$0.12/lead',
    avatar: '💼',
    currentTask: 'Waiting for new criteria...',
    models: ['Claude 3', 'LinkedIn', 'Search'],
    lastActive: '2h ago'
  },
  {
    id: '3',
    name: 'Market Researcher',
    role: 'Data Analysis',
    status: 'idle',
    efficiency: 92,
    tasksCompleted: 340,
    cost: '$0.08/query',
    avatar: '🔬',
    models: ['Gemini Ultra', 'Bing Search', 'Scraper'],
    lastActive: '15m ago'
  },
  {
    id: '4',
    name: 'Content Strategist',
    role: 'Blog & SEO',
    status: 'active',
    efficiency: 95,
    tasksCompleted: 650,
    cost: '$0.06/article',
    avatar: '✍️',
    currentTask: 'Drafting "AI Trends 2026" outline...',
    models: ['GPT-4', 'SEO API', 'Grammarly'],
    lastActive: 'Now'
  }
];

const INITIAL_LOGS: LogEntry[] = [
   { id: '1', time: '10:42:01', agent: 'Marketing', type: 'success', msg: 'Successfully posted thread to Twitter.' },
   { id: '2', time: '10:41:55', agent: 'Research', type: 'info', msg: 'Scraping competitor pricing data...' },
   { id: '3', time: '10:40:12', agent: 'Sales', type: 'warning', msg: 'Lead score below threshold. Skipping outreach.' },
   { id: '4', time: '10:38:45', agent: 'Content', type: 'success', msg: 'Draft #412 saved to CMS.' },
   { id: '5', time: '10:35:20', agent: 'System', type: 'error', msg: 'Rate limit approaching on OpenAI API.' },
];

interface AiWorkforceProps {
  isDark: boolean;
  onSelectAgent?: (id: string) => void;
}

const AiWorkforce: React.FC<AiWorkforceProps> = ({ isDark, onSelectAgent }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Agents (API + Fallback)
  useEffect(() => {
    const fetchAgents = async () => {
        try {
            // Try connecting to real backend
            const res = await fetch('http://localhost:8000/api/v1/agents');
            if (!res.ok) throw new Error("Backend unavailable");
            const data = await res.json();
            setAgents(data);
        } catch (err) {
            console.warn("FounderOS Backend not online. Switching to Neural Simulation Mode.", err);
            // Fallback to Mock Data with delay
            await new Promise(resolve => setTimeout(resolve, 800));
            setAgents(MOCK_AGENTS);
        } finally {
            setLoading(false);
        }
    };
    fetchAgents();
  }, []);

  // Simulate Live Activity (Auto-scrolling logs)
  useEffect(() => {
    if (loading) return;
    
    const interval = setInterval(() => {
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        if (randomAgent.status !== 'active') return;

        const actions = [
            'Processing new data chunk...',
            'Optimizing prompt context...',
            'Validating output against safety guardrails...',
            'Querying vector database...',
            'Generating response tokens...',
            'Updating task status...'
        ];
        
        const newLog: LogEntry = {
            id: Date.now().toString(),
            time: new Date().toLocaleTimeString([], { hour12: false }),
            agent: randomAgent.name.split(' ')[0], // First name only
            type: 'info',
            msg: actions[Math.floor(Math.random() * actions.length)]
        };

        setLogs(prev => [newLog, ...prev.slice(0, 50)]); // Keep last 50
    }, 4000);

    return () => clearInterval(interval);
  }, [agents, loading]);

  const toggleAgentStatus = (id: string) => {
      setAgents(prev => prev.map(agent => {
          if (agent.id === id) {
              const newStatus = agent.status === 'active' ? 'paused' : 'active';
              // Add log
              const newLog: LogEntry = {
                id: Date.now().toString(),
                time: new Date().toLocaleTimeString([], { hour12: false }),
                agent: 'System',
                type: 'warning',
                msg: `${agent.name} was ${newStatus === 'active' ? 'resumed' : 'paused'} by user.`
              };
              setLogs(curr => [newLog, ...curr]);
              return { ...agent, status: newStatus };
          }
          return agent;
      }));
  };

  const colors = {
    surface: isDark ? 'bg-[#0E0E12]/60' : 'bg-white/80',
    border: isDark ? 'border-white/[0.08]' : 'border-black/[0.06]',
    text: isDark ? 'text-white' : 'text-gray-900',
    textSec: isDark ? 'text-white/60' : 'text-gray-500',
    glass: isDark ? 'backdrop-blur-xl bg-[#1A1A22]/40' : 'backdrop-blur-xl bg-white/60',
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
              <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
              </div>
              <p className={`text-sm font-medium ${colors.textSec} animate-pulse`}>Connecting to Neural Grid...</p>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">AI Workforce</h2>
          <p className={`${colors.textSec}`}>Manage, train, and deploy your autonomous agents.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:bg-white/5 ${colors.border}`}>
             View Logs
           </button>
           <button className="px-4 py-2 rounded-xl text-sm font-bold bg-[#10B981] text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2">
             <Plus size={16} strokeWidth={3} /> Hire Agent
           </button>
        </div>
      </div>

      {/* Agents Grid (Enhanced) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <motion.div 
            key={agent.id}
            layoutId={agent.id}
            onClick={() => {
              setSelectedAgent(agent.id);
              onSelectAgent?.(agent.id);
            }}
            className={`group relative rounded-[24px] p-0 border transition-all duration-500 hover:-translate-y-1 cursor-pointer overflow-hidden ${colors.surface} ${colors.border} ${isDark ? 'hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)] hover:border-emerald-500/30' : 'hover:shadow-2xl hover:shadow-emerald-500/10'}`}
          >
             {/* Dynamic Glow Line */}
             <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

             {/* Inner Content */}
             <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ring-1 ${isDark ? 'bg-white/5 ring-white/10' : 'bg-gray-50 ring-black/5'}`}>
                            {agent.avatar}
                        </div>
                        {agent.status === 'active' && (
                            <div className="absolute -bottom-2 -right-2 bg-black/50 backdrop-blur rounded-full p-1 border border-white/10">
                                <ActivityWave />
                            </div>
                        )}
                    </div>
                
                    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border shadow-sm backdrop-blur-md ${
                        agent.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        agent.status === 'paused' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-gray-500/10 text-gray-500 border-gray-500/20'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${
                            agent.status === 'active' ? 'bg-emerald-400 animate-pulse' : 
                            agent.status === 'paused' ? 'bg-amber-500' : 
                            'bg-gray-500'
                        }`} />
                        {agent.status}
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-xl font-bold mb-1 group-hover:text-emerald-400 transition-colors">{agent.name}</h3>
                    <p className={`text-sm ${colors.textSec}`}>{agent.role}</p>
                </div>

                {/* Model Chips */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {agent.models?.map((model, i) => (
                        <span key={i} className={`text-[10px] font-mono px-2 py-1 rounded border ${isDark ? 'border-white/10 bg-white/5 text-white/50' : 'border-black/5 bg-black/5 text-gray-500'}`}>
                            {model}
                        </span>
                    ))}
                </div>

                {/* Live Terminal / Task View */}
                <div className={`relative rounded-xl p-4 font-mono text-xs border overflow-hidden ${isDark ? 'bg-[#05050A] border-white/5 text-emerald-400/90' : 'bg-gray-900 text-emerald-300 border-gray-800'}`}>
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20" />
                    <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] uppercase tracking-widest">
                        <Terminal size={10} />
                        Thought Process
                    </div>
                    <p className="line-clamp-2 leading-relaxed opacity-90 h-8">
                        {agent.status === 'active' ? (
                            <>
                                <span className="text-emerald-500 mr-2 animate-pulse">▶</span>
                                {agent.currentTask}
                            </>
                        ) : (
                            <span className="opacity-50">// System idle. Awaiting user input...</span>
                        )}
                    </p>
                </div>
             </div>

             {/* Footer Stats & Controls */}
             <div className={`flex divide-x ${colors.border} border-t ${isDark ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`}>
                <div className="flex-1 p-4 text-center group-hover:bg-emerald-500/5 transition-colors">
                   <div className="text-[10px] uppercase font-bold opacity-40 mb-1">Efficiency</div>
                   <div className="text-lg font-bold flex items-center justify-center gap-1">
                      {agent.efficiency}% 
                      <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                   </div>
                </div>
                {/* Control Button */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleAgentStatus(agent.id);
                    }}
                    className={`flex-1 p-4 flex items-center justify-center gap-2 font-bold text-xs transition-colors hover:bg-white/5 ${agent.status === 'active' ? 'text-amber-500' : 'text-emerald-500'}`}
                >
                    {agent.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                    {agent.status === 'active' ? 'Pause' : 'Resume'}
                </button>
             </div>

          </motion.div>
        ))}
      </div>

      {/* Global Stats / Activity Feed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
         
         {/* System Health */}
         <div className={`rounded-[24px] p-8 border ${colors.surface} ${colors.border}`}>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
               <Activity size={20} className="text-emerald-500" />
               System Usage
            </h3>
            
            <div className="space-y-6">
                {/* CPU/Neural Load */}
                <div>
                   <div className="flex justify-between text-sm mb-2 font-medium">
                      <span className={colors.textSec}>Neural Engine Load</span>
                      <span>42%</span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[42%] bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
                   </div>
                </div>

                {/* API Usage */}
                <div>
                   <div className="flex justify-between text-sm mb-2 font-medium">
                      <span className={colors.textSec}>API Token Rate</span>
                      <span>850 / min</span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[65%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                   </div>
                </div>
                
                {/* Memory */}
                <div>
                   <div className="flex justify-between text-sm mb-2 font-medium">
                      <span className={colors.textSec}>Context Window Memory</span>
                      <span>128k / 1M</span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[12%] bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                   </div>
                </div>
            </div>
         
            <div className="mt-8 pt-6 border-t border-dashed border-white/10 flex justify-between items-center">
               <div className="text-sm font-medium">
                  Est. Daily Cost: <span className="text-white font-bold ml-1">$12.45</span>
               </div>
               <button className="text-xs font-bold text-emerald-500 flex items-center gap-1 hover:underline">
                  Optimize <ChevronRight size={12} />
               </button>
            </div>
         </div>

         {/* Event Log */}
         <div className={`lg:col-span-2 rounded-[24px] p-6 border ${colors.surface} ${colors.border} flex flex-col`}>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Live Activity Feed</h3>
                <div className="flex gap-2">
                   <button className={`p-1.5 rounded-lg transition-colors hover:bg-white/10 ${colors.textSec}`}><Pause size={16} /></button>
                   <button 
                       className={`p-1.5 rounded-lg transition-colors hover:bg-white/10 ${colors.textSec}`} 
                       onClick={() => setLogs([])}
                    ><RefreshCw size={16} /></button>
                </div>
             </div>
             
             <div className="flex-1 space-y-4 font-mono text-sm max-h-[300px] overflow-y-auto custom-scrollbar pr-2" ref={logContainerRef}>
                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                    <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0"
                    >
                        <span className="text-xs opacity-40 shrink-0 mt-0.5">{log.time}</span>
                        <div className="flex-1">
                            <span className={`text-xs font-bold uppercase mr-3 px-1.5 py-0.5 rounded ${
                                log.agent === 'Marketing' ? 'bg-emerald-500/20 text-emerald-500' :
                                log.agent === 'Research' ? 'bg-violet-500/20 text-violet-500' :
                                log.agent === 'Sales' ? 'bg-blue-500/20 text-blue-500' :
                                log.type === 'error' ? 'bg-rose-500/20 text-rose-500' :
                                'bg-gray-500/20 text-gray-500'
                            }`}>{log.agent}</span>
                            <span className={colors.textSec}>{log.msg}</span>
                        </div>
                    </motion.div>
                    ))}
                </AnimatePresence>
             </div>
         </div>

      </div>

    </div>
  );
};

export default AiWorkforce;
