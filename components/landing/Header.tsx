
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Menu, X, Sun, Moon, ShoppingCart, ChevronRight } from 'lucide-react';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const Header: React.FC = () => {
  const { setView, theme, toggleTheme, view, cart } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const sections = ['services', 'story', 'contact'];
      const scrollPos = window.scrollY + 200;

      let current = 'home';
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element && scrollPos >= element.offsetTop) {
          current = sectionId;
        }
      }
      setActiveSection(current);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const BrandLogo = () => (
    <div 
      className="flex items-center gap-2 xl:gap-3 group cursor-pointer whitespace-nowrap shrink-0" 
      onClick={() => {
        setView('landing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <div className="relative">
        <img src={LogoImg} alt="Motion Max" className="h-8 md:h-10 lg:h-12 w-auto transition-transform duration-500 group-hover:rotate-[360deg]" />
        <div className="absolute -inset-1 bg-googleBlue/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="flex flex-col justify-center">
        <span className="font-black text-lg md:text-xl lg:text-2xl tracking-tighter text-slate-900 dark:text-white leading-none">MOTION MAX</span>
        <span className="text-[7px] md:text-[8px] lg:text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 block tracking-[0.3em] lg:tracking-[0.4em] mt-1">Day Services</span>
      </div>
    </div>
  );

  const navLinks = [
    { label: 'Home', id: 'home', href: 'home', type: 'scroll' },
    { label: 'Services', id: 'services', href: 'services', type: 'scroll' },
    { label: 'Uniforms', id: 'shop', href: 'shop', type: 'view' },
    { label: 'Careers', id: 'careers', href: 'careers', type: 'view' },
    { label: 'About Us', id: 'story', href: 'story', type: 'scroll' },
    { label: 'Contact', id: 'contact', href: 'contact', type: 'scroll' },
  ];

  const handleNavClick = (link: any) => {
    if (link.type === 'view') {
      setView(link.id);
    } else {
      if (view !== 'landing') {
        setView('landing');
        setTimeout(() => {
          const element = document.getElementById(link.id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          } else if (link.id === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 150);
      } else {
        const element = document.getElementById(link.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (link.id === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'h-16 lg:h-20 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-xl' 
          : 'h-20 lg:h-24 bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between px-4 md:px-6 lg:px-12 gap-2 lg:gap-4">
          <BrandLogo />
          
          <nav className="hidden lg:flex items-center bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm shadow-inner shrink">
            {navLinks.map(link => {
              const isActive = (link.type === 'scroll' && activeSection === link.id && view === 'landing') || 
                              (link.type === 'view' && view === link.id);
              
              return (
                <button 
                  key={link.id} 
                  onClick={() => handleNavClick(link)}
                  className={`relative px-3 xl:px-5 py-2 text-[10px] xl:text-[11px] font-black uppercase tracking-[0.15em] xl:tracking-[0.2em] transition-all duration-500 rounded-full group whitespace-nowrap ${
                    isActive 
                      ? 'text-white' 
                      : 'text-slate-900 dark:text-slate-300 hover:text-googleBlue dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-slate-900 dark:bg-blue-600 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_15px_rgba(37,99,235,0.4)] animate-in zoom-in-90 duration-300"></div>
                  )}
                  
                  {!isActive && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-googleBlue transition-all duration-300 group-hover:w-1/2"></div>
                  )}
                  
                  <span className="relative z-10">{link.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 xl:gap-3 shrink-0">
            <button 
              onClick={() => setView('shop')}
              className="relative p-2 xl:p-3 text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all group"
            >
              <ShoppingCart id="common-header-cart" size={18} className="group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 xl:w-5 xl:h-5 bg-googleBlue text-white text-[8px] xl:text-[9px] font-black rounded-full flex items-center justify-center ring-2 xl:ring-4 ring-white dark:ring-slate-950 animate-in zoom-in">
                  {cart.length}
                </span>
              )}
            </button>
            
            <button 
              onClick={toggleTheme} 
              className="p-2 xl:p-3 rounded-2xl text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
            >
              {theme === 'light' 
                ? <Moon size={18} className="group-hover:rotate-[20deg] transition-transform" /> 
                : <Sun size={18} className="group-hover:rotate-[45deg] transition-transform" />
              }
            </button>
            
            <div className="h-6 xl:h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

            <button 
              onClick={() => setView('login')}
              className="hidden sm:flex items-center gap-2 xl:gap-3 bg-slate-900 dark:bg-blue-600 text-white px-5 xl:px-8 py-2.5 xl:py-3.5 rounded-none text-[10px] xl:text-[11px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 group relative overflow-hidden whitespace-nowrap"
            >
              <span className="relative z-10">Login Portal</span>
              <ChevronRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            
            <button className="lg:hidden p-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Enhanced Experience */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 lg:hidden flex flex-col animate-in fade-in duration-500">
          <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <BrandLogo />
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white active:scale-90 transition-all">
              <X size={32} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">Main Navigation</p>
            {navLinks.map((link, idx) => (
              <button 
                key={link.id} 
                onClick={() => handleNavClick(link)}
                className="w-full group flex items-center justify-between py-5 text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-900 transition-all hover:pl-4 hover:text-googleBlue"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span>{link.label}</span>
                <ChevronRight className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" size={24} />
              </button>
            ))}
          </div>

          <div className="p-8 bg-slate-50 dark:bg-slate-900 space-y-6">
            <button 
              onClick={() => setView('login')}
              className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-none text-lg font-black uppercase tracking-widest shadow-2xl active:scale-[0.98] transition-all"
            >
              Access Portal
            </button>
            <p className="text-center text-[9px] font-bold text-slate-400 tracking-[0.5em] uppercase">Motion Max Terminal v3.1.4</p>
          </div>
        </div>
      )}
    </>
  );
};
