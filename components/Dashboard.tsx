import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Zap, Home, Search, Bell, Check, 
  ArrowUpRight, MoreVertical, LayoutDashboard, 
  Bot, BarChart3, Calendar, Settings, Crown, 
  Sun, Moon, Command, Plus, Link2 
} from 'lucide-react';
import AiWorkforce from './AiWorkforce';
import MarketingAgentDetail from './MarketingAgentDetail';
import ConnectAccounts from './ConnectAccounts';
import PlatformManager from './PlatformManager';

// --- Assets: Using Locally Generated Premium 3D Icons ---
const ICONS = {
  posts: "/assets/3d/posts_abstract.png",
  engagement: "/assets/3d/engagement_abstract.png",
  revenue: "/assets/3d/revenue_abstract.png",
  conversion: "/assets/3d/conversion_abstract.png",
  marketing: "📣",
  sales: "💼",
  research: "🔬",
  content: "✍️",
  rocket: "🚀",
  crown: "👑",
  fire: "🔥"
};

// --- Mock Data ---
const stats = [
  { label: 'Total Posts', value: '1,284', trend: '+12%', trendUp: true, icon: ICONS.posts, bg: 'bg-white/5', clay: '' },
  { label: 'Engagement', value: '84.2k', trend: '+24%', trendUp: true, icon: ICONS.engagement, bg: 'bg-white/5', clay: '' },
  { label: 'Revenue', value: '$12.4k', trend: '+8%', trendUp: true, icon: ICONS.revenue, bg: 'bg-white/5', clay: '' },
  { label: 'Conversion', value: '3.2%', trend: '+0.8%', trendUp: true, icon: ICONS.conversion, bg: 'bg-white/5', clay: '' },
];

const activeAgents = [
  { name: 'Marketing Agent', status: 'Active', task: 'Optimizing recent post...', progress: 75, type: 'Marketing', icon: ICONS.marketing, bg: 'bg-emerald-100' },
  { name: 'Sales Assistant', status: 'Idle', task: 'Waiting for leads', progress: 0, type: 'Sales', icon: ICONS.sales, bg: 'bg-blue-100' },
  { name: 'Research Bot', status: 'Working', task: 'Analyzing market trends', progress: 45, type: 'Research', icon: ICONS.research, bg: 'bg-violet-100' },
  { name: 'Content Writer', status: 'Active', task: 'Drafting blog post...', progress: 62, type: 'Content', icon: ICONS.content, bg: 'bg-amber-100' },
];

const recentActivity = [
  { id: 1, type: 'post', title: 'New Thread', content: 'Drafted: "Future of AI Agents"', time: '2m', category: 'Content' },
  { id: 2, type: 'agent', title: 'Marketing', content: 'Replied to 5 comments on LinkedIn', time: '15m', category: 'Social' },
  { id: 3, type: 'system', title: 'Analytics', content: 'Weekly report is ready for review', time: '1h', category: 'System' },
  { id: 4, type: 'milestone', title: 'Milestone', content: 'Hit 1,000 followers on Twitter', time: '2h', category: 'Growth' },
];

