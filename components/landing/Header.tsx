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
      className="flex items-center gap-1.5 sm:gap-3 group cursor-pointer flex-shrink-0" 
      onClick={() => {
        setView('landing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <div className="relative flex-shrink-0">
        {/* Logo scales down on smallest screens */}
        <img src={LogoImg} alt="Motion Max" className="h-8 w-auto xs:h-10 md:h-12 transition-transform duration-500 group-hover:rotate-[360deg]" />
        <div className="absolute -inset-1 bg-googleBlue/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="flex flex-col justify-center whitespace-nowrap">
        <span className="font-black text-sm xs:text-lg md:text-2xl tracking-tighter text-slate-900 dark:text-white leading-none">MOTION MAX</span>
        <span className="text-[7px] md:text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 block tracking-[0.2em] md:tracking-[0.4em] mt-0.5 md:mt-1">Day Services</span>
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
          if (element) element.scrollIntoView({ behavior: 'smooth' });
          else if (link.id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 150);
      } else {
        const element = document.getElementById(link.id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
        else if (link.id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 flex items-center ${
        scrolled 
          ? 'h-16 md:h-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-xl' 
          : 'h-20 md:h-24 bg-transparent border-b border-transparent'
      }`}>
        {/* mx-auto and px used to prevent edge-touching, but flex-nowrap keeps it in one line */}
        <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between px-4 sm:px-6 md:px-12 gap-2">
          
          <BrandLogo />
          
          {/* Tablet & Desktop Nav: Breakpoint changed to xl for the full pill, 
              but we use 'lg' with smaller padding to keep it visible longer */}
          <nav className="hidden xl:flex items-center bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm flex-shrink min-w-0">
            {navLinks.map(link => {
              const isActive = (link.type === 'scroll' && activeSection === link.id && view === 'landing') || 
                              (link.type === 'view' && view === link.id);
              
              return (
                <button 
                  key={link.id} 
                  onClick={() => handleNavClick(link)}
                  className={`relative px-3 2xl:px-6 py-2 text-[10px] 2xl:text-[11px] font-black uppercase tracking-[0.1em] 2xl:tracking-[0.2em] transition-all duration-500 rounded-full group whitespace-nowrap flex-shrink-0 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-slate-900 dark:text-slate-300 hover:text-googleBlue dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-slate-900 dark:bg-blue-600 rounded-full shadow-lg animate-in zoom-in-90 duration-300"></div>
                  )}
                  <span className="relative z-10">{link.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
            <button 
              onClick={() => setView('shop')}
              className="relative p-2 sm:p-3 text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group"
            >
              <ShoppingCart id="common-header-cart" size={18} className="md:size-[20px] group-hover:scale-110 transition-transform" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 md:w-5 md:h-5 bg-googleBlue text-white text-[8px] md:text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-950 animate-in zoom-in">
                  {cart.length}
                </span>
              )}
            </button>
            
            <button 
              onClick={toggleTheme} 
              className="p-2 sm:p-3 rounded-xl text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {theme === 'light' 
                ? <Moon size={18} className="md:size-[20px]" /> 
                : <Sun size={18} className="md:size-[20px]" />
              }
            </button>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 hidden sm:block"></div>

            <button 
              onClick={() => setView('login')}
              className="hidden lg:flex items-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-4 xl:px-8 py-2.5 xl:py-3.5 rounded-xl text-[10px] xl:text-[11px] font-black uppercase tracking-widest transition-all shadow-lg hover:scale-105 whitespace-nowrap"
            >
              <span className="relative z-10">Portal</span>
              <ChevronRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
            
            {/* Mobile Menu Toggle - appears earlier (at xl) to prevent nav crowding */}
            <button className="xl:hidden p-2 sm:p-3 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} className="sm:size-[24px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Remains unchanged as it is a fullscreen overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 xl:hidden flex flex-col animate-in fade-in duration-500">
          <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <BrandLogo />
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white">
              <X size={28} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-2">
            {navLinks.map((link, idx) => (
              <button 
                key={link.id} 
                onClick={() => handleNavClick(link)}
                className="w-full group flex items-center justify-between py-5 text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white border-b border-slate-50 dark:border-slate-900"
              >
                <span>{link.label}</span>
                <ChevronRight size={24} />
              </button>
            ))}
          </div>

          <div className="p-8 bg-slate-50 dark:bg-slate-900">
            <button 
              onClick={() => { setView('login'); setIsMobileMenuOpen(false); }}
              className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl"
            >
              Access Portal
            </button>
          </div>
        </div>
      )}
    </>
  );
};
