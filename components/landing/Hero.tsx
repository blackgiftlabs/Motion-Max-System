
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { ArrowRight, ChevronDown, Send } from 'lucide-react';

const HeroBg = "https://i.ibb.co/SDBtypBM/hero.jpg";

export const Hero: React.FC = () => {
  const { setView } = useStore();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Opacity for background darkening
  const overlayOpacity = Math.min(0.4 + (scrollY / 800) * 0.6, 0.95);
  
  // Dynamic transform values for buttons based on scroll
  const buttonOffset = scrollY * 1.1; 
  const fadeOutOpacity = Math.max(1 - scrollY / 700, 0);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden z-20 bg-white dark:bg-slate-950">
      {/* Background with darkening logic */}
      <div className="absolute inset-0 z-0">
        <img 
          src={HeroBg} 
          alt="Background" 
          className="w-full h-full object-cover transition-transform duration-100" 
          style={{ transform: `scale(${1 + scrollY * 0.00015})` }} 
        />
        <div 
          className="absolute inset-0 transition-colors duration-300" 
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-6 text-center pt-20">
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
          <h1 
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] text-white font-script font-bold drop-shadow-2xl transition-all duration-300 ease-out"
            style={{ 
              transform: `translateY(${-scrollY * 0.15}px)`, 
              opacity: fadeOutOpacity 
            }}
          >
            Autism Center for Child Development
          </h1>
          
          <p 
            className="text-sm sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-semibold transition-all duration-300 ease-out"
            style={{ 
              transform: `translateY(${-scrollY * 0.08}px) scale(${1 - scrollY / 3000})`, 
              opacity: fadeOutOpacity 
            }}
          >
            MotionMax provides expert behavioral support for individuals with autism across Zimbabwe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 pt-6">
            <button 
              onClick={() => setView('login')}
              className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-none font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-googleBlue hover:text-white transition-all shadow-2xl active:scale-95 group z-30"
              style={{ 
                transform: `translateX(${-buttonOffset}px)`, 
                opacity: fadeOutOpacity,
                visibility: fadeOutOpacity <= 0.1 ? 'hidden' : 'visible'
              }}
            >
              Access Portal <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button 
              onClick={() => setView('apply')}
              className="w-full sm:w-auto px-10 py-5 rounded-none border-2 border-white text-white font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all backdrop-blur-sm active:scale-95 flex items-center justify-center gap-4 group z-30"
              style={{ 
                transform: `translateX(${buttonOffset}px)`, 
                opacity: fadeOutOpacity,
                visibility: fadeOutOpacity <= 0.1 ? 'hidden' : 'visible'
              }}
            >
              Apply Online <Send size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 transition-opacity duration-300"
        style={{ opacity: 1 - scrollY / 200 }}
      >
        <div className="flex flex-col items-center gap-2 text-white/40">
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};
