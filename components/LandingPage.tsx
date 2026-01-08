
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Sun, Moon, ArrowRight, HeartPulse, Brain, Users, MapPin, Phone, Mail, Instagram, Menu, X } from 'lucide-react';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";
const HeroBg = "https://i.ibb.co/SDBtypBM/hero.jpg";

export const LandingPage: React.FC = () => {
  const { setView, theme, toggleTheme } = useStore();
  const [scrollY, setScrollY] = useState(0);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);
      
      if (currentScroll > window.innerHeight * 0.3) {
        setIsHeroVisible(false);
      } else {
        setIsHeroVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const overlayOpacity = Math.min(0.5 + (scrollY / (window.innerHeight || 800)) * 0.5, 0.95);
  
  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Services', href: '#services' },
    { label: 'About Us', href: '#story' },
    { label: 'Contact', href: '#contact' },
  ];

  const BrandLogo = () => (
    <div className="flex items-center gap-2 md:gap-3 group">
      <img src={LogoImg} alt="Motion Max" className="h-10 md:h-12 w-auto transition-transform group-hover:scale-110" />
      <div className="flex flex-col justify-center">
        <span 
          className="font-black text-xl md:text-2xl tracking-tighter text-slate-900 dark:text-white leading-none"
          style={{ fontFamily: '"Arial Black", "Franklin Gothic Heavy", sans-serif' }}
        >
          MOTION MAX
        </span>
        <div className="w-full flex justify-between mt-1 md:mt-1.5">
          <span 
            className="text-[8px] md:text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block w-full text-center tracking-[0.45em] translate-x-[0.22em]"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            Day Services
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-500">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 shadow-sm h-16 md:h-20">
        <div className="w-full px-4 md:px-10 h-full flex items-center justify-between">
          <div className="flex-shrink-0">
            <BrandLogo />
          </div>
          
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map(link => (
              <a 
                key={link.label} 
                href={link.href} 
                className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <button 
              onClick={toggleTheme} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-lg"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button 
              onClick={() => setView('login')}
              className="hidden sm:flex bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-6 md:px-8 py-2.5 md:py-3 rounded-none text-[10px] md:text-xs font-black uppercase tracking-widest transition-all hover:bg-blue-600 hover:text-white group relative overflow-hidden"
            >
              <span className="relative z-10">Login to Portal</span>
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            <button 
              className="lg:hidden p-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-lg ml-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 lg:hidden animate-in fade-in duration-300">
           <div className="flex flex-col h-full p-6 pt-24">
              <div className="flex flex-col gap-6">
                 {navLinks.map(link => (
                    <a 
                      key={link.label} 
                      href={link.href} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4"
                    >
                      {link.label}
                    </a>
                 ))}
              </div>
              <div className="mt-auto pt-10 pb-8 space-y-4">
                 <button 
                  onClick={() => setView('login')}
                  className="w-full bg-blue-600 text-white py-5 text-lg font-black uppercase tracking-widest active:scale-95 transition-transform"
                 >
                    Access Portal
                 </button>
                 <p className="text-center text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">Motion Max Terminal v3.1</p>
              </div>
           </div>
        </div>
      )}

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={HeroBg} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
            style={{ transform: `scale(${1.05 + scrollY * 0.0002})` }}
          />
          <div 
            className="absolute inset-0 transition-colors duration-300"
            style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
          ></div>
        </div>

        <div className="relative z-10 w-full px-5 md:px-10 lg:px-20 flex flex-col items-center justify-center text-center">
          <div className="space-y-6 md:space-y-12 flex flex-col items-center max-w-[1400px] mx-auto">
            <h1 
              className={`text-3xl sm:text-5xl md:text-8xl lg:text-9xl text-white drop-shadow-2xl leading-tight ${isHeroVisible ? 'animate-fade-in' : 'animate-fade-out'}`}
              style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700 }}
            >
              Autism Center for Child Development
            </h1>
            <p className={`text-sm sm:text-xl md:text-2xl lg:text-3xl text-white/90 drop-shadow-lg max-w-4xl leading-relaxed font-semibold px-4 ${isHeroVisible ? 'animate-fade-in delay-100' : 'animate-fade-out'}`}>
              MotionMax provides expert behavioral support for individuals with autism and special needs across Zimbabwe.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 pt-6 md:pt-10 w-full max-w-md sm:max-w-none">
              <button 
                onClick={() => setView('login')}
                className={`w-full sm:w-auto bg-white text-slate-900 px-10 py-5 md:px-12 md:py-6 rounded-none font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 group ${isHeroVisible ? 'animate-slide-left-in delay-300' : 'animate-slide-left-out'}`}
              >
                Access Portal <ArrowRight size={22} className="group-hover:translate-x-3 transition-transform" />
              </button>
              <button className={`w-full sm:w-auto px-10 py-5 md:px-12 md:py-6 rounded-none border-2 border-white text-white font-black uppercase tracking-widest text-[10px] md:text-sm hover:bg-white/20 transition-all backdrop-blur-sm active:scale-95 ${isHeroVisible ? 'animate-slide-right-in delay-300' : 'animate-slide-right-out'}`}>
                Our Programs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content sections below... (Simplified for context) */}
      <section id="services" className="py-24 md:py-40 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-32 space-y-4 md:space-y-6">
            <h2 className="text-3xl md:text-6xl font-black tracking-tight uppercase dark:text-white">Comprehensive Services</h2>
            <div className="w-16 md:w-32 h-1.5 md:h-2.5 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
            {[
              { icon: <Brain />, title: "ABA Therapy", desc: "Using the ABCs of behavior to create individualized Intervention Plans." },
              { icon: <HeartPulse />, title: "Specialized Care", desc: "Day services for children aged 3+ specializing in autism and related disorders." },
              { icon: <Users />, title: "One-to-One Basis", desc: "We ensure personalized attention with a dedicated teacher per child." }
            ].map((s, i) => (
              <div key={i} className="p-8 md:p-14 rounded-3xl md:rounded-[3.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all group">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-white dark:bg-slate-800 text-blue-600 flex items-center justify-center rounded-2xl md:rounded-3xl mb-8 md:mb-12 shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  {React.cloneElement(s.icon as React.ReactElement<any>, { size: 28 })}
                </div>
                <h3 className="text-xl md:text-3xl font-black mb-4 md:mb-6 uppercase tracking-tight dark:text-white">{s.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-base md:text-xl">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 text-center">
         <BrandLogo />
         <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-12">© {new Date().getFullYear()} MOTION MAX // BRANCH STABLE // DATA ENCRYPTED</p>
      </footer>
    </div>
  );
};
