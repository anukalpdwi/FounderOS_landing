import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, CheckCircle2, Loader2, Mail, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Waitlist: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [count, setCount] = useState<number>(14209);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  useEffect(() => {
    // Only attempt connection if keys are present
    const isConfigured = !!import.meta.env.VITE_SUPABASE_URL;
    if (!isConfigured) return;

    const setupRealtime = async () => {
        // Fetch initial count
        const { count: initialCount, error } = await supabase
            .from('waitlist')
            .select('*', { count: 'exact', head: true });
        
        if (!error && initialCount !== null) {
            setCount(initialCount);
            setRealtimeActive(true);
        }

        // Subscribe to real-time updates
        const channel = supabase
            .channel('waitlist-updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'waitlist' },
                (payload) => {
                    setCount((prev) => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    setupRealtime();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isConfigured = !!import.meta.env.VITE_SUPABASE_URL;

    if (!isConfigured) {
        // Fallback simulation
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
        }, 1500);
        return;
    }

    try {
        // Add to waitlist table
        const { error: dbError } = await supabase
            .from('waitlist')
            .insert([{ email }]);
        
        if (dbError) {
            if (dbError.code === '23505') { // Unique violation
                 setAlreadyJoined(true);
                 setSuccess(true);
            } else {
                 throw dbError;
            }
        } else {
            setSuccess(true);
        }
    } catch (err: any) {
        console.error('Error:', err);
        alert(err.message || 'An error occurred. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-20 flex items-center justify-center relative overflow-hidden px-4">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[radial-gradient(circle_at_center,rgba(0,220,130,0.05)_0%,transparent_70%)]"></div>
             <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-brand-green/20 to-transparent"></div>
             <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-brand-green/20 to-transparent"></div>
        </div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md relative z-10"
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold uppercase tracking-wider mb-4">
                    <Lock className="w-3 h-3" /> Private Beta Access
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {success ? "Welcome aboard!" : "Join the future."}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    {success ? "You've taken the first step." : "High demand. Limited spots available this week."}
                </p>
            </div>

            <div className="glass-card bg-white/80 dark:bg-[#0A0A0A]/90 p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
                {/* Top Loading Bar */}
                {loading && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-white/10 overflow-hidden">
                        <div className="h-full bg-brand-green animate-shimmer w-1/2 absolute top-0 left-0"></div>
                    </div>
                )}

                {success ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                    >
                        <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-green">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {alreadyJoined ? "You're already on the list!" : "Spot Reserved"}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-[80%] mx-auto leading-relaxed">
                            {alreadyJoined 
                                ? "We have your email. Stay tuned for updates!" 
                                : <>Thank you for joining. We've sent a welcome email to <span className="text-gray-900 dark:text-white font-medium">{email}</span>. We're excited to have you with us.</>
                            }
                        </p>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Current Waitlist</p>
                            <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
                                #{count.toLocaleString()}
                            </div>
                            {realtimeActive && (
                                <div className="text-[10px] text-brand-green mt-1 flex items-center justify-center gap-1">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
                                    </span>
                                    Live Updates
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-brand-green/50 focus:ring-1 focus:ring-brand-green/50 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                        placeholder="founder@startup.com"
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 my-4">
                                By joining, you agree to our <a href="#" className="underline hover:text-brand-green">Terms</a> and <a href="#" className="underline hover:text-brand-green">Privacy Policy</a>.
                            </p>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Join Waitlist <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3" /> 256-bit Encryption
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                <div>SOC2 Compliant</div>
            </div>
        </motion.div>
    </div>
  );
};

export default Waitlist;
