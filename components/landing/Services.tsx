
import React, { useState, useEffect, useRef } from 'react';
import { Brain, HeartPulse, Database, Activity, Users, PlusCircle, ArrowRight } from 'lucide-react';

const ServicesIntroBg = "https://i.ibb.co/BVxPW4Ts/Gemini-Generated-Image-hrc3rvhrc3rvhrc3.png";

const ServiceCard = ({ image, title, desc, btnText, icon: Icon }: any) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full relative group">
    <div className="h-[260px] overflow-hidden relative">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute -bottom-8 right-8 w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex items-center justify-center p-5 border border-slate-100 dark:border-slate-700 z-10 transition-transform group-hover:-translate-y-2">
         <div className="relative w-full h-full flex items-center justify-center text-brandNavy">
            <Icon size={48} className="group-hover:rotate-12 transition-transform" />
            <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500"></div>
         </div>
      </div>
    </div>
    <div className="p-10 pt-12 flex flex-col flex-1">
      <h3 className="text-brandNavy dark:text-blue-400 text-2xl font-bold mb-6 tracking-tight leading-tight group-hover:translate-x-1 transition-transform">
        {title}
      </h3>
      <p className="text-slate-700 dark:text-slate-300 text-base mb-10 leading-relaxed font-medium">
        {desc}
      </p>
      <div className="mt-auto">
        <button className="bg-brandNavy text-white px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:shadow-lg hover:bg-navy transition-all active:scale-95">
          {btnText}
        </button>
      </div>
    </div>
  </div>
);

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
    <section id="services" className="relative bg-white dark:bg-slate-950 overflow-hidden">
      {/* Intro Section: Split View Layout with Image as Background */}
      <div 
        ref={introRef}
        className="relative min-h-[700px] md:min-h-[900px] flex items-center bg-slate-900 dark:bg-slate-950 overflow-hidden"
      >
        {/* Background Image Layer (Sliding from Left) */}
        <div 
          className="absolute inset-0 z-0 transition-transform duration-300 ease-out"
          style={{ 
            transform: `translateX(${leftTranslate}%)`,
            width: '100%',
            height: '100%'
          }}
        >
          <img 
            src={ServicesIntroBg} 
            alt="Intro Background" 
            className="w-full h-full object-cover" 
          />
          {/* Overlay adjusted to be dark in both modes for white text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 md:px-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="hidden lg:block"></div>
            
            {/* Content Column (Sliding from Right) */}
            <div 
              className="flex flex-col justify-center space-y-8 transition-all duration-500 ease-out"
              style={{ 
                transform: `translateX(${rightTranslate}%)`,
                opacity: contentOpacity
              }}
            >
              <header className="space-y-4">
                <h2 className="text-blue-400 text-sm font-black uppercase tracking-[0.5em]">
                  Service Infrastructure
                </h2>
                <h3 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85]">
                  Clinical <br /> Excellence <br /> Redefined
                </h3>
              </header>
              
              <div className="w-24 h-3 bg-blue-400 rounded-full"></div>
              
              <p className="text-lg md:text-2xl text-white/90 font-medium leading-relaxed max-w-xl italic">
                MotionMax Day Services provides high-quality, individualized support for children with autism. 
                Our platform tracks every session score, ensuring data-driven progress.
              </p>
              
              <div className="flex gap-4 pt-4">
                 <button 
                  onClick={() => document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="bg-white text-slate-900 px-10 py-5 rounded-none font-black uppercase tracking-widest shadow-2xl hover:bg-blue-50 transition-all active:scale-95 group flex items-center gap-4"
                 >
                   Explore Programs <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Service Containers */}
      <div id="capabilities" className="bg-slate-50 dark:bg-slate-900/40 py-24 md:py-40 px-6 bg-grid-pattern relative border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-brandNavy dark:text-blue-400 text-xs font-black uppercase tracking-[0.5em]">Specialized Nodes</h2>
            <h3 className="text-3xl md:text-6xl font-black uppercase tracking-tighter dark:text-white">Core Capabilities</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
            <ServiceCard 
              image="https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&q=80&w=800"
              title="Applied Behavior Analysis"
              desc="Accelerators empower individuals through the ABC model of behavior, creating precise Intervention Plans (BIPs) for measurable developmental outcomes."
              btnText="Learn more"
              icon={Brain}
            />
            <ServiceCard 
              image="https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&q=80&w=800"
              title="One-to-One Basis"
              desc="Grow your knowledge through specialized attention. We maintain a strict ratio of one trained therapist per child for maximum progress tracking."
              btnText="View events"
              icon={Users}
            />
            <ServiceCard 
              image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
              title="Database-Driven Growth"
              desc="Join a community where data speaks. We are Zimbabwe's only organization using a digital node to track session scores and independence levels."
              btnText="Explore communities"
              icon={Database}
            />
          </div>

          {/* Additional Features Bar */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Therapeutic Arts', icon: <PlusCircle size={20} /> },
              { label: 'Animal Therapy', icon: <PlusCircle size={20} /> },
              { label: 'Sensory Calibration', icon: <PlusCircle size={20} /> }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group cursor-default hover:border-brandNavy transition-colors">
                <span className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-brandNavy transition-colors">{item.label}</span>
                <div className="text-brandNavy">{item.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
