import React, { useState, useEffect, useRef } from 'react';
import { Brain, HeartPulse, Database, Activity, Users, PlusCircle, ArrowRight } from 'lucide-react';

const ServicesIntroBg = "https://i.ibb.co/BVxPW4Ts/Gemini-Generated-Image-hrc3rvhrc3rvhrc3.png";

const ServiceCard = ({ image, title, desc, btnText, icon: Icon, delay }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden flex flex-col h-full relative group vt-reveal ${isVisible ? 'visible' : ''}`}
    >
      <div className="h-[280px] overflow-hidden relative">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute -bottom-8 right-8 w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex items-center justify-center p-5 border border-slate-100 dark:border-slate-700 z-10 transition-transform group-hover:-translate-y-2">
           <div className="relative w-full h-full flex items-center justify-center text-brandNavy dark:text-blue-400">
              <Icon size={48} className="group-hover:rotate-12 transition-transform" />
              <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500"></div>
           </div>
        </div>
      </div>
      <div className="p-10 pt-12 flex flex-col flex-1">
        <h3 className="text-brandNavy dark:text-blue-400 text-2xl font-black mb-6 tracking-tight leading-tight group-hover:translate-x-1 transition-transform uppercase">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-base mb-10 leading-relaxed font-medium italic">
          {desc}
        </p>
        <div className="mt-auto">
          <button className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:bg-blue-600 transition-all active:scale-95">
            {btnText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Services: React.FC = () => {
  const introRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!introRef.current) return;
      
      const rect = introRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const entryPoint = windowHeight;
      const targetPoint = windowHeight / 2;
      const currentPos = rect.top;
      
      const progress = Math.min(Math.max((entryPoint - currentPos) / (entryPoint - targetPoint), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const leftTranslate = (1 - scrollProgress) * -100;
  const rightTranslate = (1 - scrollProgress) * 100;
  const contentOpacity = scrollProgress;

  return (
    <section id="services" className="relative bg-white dark:bg-slate-950 overflow-hidden z-10">
      {/* Intro Section */}
      <div 
        ref={introRef}
        className="relative min-h-[700px] md:min-h-[850px] flex items-center bg-slate-900 dark:bg-slate-950 overflow-hidden"
      >
        <div 
          className="absolute inset-0 z-0 transition-transform duration-500 ease-out"
          style={{ 
            transform: `translateX(${leftTranslate}%)`,
            width: '100%',
            height: '100%'
          }}
        >
          <img 
            src={ServicesIntroBg} 
            alt="Intro Background" 
            className="w-full h-full object-cover grayscale opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 md:px-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="hidden lg:block"></div>
            
            <div 
              className="flex flex-col justify-center space-y-10 transition-all duration-700 ease-out"
              style={{ 
                transform: `translateX(${rightTranslate}%)`,
                opacity: contentOpacity
              }}
            >
              <header className="space-y-4">
                <h2 className="text-blue-400 text-sm font-black uppercase tracking-[0.6em]">
                  Registry Services
                </h2>
                <h3 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.8]">
                  Clinical <br /> Excellence <br /> <span className="text-blue-500">Redefined</span>
                </h3>
              </header>
              
              <div className="w-24 h-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              
              <p className="text-lg md:text-2xl text-white/80 font-medium leading-relaxed max-w-xl italic">
                MotionMax provides high-quality, data-driven individualized support. 
                Our nodes track every developmental milestone with clinical precision.
              </p>
              
              <div className="flex gap-4 pt-4">
                 <button 
                  onClick={() => document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="bg-white text-slate-900 px-10 py-5 rounded-none font-black uppercase tracking-widest shadow-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 group flex items-center gap-4"
                 >
                   Explore Programs <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Service Containers with VT Reveal */}
      <div id="capabilities" className="bg-slate-50 dark:bg-slate-900/40 py-24 md:py-40 px-6 relative border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-brandNavy dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.6em]">Specialized Nodes</h2>
            <h3 className="text-3xl md:text-7xl font-black uppercase tracking-tighter dark:text-white">Core Capabilities</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
            <ServiceCard 
              image="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800"
              title="ABA Therapy"
              desc="Empowering individuals through the ABC model of behavior, creating precise Intervention Plans for measurable outcomes."
              btnText="Terminal access"
              icon={Brain}
              delay={0}
            />
            <ServiceCard 
              image="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800"
              title="One-to-One Basis"
              desc="Maintaining a strict ratio of one trained specialist per child for maximum progress tracking and specialized attention."
              btnText="Join faculty"
              icon={Users}
              delay={150}
            />
            <ServiceCard 
              image="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800"
              title="Database Growth"
              desc="Zimbabwe's only organization using a digital registry to track session scores, mastery levels, and independence."
              btnText="View logs"
              icon={Database}
              delay={300}
            />
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Therapeutic Arts', icon: <PlusCircle size={18} /> },
              { label: 'Animal Therapy', icon: <PlusCircle size={18} /> },
              { label: 'Sensory Calibration', icon: <PlusCircle size={18} /> }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between group cursor-default hover:border-blue-500 transition-all shadow-sm">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors">{item.label}</span>
                <div className="text-blue-500 group-hover:scale-125 transition-transform">{item.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};