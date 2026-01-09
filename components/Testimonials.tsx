import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { Testimonial } from '../types';

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Founder",
    company: "TechFlow",
    content: "FounderOS AI handles my fundraising pipeline while I sleep! It drafts investor updates, tracks metrics, and even preps me for calls. I closed $500K in 6 weeks without hiring a single associate.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    name: "Marcus Rodriguez",
    role: "Solo Founder",
    company: "DataPulse",
    content: "I was drowning in operations. FounderOS took over sales outreach, content marketing, and financial modeling. I got my life back and 3x'd revenue. It feels like I have a team of 10 working 24/7.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    name: "Emily Park",
    role: "CEO",
    company: "CloudNest",
    content: "It's like having a full exec team for the price of a Netflix subscription. The CFO agent alone saved me 20 hours a week on financial planning. The ROI is absolutely insane.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200"
  },
  {
    name: "James Wilson",
    role: "Director",
    company: "Nova Systems",
    content: "The institutional memory is a game changer. The AI remembers every decision we've made. Onboarding new (human) staff is now instant because the AI answers all their questions.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200"
  }
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = testimonials.length - 1;
      if (nextIndex >= testimonials.length) nextIndex = 0;
      return nextIndex;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 8000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section id="testimonials" className="py-24 md:py-32 bg-gray-50 dark:bg-[#020403] border-t border-gray-100 dark:border-white/5 relative overflow-hidden transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] bg-brand-green/5 blur-[120px] rounded-full"></div>
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-green/20 to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500">
             <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                ))}
             </div>
             <span className="text-xs font-bold tracking-wide uppercase">Trusted by 1,500+ Founders</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Don't just take our word for it.</h2>
        </motion.div>

        {/* Height increased for mobile to accommodate stacked layout */}
        <div className="relative min-h-[600px] md:min-h-[400px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 },
                scale: { duration: 0.4 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -10000) {
                  paginate(1);
                } else if (swipe > 10000) {
                  paginate(-1);
                }
              }}
              className="absolute w-full px-2"
            >
              <div className="max-w-4xl mx-auto">
                <div className="glass-card p-8 md:p-14 rounded-[2rem] md:rounded-[2.5rem] relative border border-gray-200 dark:border-white/10 shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-black/40">
                  <div className="absolute -top-5 -left-2 md:-top-6 md:-left-6 bg-brand-green rounded-full p-3 md:p-4 text-black shadow-lg shadow-brand-green/20">
                    <Quote className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
                    {/* User Image */}
                    <div className="shrink-0 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-br from-brand-green to-blue-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                        <img 
                            src={currentTestimonial.image} 
                            alt={currentTestimonial.name} 
                            className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover border-2 border-white/20 relative z-10 shadow-md"
                        />
                    </div>

                    <div className="text-center md:text-left">
                        <div className="flex justify-center md:justify-start gap-1 mb-6">
                            {[...Array(currentTestimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                            ))}
                        </div>
                        
                        <p className="text-lg md:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed font-light mb-8">
                            "{currentTestimonial.content}"
                        </p>
                        
                        <div>
                            <div className="text-gray-900 dark:text-white font-bold text-lg">{currentTestimonial.name}</div>
                            <div className="text-brand-green font-medium">{currentTestimonial.role}, {currentTestimonial.company}</div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-6 md:gap-8 mt-4 md:mt-12 z-20 relative">
          <button 
            onClick={() => paginate(-1)}
            className="p-3 md:p-4 rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 hover:border-brand-green/50 hover:text-brand-green text-gray-700 dark:text-gray-300 transition-all duration-300 group"
            aria-label="Previous testimonial"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex gap-2 md:gap-3">
            {testimonials.map((_, idx) => (
                <button
                    key={idx}
                    onClick={() => {
                        setDirection(idx > currentIndex ? 1 : -1);
                        setCurrentIndex(idx);
                    }}
                    className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 md:w-8 bg-brand-green shadow-[0_0_10px_rgba(0,220,130,0.5)]' : 'w-1.5 md:w-2 bg-gray-300 dark:bg-white/20 hover:bg-gray-400 dark:hover:bg-white/40'}`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                />
            ))}
          </div>

          <button 
            onClick={() => paginate(1)}
            className="p-3 md:p-4 rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 hover:border-brand-green/50 hover:text-brand-green text-gray-700 dark:text-gray-300 transition-all duration-300 group"
            aria-label="Next testimonial"
          >
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;