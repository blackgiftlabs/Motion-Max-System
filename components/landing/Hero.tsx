
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { ArrowRight, ChevronDown } from 'lucide-react';

const HeroBg = "https://i.ibb.co/SDBtypBM/hero.jpg";

export const Hero: React.FC = () => {
  const { setView } = useStore();
  const [scrollY, setScrollY] = useState(0);
  const [shouldExit, setShouldExit] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const curr = window.scrollY;
      setScrollY(curr);
      // Trigger "reverse" animation when scrolled past 25% of viewport
      setShouldExit(curr > window.innerHeight * 0.25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Opacity for background darkening
  const overlayOpacity = Math.min(0.4 + (scrollY / 800) * 0.6, 0.95);

  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background with darkening logic */}
      <div className="absolute inset-0 z-0">
        <img 
          src={HeroBg} 
          alt="Background" 
          className="w-full h-full object-cover transition-transform duration-100" 
          style={{ transform: `scale(${1 + scrollY * 0.0001})` }} 
        />
        <div 
          className="absolute inset-0 transition-colors duration-300" 
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        ></div>
      </div>

      {/* Content with reverse animation logic */}
      <div className="relative z-10 w-full px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
          <h1 
            className={`text-4xl sm:text-6xl md:text-8xl lg:text-9xl text-white font-script font-bold drop-shadow-2xl transition-all duration-700 ease-in-out ${
              shouldExit ? 'opacity-0 -translate-y-20' : 'animate-fade-in'
            }`}
          >
            Autism Center for Child Development
          </h1>
          
          <p className={`text-sm sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-semibold transition-all duration-700 delay-100 ${
            shouldExit ? 'opacity-0 scale-90' : 'animate-fade-in delay-100'
          }`}>
            MotionMax provides expert behavioral support for individuals with autism across Zimbabwe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 pt-8">
            <button 
              onClick={() => setView('login')}
              className={`w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-none font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-googleBlue hover:text-white transition-all shadow-2xl active:scale-95 group ${
                shouldExit ? 'opacity-0 -translate-x-40' : 'animate-slide-left-in delay-300'
              }`}
            >
              Access Portal <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button 
              onClick={scrollToServices}
              className={`w-full sm:w-auto px-10 py-5 rounded-none border-2 border-white text-white font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all backdrop-blur-sm active:scale-95 flex items-center justify-center gap-4 group ${
                shouldExit ? 'opacity-0 translate-x-40' : 'animate-slide-right-in delay-300'
              }`}
            >
              Discover what we do <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