interface DashboardProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onNavigate?: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ theme, toggleTheme, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [scrolled, setScrolled] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = (e: any) => {
      setScrolled(e.target.scrollTop > 20);
    };
    const main = document.querySelector('main');
    if (main) main.addEventListener('scroll', handleScroll);
    return () => main?.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Premium Design Tokens ---
  const colors = {
    bg: isDark ? 'bg-[#030305]' : 'bg-[#F2F4F7]',
    surface: isDark ? 'bg-[#0E0E12]/90' : 'bg-white/90',
    surfaceHover: isDark ? 'hover:bg-[#1A1A22]' : 'hover:bg-gray-50',
    border: isDark ? 'border-white/[0.08]' : 'border-black/[0.06]',
    text: isDark ? 'text-white' : 'text-slate-900',
    textMuted: isDark ? 'text-white/40' : 'text-slate-400',
    textSecondary: isDark ? 'text-white/60' : 'text-slate-500',
    accent: 'text-[#10B981]',
    navActive: isDark ? 'bg-emerald-500/10 text-[#10B981] shadow-sm' : 'bg-emerald-500/10 text-[#059669]',
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-500 ${colors.bg} ${colors.text} selection:bg-[#10B981]/30`}>
      
      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-[20%] -right-[10%] w-[1000px] h-[1000px] rounded-full blur-[120px] opacity-[0.05] ${isDark ? 'bg-emerald-500' : 'bg-emerald-400'}`} />
        <div className={`absolute top-[40%] -left-[10%] w-[800px] h-[800px] rounded-full blur-[100px] opacity-[0.04] ${isDark ? 'bg-blue-600' : 'bg-blue-400'}`} />
      </div>

      {/* --- Sidebar --- */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0, x: -20 }}
            animate={{ width: 280, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: -20 }}
            className={`relative z-40 hidden md:flex flex-col h-screen border-r backdrop-blur-2xl ${colors.border} ${isDark ? 'bg-[#05050A]/95' : 'bg-white/95'}`}
          >
            {/* Logo */}
            <div className="p-8 pb-6 flex items-center gap-3">
              <div className="relative w-10 h-10">
                 <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-lg opacity-40"></div>
                 <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-inner shadow-white/20">
                    <Zap className="w-6 h-6 text-white drop-shadow-md" fill="currentColor" />
                 </div>
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight leading-none">FounderOS</h1>
                <span className={`text-[10px] uppercase tracking-[0.2em] font-medium ${colors.textMuted}`}>Workspace</span>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
              <div className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider ${colors.textMuted}`}>Main Menu</div>
              {[
                { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                { id: 'agents', icon: Bot, label: 'AI Agents', badge: '3' },
                { id: 'accounts', icon: Link2, label: 'Connect Accounts' },
                { id: 'platforms', icon: Calendar, label: 'Manage Posts' },
                { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
                    activeTab === item.id 
                      ? colors.navActive
                      : `${colors.textSecondary} hover:text-emerald-500 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]`
                  }`}
                >
                  <div className="flex items-center gap-3 z-10">
                    <item.icon className="w-5 h-5 transition-colors" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`z-10 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100/80 text-emerald-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
              
              <div className={`mt-8 px-4 py-2 text-[11px] font-bold uppercase tracking-wider ${colors.textMuted}`}>System</div>
              {[
                  { id: 'settings', icon: Settings, label: 'Settings' },
                  { id: 'support', icon: Check, label: 'Support' },
              ].map((item) => (
                  <button key={item.id} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${colors.textSecondary} hover:text-emerald-500 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]`}>
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                  </button>
              ))}

            </nav>

            {/* Bottom Actions */}
            <div className={`p-4 mt-auto border-t ${colors.border}`}>
              {/* Theme Toggle */}
              <button 
                  onClick={toggleTheme}
                  className={`w-full flex items-center justify-between p-3 rounded-xl mb-3 border transition-all ${colors.border} ${colors.surface} ${colors.surfaceHover}`}
                >
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-500/10 text-yellow-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                         {isDark ? <Sun size={16} /> : <Moon size={16} />}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</div>
                        <div className={`text-[10px] ${colors.textMuted}`}>Switch theme</div>
                      </div>
                   </div>
                   <div className={`w-8 h-4 rounded-full relative transition-colors ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                      <motion.div 
                        initial={false}
                        animate={{ x: isDark ? 18 : 2 }}
                        className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm"
                      />
                   </div>
                </button>

               <button 
                onClick={() => onNavigate?.('home')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 ${colors.textSecondary} hover:text-primary hover:bg-black/[0.02] dark:hover:bg-white/[0.02]`}
               >
                 <Home className="w-4 h-4" />
                 <span className="font-medium text-sm">Back to Home</span>
               </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto overflow-x-hidden scroll-smooth">
        
        {/* Header */}
        <header className={`sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-opacity-80 backdrop-blur-xl transition-all duration-300 ${scrolled ? `border-b ${colors.border}` : ''}`}>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-xl transition-transform active:scale-95 ${colors.textSecondary} hover:text-emerald-500`}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className={`hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl w-80 border focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all ${colors.surface} ${colors.border}`}>
              <Search className={`w-4 h-4 ${colors.textMuted}`} />
              <input type="text" placeholder="Ask your AI agent..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold ${colors.border} ${colors.textMuted}`}><Command size={10} /> K</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-3 mr-4">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 ${isDark ? 'border-[#030305]' : 'border-[#F2F4F7]'} bg-gray-500 flex items-center justify-center text-[10px] text-white overflow-hidden`}>
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="Agent" />
                    </div>
                  ))}
               </div>
               <div className="text-xs font-medium"><span className="text-emerald-500">3 Agents</span> Active</div>
             </div>
             
             <div className={`h-8 w-[1px] ${colors.border}`} />

             <button className="relative group p-2">
                <Bell className={`w-5 h-5 ${colors.textSecondary} group-hover:text-emerald-500 transition-colors`} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-black" />
             </button>

             <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 to-blue-500 cursor-pointer hover:scale-105 transition-transform">
                <img className="w-full h-full rounded-full border-2 border-[#030305]" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Profile" />
             </div>
          </div>
        </header>

        {/* --- Content Body --- */}
        <div className="flex-1 p-8 lg:p-10 max-w-[1600px] mx-auto w-full space-y-10">
          
          {activeTab === 'marketing' ? (
             <MarketingAgentDetail isDark={isDark} onBack={() => setActiveTab('agents')} />
          ) : activeTab === 'agents' ? (
             <AiWorkforce isDark={isDark} onSelectAgent={(id) => id === '1' && setActiveTab('marketing')} />
          ) : activeTab === 'accounts' ? (
             <ConnectAccounts userId="user_123" theme={theme} onClose={() => setActiveTab('overview')} />
           ) : activeTab === 'platforms' ? (
             <PlatformManager isDark={isDark} onBack={() => setActiveTab('overview')} />
           ) : activeTab === 'analytics' ? (
             <div className="flex items-center justify-center h-[500px]">
                <div className="text-center">
                   <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
                   <p className={`${colors.textSecondary}`}>This module is currently under development.</p>
                </div>
             </div>
          ) : (
             <>
               {/* Welcome Section */}
               <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <div className="space-y-2">
                    <div className="flex items-center gap-3">
                       <span className="text-3xl animate-pulse">{ICONS.fire}</span>
                       <h2 className="text-3xl font-bold tracking-tight">Good Morning, Alex</h2>
                    </div>
                    <p className={`${colors.textSecondary} text-base max-w-xl`}>
                       Your AI workforce has been busy. You have <span className="font-semibold text-emerald-500">12 tasks</span> awaiting approval.
                    </p>
                 </div>
                 <div className="flex gap-3">
                    <button className={`px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all ${colors.border} ${colors.surface} hover:scale-105`}>View Reports</button>
                    <button className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#10B981] text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                       <Plus size={18} strokeWidth={3} /> New Campaign
                    </button>
                 </div>
               </section>

               {/* CLAYMORPHISM STATS GRID */}
               <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`relative overflow-hidden rounded-[24px] p-6 border transition-all duration-300 hover:-translate-y-1 ${colors.surface} ${colors.border} ${isDark ? 'hover:shadow-black/50' : 'hover:shadow-lg'}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                         {/* 3D Clay Icon Container */}
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.clay} p-2`}>
                            <img src={stat.icon} alt={stat.label} className="w-full h-full object-contain drop-shadow-md transform transition-transform group-hover:scale-110" />
                         </div>
                         
                         <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.trendUp ? isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>
                            {stat.trend} <ArrowUpRight size={12} />
                         </div>
                      </div>
                      
                      <div>
                         <h3 className={`text-sm font-semibold mb-1 ${colors.textSecondary}`}>{stat.label}</h3>
                         <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
                      </div>
                    </motion.div>
                  ))}
               </section>

               {/* Main Split */}
               <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  
                  {/* Charts & Agents */}
                  <div className="xl:col-span-2 space-y-8">
                     
                     {/* Performance Chart */}
                     <div className={`rounded-[24px] p-8 border ${colors.surface} ${colors.border}`}>
                        <div className="flex items-center justify-between mb-8">
                           <div>
                              <h3 className="text-lg font-bold">Performance Overview</h3>
                              <p className={`text-sm ${colors.textSecondary}`}>Revenue vs Engagement over time</p>
                           </div>
                           <div className={`flex p-1 rounded-xl border ${colors.border} ${isDark ? 'bg-black/20' : 'bg-gray-100'}`}>
                              {['1D', '1W', '1M', '1Y'].map((t, idx) => (
                                 <button key={t} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${idx === 2 ? 'bg-[#10B981] text-white shadow-sm' : `${colors.textSecondary} hover:text-emerald-500`}`}>
                                    {t}
                                 </button>
                              ))}
                           </div>
                        </div>
                        
                        <div className="h-[240px] flex items-end gap-3 md:gap-4 px-2">
                           {[45, 78, 55, 90, 65, 88, 72, 95, 60, 85, 76, 92].map((h, i) => (
                             <div key={i} className="flex-1 group relative flex flex-col justify-end h-full">
                                <div className={`w-full rounded-t-lg transition-all duration-500 bg-gradient-to-t ${isDark ? 'from-emerald-900/50 to-emerald-500' : 'from-emerald-200 to-emerald-500'} group-hover:to-[#36E4DA]`} style={{ height: `${h}%` }} />
                             </div>
                           ))}
                        </div>
                     </div>

                     {/* Active Agents (with Clay Icons) */}
                     <div className={`rounded-[24px] border overflow-hidden ${colors.surface} ${colors.border}`}>
                         <div className="p-6 border-b border-inherit flex justify-between items-center">
                            <h3 className="text-lg font-bold">Active Agents</h3>
                            <button className="text-sm font-semibold text-[#10B981]" onClick={() => setActiveTab('agents')}>Manage All</button>
                         </div>
                         <div className="divide-y divide-inherit">
                            {activeAgents.map((agent, i) => (
                               <div key={i} className={`p-5 flex items-center justify-between group transition-colors ${colors.surfaceHover}`}>
                                  <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${agent.bg} shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.1),inset_2px_2px_4px_rgba(255,255,255,0.7)]`}>
                                        <span className="text-2xl drop-shadow-sm">{agent.icon}</span>
                                     </div>
                                     <div>
                                        <div className="flex items-center gap-2">
                                           <h4 className="font-bold">{agent.name}</h4>
                                           <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${agent.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : agent.status === 'Working' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                              {agent.status}
                                           </span>
                                        </div>
                                        <p className={`text-sm ${colors.textSecondary}`}>{agent.task}</p>
                                     </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-6">
                                     <div className="text-right hidden sm:block">
                                        <div className={`text-xs font-bold mb-1 ${colors.textSecondary}`}>{agent.progress}%</div>
                                        <div className={`w-24 h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                                           <div className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#36E4DA]" style={{ width: `${agent.progress}%` }} />
                                        </div>
                                     </div>
                                     <MoreVertical size={18} className={colors.textSecondary} />
                                  </div>
                               </div>
                            ))}
                         </div>
                     </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                     {/* Premium Card using 3D Crown */}
                     <div className={`relative rounded-[24px] p-8 overflow-hidden border ${isDark ? 'border-white/10' : 'border-black/5'}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#10B981] to-[#059669]" />
                        <div className="relative z-10 text-white">
                           <div className="flex items-center gap-3 mb-4">
                              <span className="text-4xl drop-shadow-lg">{ICONS.crown}</span>
                              <span className="font-bold tracking-wider opacity-90 uppercase text-xs">Premium Plan</span>
                           </div>
                           <h3 className="text-2xl font-bold mb-2">Unlock Full Potential</h3>
                           <p className="opacity-90 text-sm mb-6 max-w-[200px] leading-relaxed">
                              Get unlimited agents and advanced analytics.
                           </p>
                           <button className="w-full py-3 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all">
                              Upgrade Now
                           </button>
                        </div>
                     </div>

                     {/* Recent Activity */}
                     <div className={`rounded-[24px] border p-6 h-fit ${colors.surface} ${colors.border}`}>
                        <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
                        <div className="relative space-y-8 pl-2">
                           <div className={`absolute left-[7px] top-2 bottom-2 w-[2px] ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                           {recentActivity.map((act, i) => (
                              <div key={i} className="relative pl-6">
                                 <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-[3px] z-10 ${colors.surface} ${act.category === 'Content' ? 'border-amber-500' : act.category === 'Social' ? 'border-blue-500' : 'border-gray-500'}`} />
                                 <div className="flex justify-between items-start">
                                    <div>
                                       <h4 className="text-sm font-bold">{act.title}</h4>
                                       <p className={`text-xs mt-0.5 ${colors.textSecondary}`}>{act.content}</p>
                                    </div>
                                    <span className={`text-[10px] font-medium ${colors.textMuted}`}>{act.time}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                        <button className="w-full mt-6 py-3 rounded-xl text-sm font-bold border border-dashed transition-all border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">View All History</button>
                     </div>
                  </div>

               </section>
             </>
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
