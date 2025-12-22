import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Header } from './Header';
import { Hero } from './Hero';
import { Services } from './Services';
import { Footer } from './Footer';
import { CareersPage } from './CareersPage';
import { UniformShop } from '../UniformShop';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { view, setView } = useStore();
  const shopSectionRef = useRef<HTMLDivElement>(null);
  const [isShopVisible, setIsShopVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsShopVisible(true);
      },
      { threshold: 0.2 }
    );
    if (shopSectionRef.current) observer.observe(shopSectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">
      <Header />
      <main>
        {view === 'landing' ? (
          <>
            <Hero />
            <Services />
            
            {/* Uniform Shop Preview Section with VT Staggering */}
            <section ref={shopSectionRef} className="py-32 md:py-48 px-6 bg-slate-950 overflow-hidden relative group">
               <div className="absolute inset-0 opacity-[0.03] bg-grid-pattern"></div>
               <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
                  <div className={`lg:w-1/2 space-y-10 text-center lg:text-left transition-all duration-1000 ${isShopVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/20">
                        <ShoppingBag size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Resource Node</span>
                     </div>
                     <h2 className="text-5xl md:text-9xl font-black uppercase tracking-tighter text-white leading-[0.8]">
                        Motion <br /> Max <span className="text-blue-500">Apparel</span>
                     </h2>
                     <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl italic">
                        "High-performance uniforms designed for therapeutic comfort and school identity. Access our digital node to manage student apparel requirements."
                     </p>
                     <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                        <button 
                          onClick={() => setView('shop')}
                          className="px-12 py-6 bg-white text-slate-900 rounded-none font-black uppercase tracking-widest shadow-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-4 group/btn active:scale-95"
                        >
                           Enter Shop Terminal <ArrowRight size={22} className="group-hover/btn:translate-x-3 transition-transform" />
                        </button>
                     </div>
                  </div>

                  <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                     <div className="space-y-4">
                        <div className={`h-64 rounded-[3rem] overflow-hidden shadow-2xl grayscale transition-all duration-1000 hover:grayscale-0 hover:scale-105 border-4 border-white/5 ${isShopVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '200ms' }}>
                           <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
                        </div>
                        <div className={`h-48 rounded-[3rem] overflow-hidden shadow-2xl translate-x-4 grayscale transition-all duration-1000 hover:grayscale-0 hover:scale-105 border-4 border-white/5 ${isShopVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '400ms' }}>
                           <img src="https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
                        </div>
                     </div>
                     <div className="space-y-4 pt-8">
                        <div className={`h-48 rounded-[3rem] overflow-hidden shadow-2xl -translate-x-4 grayscale transition-all duration-1000 hover:grayscale-0 hover:scale-105 border-4 border-white/5 ${isShopVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '600ms' }}>
                           <img src="https://images.unsplash.com/photo-1576566582414-b03882794c48?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
                        </div>
                        <div className={`h-64 rounded-[3rem] overflow-hidden shadow-2xl grayscale transition-all duration-1000 hover:grayscale-0 hover:scale-105 border-4 border-white/5 ${isShopVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '800ms' }}>
                           <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            <section id="story" className="py-24 md:py-40 bg-slate-50 dark:bg-slate-950 px-6 border-y border-slate-100 dark:border-slate-800">
              <div className="max-w-4xl mx-auto text-center space-y-12">
                <h2 className="text-brandNavy dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.6em]">Our Evolution</h2>
                <h3 className="text-4xl md:text-8xl font-black tracking-tighter uppercase dark:text-white leading-none">The Story</h3>
                <p className="text-2xl md:text-4xl text-slate-600 dark:text-slate-400 leading-relaxed font-semibold italic">
                  "Founded in 2019 by Kevin Muzangaza, Motion Max evolved from a small service to Zimbabwe's leading data-driven therapeutic node."
                </p>
                <div className="flex justify-center gap-1">
                   <div className="w-2 h-2 rounded-full bg-brandNavy"></div>
                   <div className="w-2 h-2 rounded-full bg-brandNavy/40"></div>
                   <div className="w-2 h-2 rounded-full bg-brandNavy/20"></div>
                </div>
              </div>
            </section>
          </>
        ) : view === 'careers' ? (
          <CareersPage />
        ) : view === 'shop' ? (
          <div className="max-w-7xl mx-auto pt-40 pb-32">
             <UniformShop />
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};
