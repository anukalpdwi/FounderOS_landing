import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// CountUp Component
const CountUp = ({ to }: { to: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    return (
        <span ref={ref} className="tabular-nums">
             {isInView ? <Counter value={to} /> : 0}
        </span>
    )
}

const Counter = ({ value }: { value: number }) => {
    const [count, setCount] = React.useState(0);
    
    React.useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 2000;
        const incrementTime = 20;
        const steps = duration / incrementTime;
        const increment = end / steps;

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);

    return <>{count}</>;
}


const Stats: React.FC = () => {
  const bars = [
    { label: 'Sales Outreach', percentage: 98, color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/20' },
    { label: 'Financial Ops', percentage: 94, color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/20' },
    { label: 'Marketing ROI', percentage: 92, color: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-500/20' },
    { label: 'Recruiting Speed', percentage: 89, color: 'from-pink-400 to-pink-600', shadow: 'shadow-pink-500/20' },
  ];

  return (
    <section className="py-24 md:py-32 bg-white dark:bg-[#050505] overflow-hidden relative border-t border-gray-100 dark:border-white/5 transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-green/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
                <span className="w-8 h-[1px] bg-brand-green"></span>
                <span className="text-brand-green text-sm font-bold tracking-widest uppercase">The Efficiency Gap</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-[1.1] tracking-tight text-gray-900 dark:text-white">
              <span className="text-gray-900 dark:text-white"><CountUp to={305} /> million</span> founders are <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-800 dark:from-gray-200 dark:to-gray-600">stuck in execution.</span>
            </h2>
            
            <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-light">
              <p>
                The modern founder spends <strong className="text-gray-900 dark:text-white font-medium">70% of their time</strong> on non-strategic tasks. Sales calls, spreadsheets, compliance—it's the "death by a thousand cuts" for scalability.
              </p>
              <p>
                FounderOS inverts this model. By delegating execution to autonomous agents, you regain the bandwidth to do what you actually started a company to do: <strong className="text-gray-900 dark:text-white font-medium">Build.</strong>
              </p>
            </div>
          </motion.div>

          {/* Right Chart - Futuristic HUD Look */}
          <div className="relative">
            {/* Glow under chart */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-brand-green/20 to-blue-500/20 blur-2xl rounded-3xl opacity-30"></div>
            
            <div className="glass-card p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/60 backdrop-blur-xl relative overflow-hidden">
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 dark:via-white/5 to-transparent h-[10px] w-full animate-scanline pointer-events-none opacity-20"></div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-12 border-b border-gray-100 dark:border-white/5 pb-8">
                <div className="relative">
                     <div className="w-24 h-24 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold text-3xl border border-brand-green/30 relative z-10">
                        95%
                     </div>
                     <div className="absolute inset-0 bg-brand-green/30 blur-xl rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Operational Efficiency</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Average gain reported by Series A founders</p>
                </div>
              </div>

              <div className="space-y-8">
                {bars.map((bar, index) => (
                  <div key={bar.label} className="relative group">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-600 dark:text-gray-300 font-medium tracking-wide flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${bar.color}`}></span>
                          {bar.label}
                      </span>
                      <span className="text-gray-900 dark:text-white font-mono font-bold">{bar.percentage}%</span>
                    </div>
                    {/* Background Bar */}
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden border border-black/5 dark:border-white/5 backdrop-blur-sm">
                      {/* Foreground Bar */}
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${bar.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.2 + (index * 0.1), ease: "circOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${bar.color} ${bar.shadow} relative`}
                      >
                           {/* Glow Line on Bar */}
                           <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-[4px]"></div>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Stats;