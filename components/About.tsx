import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Zap, Globe, ArrowRight, Heart } from 'lucide-react';

const About: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="pt-32 pb-20 bg-gray-50 dark:bg-black min-h-screen relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-gray-100 to-transparent dark:from-white/5 pointer-events-none"></div>
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-brand-green/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-4xl mx-auto mb-24"
            >
                <div className="inline-block px-3 py-1 mb-6 border border-brand-green/30 bg-brand-green/5 rounded-full text-brand-green text-xs font-bold uppercase tracking-widest">
                    The Masterplan
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8 leading-tight">
                    We're building the <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-600">future of entrepreneurship.</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                    Humans are designed for creativity, vision, and connection. <br/>
                    Machines are designed for execution. FounderOS bridges the gap.
                </p>
            </motion.div>

            {/* The Story / Manifesto */}
            <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
                        <img 
                            src="https://images.unsplash.com/photo-1697764712191-d961d1e090a7?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                            alt="Team collaboration" 
                            className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                            <div className="text-sm font-mono opacity-70 mb-2">EST. 2025</div>
                            <div className="text-2xl font-bold">San Francisco, CA</div>
                        </div>
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 max-w-xs hidden md:block">
                        <div className="flex items-center gap-3 mb-2">
                            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                            <span className="font-bold text-gray-900 dark:text-white">Founder First</span>
                        </div>
                        <p className="text-xs text-gray-500">We optimize for founder mental health as much as revenue.</p>
                    </div>
                </motion.div>
                
                <motion.div 
                     initial={{ opacity: 0, x: 50 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     className="space-y-8"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Why we exist</h2>
                    <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                        <p>
                            Starting a company used to mean signing up for years of burnout. You had to be the CEO, the janitor, the salesperson, and the accountant. 
                        </p>
                        <p>
                            We believe that <strong className="text-gray-900 dark:text-white font-semibold">operational friction kills more dreams than lack of capital.</strong>
                        </p>
                        <p>
                            FounderOS was born from a simple question: What if software didn't just help you work, but actually <em className="italic text-brand-green">did the work for you?</em>
                        </p>
                    </div>
                    <div className="pt-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">1.5M+</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wide">Tasks Automated</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$400M+</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wide">Value Created</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Values Section */}
            <div className="mb-32">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Our Core Values</h2>
                    <p className="text-gray-500 dark:text-gray-400">The code that runs our company.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: Target, title: "Outcome Over Output", desc: "We don't care how many hours you work. We care about what you ship and the impact it has." },
                        { icon: Zap, title: "Velocity is Quality", desc: "Speed allows for more iterations. More iterations leads to better products. Move fast." },
                        { icon: Users, title: "Radical Autonomy", desc: "We build autonomous agents, and we hire autonomous humans. No micromanagement." }
                    ].map((val, i) => (
                        <motion.div 
                            key={i}
                            whileHover={{ y: -10 }}
                            className="bg-white dark:bg-[#0A0A0A] p-8 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-brand-green">
                                <val.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{val.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                {val.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Join Us CTA */}
            <div className="relative rounded-[3rem] overflow-hidden bg-black dark:bg-white/5 border border-gray-800 dark:border-white/10">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-green/20 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10 px-6 py-20 md:p-24 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to join the revolution?</h2>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                        We are currently in private beta. Join the waitlist to get early access to the operating system of the future.
                    </p>
                    <button 
                        onClick={() => onNavigate('waitlist')}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-brand-green text-black rounded-full font-bold text-lg hover:bg-[#00c272] transition-colors shadow-[0_0_30px_rgba(0,220,130,0.3)]"
                    >
                        Join the Waitlist <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
};

export default About;