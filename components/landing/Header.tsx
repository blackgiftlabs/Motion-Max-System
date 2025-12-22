
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Menu, X, Sun, Moon, ShoppingCart } from 'lucide-react';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const Header: React.FC = () => {
  const { setView, theme, toggleTheme, view, cart } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const servicesSection = document.getElementById('services');
      const storySection = document.getElementById('story');
      const contactSection = document.getElementById('contact');
      
      const scrollPos = window.scrollY + 150;

      if (contactSection && scrollPos >= contactSection.offsetTop) {
        setActiveSection('contact');
      } else if (storySection && scrollPos >= storySection.offsetTop) {
        setActiveSection('story');
      } else if (servicesSection && scrollPos >= servicesSection.offsetTop) {
        setActiveSection('services');
      } else {
        setActiveSection('home');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const BrandLogo = () => (
    <div className="flex items-center gap-3 group cursor-pointer" style={{ paddingLeft: '20px' }} onClick={() => setView('landing')}>
      <img src={LogoImg} alt="Motion Max" className="h-10 md:h-12 w-auto transition-transform group-hover:scale-110" />
      <div className="flex flex-col justify-center">
        <span className="font-black text-xl md:text-2xl tracking-tighter text-slate-900 dark:text-white leading-none">MOTION MAX</span>
        <span className="text-[8px] md:text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block tracking-[0.4em] mt-1">Day Services</span>
      </div>
    </div>
  );

  const navLinks = [
    { label: 'Home', id: 'home', href: '#', type: 'scroll' },
    { label: 'Services', id: 'services', href: '#services', type: 'scroll' },
    { label: 'Uniforms', id: 'shop', href: 'shop', type: 'view' },
    { label: 'Careers', id: 'careers', href: 'careers', type: 'view' },
    { label: 'About Us', id: 'story', href: '#story', type: 'scroll' },
    { label: 'Contact', id: 'contact', href: '#contact', type: 'scroll' },
  ];

  const handleNavClick = (link: any) => {
    if (link.type === 'view') {
      setView(link.id);
    } else {
      if (view !== 'landing') {
        setView('landing');
        setTimeout(() => {
          document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 md:h-20 transition-all duration-300">
        <div className="w-full h-full flex items-center justify-between">
          <BrandLogo />
          
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map(link => (
              <button 
                key={link.id} 
                onClick={() => handleNavClick(link)}
                className={`text-[12px] font-black uppercase tracking-[0.15em] transition-all duration-300 transform ${
                  (link.type === 'scroll' && activeSection === link.id) || (link.type === 'view' && view === link.id)
                  ? 'text-brandNavy scale-110 border-b-2 border-brandNavy' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-brandNavy'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4 pr-5">
            <button 
              onClick={() => setView('shop')}
              className="relative p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
            >
              <ShoppingCart id="common-header-cart" size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                  {cart.length}
                </span>
              )}
            </button>
            <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {theme === 'light' ? <Moon size={20} className="text-slate-600" /> : <Sun size={20} className="text-slate-300" />}
            </button>
            <button 
              onClick={() => setView('login')}
              className="hidden sm:block min-w-[200px] bg-brandNavy text-white px-6 py-3 rounded-none text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 water-fill"
            >
              Login into Portal
            </button>
            <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 lg:hidden animate-in fade-in duration-300">
          <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-3">
                <img src={LogoImg} alt="M" className="h-10 w-auto" />
                <span className="font-black text-xl tracking-tighter">MOTION MAX</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-900 dark:text-white"><X size={32} /></button>
            </div>
            <div className="flex flex-col gap-8">
              {navLinks.map(link => (
                <button 
                  key={link.id} 
                  onClick={() => handleNavClick(link)}
                  className="text-4xl font-black uppercase tracking-tight text-left text-slate-900 dark:text-white"
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="mt-auto pb-12">
              <button 
                onClick={() => setView('login')}
                className="w-full bg-brandNavy text-white py-6 text-xl font-black uppercase tracking-widest shadow-2xl"
              >
                Login into Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
