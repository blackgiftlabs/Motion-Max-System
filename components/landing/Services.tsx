
import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, HeartPulse, Database, Activity, Users, 
  Map, DollarSign, BookOpen, ShoppingBag, Calendar,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const ServicesIntroBg = "https://i.ibb.co/BVxPW4Ts/Gemini-Generated-Image-hrc3rvhrc3rvhrc3.png";

const ServiceCardSmall = ({ image, title, icon: Icon }: any) => (
  <div className="bg-white/5 border border-white/10 p-4 rounded-none flex flex-col gap-4 group hover:bg-white/10 transition-all animate-in fade-in slide-in-from-left duration-700">
    <div className="h-32 overflow-hidden relative border border-white/5">
       <img src={image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={title} />
       <div className="absolute top-2 right-2 p-2 bg-blue-600 text-white">
          <Icon size={16} />
       </div>
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-white leading-tight">{title}</span>
  </div>
);

const FullServiceCard = ({ image, title, desc, btnText, icon: Icon, delay }: any) => {
  return (
    <div 
      style={{ animationDelay: `${delay}ms` }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-sm hover:shadow-2xl transition-all duration-700 overflow-hidden flex flex-col h-full relative group animate-in fade-in slide-in-from-bottom-8"
    >
      <div className="h-[180px] overflow-hidden relative">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-white dark:bg-slate-800 rounded-none shadow-2xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-700 z-10">
           <Icon size={24} className="text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-black dark:text-white text-base font-black mb-3 tracking-tight leading-tight uppercase">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-[10px] mb-6 leading-relaxed font-medium italic">
          {desc}
        </p>
        <div className="mt-auto">
          <button className="bg-black dark:bg-blue-600 text-white px-4 py-2 rounded-none text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
            {btnText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Services: React.FC = () => {
  const { setView } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);

  const quickLinks = [
    { label: 'Take School Tour', icon: Map, color: 'bg-amber-600', action: () => setView('tour') },
    { label: 'Pay Fees Online', icon: DollarSign, color: 'bg-emerald-600', action: () => setView('login') },
    { label: 'School Catalog', icon: BookOpen, color: 'bg-indigo-600', action: () => {} },
    { label: 'Uniform Shop', icon: ShoppingBag, color: 'bg-blue-600', action: () => setView('shop') },
    { label: 'Upcoming Events', icon: Calendar, color: 'bg-rose-600', action: () => {} },
  ];

  useEffect(() => {
    if (isExpanded && expandedRef.current) {
      const timer = setTimeout(() => {
        expandedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  return (
    <section id="services" className="relative bg-white dark:bg-slate-950 overflow-visible z-10">
      <div className="relative min-h-[700px] flex items-center bg-slate-950 overflow-hidden py-24 z-10">
        <div className="absolute inset-0 z-0">
          <img src={ServicesIntroBg} alt="Background" className="w-full h-full object-cover grayscale opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 md:px-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="grid grid-cols-2 gap-4">
               <ServiceCardSmall 
                 title="Developing your child's skills" 
                 icon={Brain} 
                 image="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400"
               />
               <ServiceCardSmall 
                 title="Guided by our professional therapists" 
                 icon={Users} 
                 image="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400"
               />
               <div className="col-span-2 p-6 border border-white/10 bg-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                     <Activity className="text-blue-500" size={20} />
                     <span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Digital Progress Tracking</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                    Our system records and analyzes every session immediately. This ensures that every child’s progress is tracked with total precision and care.
                  </p>
               </div>
            </div>

            <div className="space-y-10">
              <header className="space-y-4">
                <h2 className="text-blue-400 text-[11px] font-black uppercase tracking-[0.4em]">What We Provide</h2>
                <h3 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85]">
                  Setting the <br /> Standard in <br /> <span className="text-blue-500">Clinical Care</span>
                </h3>
                <p className="text-sm md:text-lg text-white/70 font-medium leading-relaxed max-w-lg italic border-l-2 border-blue-600/30 pl-6">
                  We provide high-quality, individualized support backed by data. We carefully track every developmental milestone to provide the best clinical care for your child.
                </p>
              </header>
              
              <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="bg-white text-black px-12 py-6 rounded-none font-black uppercase tracking-widest shadow-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 group flex items-center gap-6"
              >
                {isExpanded ? 'Hide Extra Details' : 'Explore more services'} 
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div ref={expandedRef} className={`overflow-hidden transition-all duration-1000 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-slate-50 dark:bg-slate-900/40 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FullServiceCard 
                image="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
                title="Clinical Hub"
                desc="A centralized node for monitoring all developmental red flags and mastering steps."
                btnText="Enter Terminal"
                icon={Database}
                delay={0}
              />
              <FullServiceCard 
                image="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800"
                title="Parent Link"
                desc="Direct access to live progress reports and behavioral analysis summaries."
                btnText="Request Link"
                icon={Users}
                delay={100}
              />
              <FullServiceCard 
                image="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
                title="Milestone Sync"
                desc="Automated age-based assessments compared against global clinical benchmarks."
                btnText="Run assessment"
                icon={Activity}
                delay={200}
              />
              <FullServiceCard 
                image="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800"
                title="Speech Nodes"
                desc="Specialized communication training focusing on vocal play and syllable repetition."
                btnText="View programs"
                icon={Brain}
                delay={300}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-40 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800 py-0 overflow-visible h-24 flex items-center">
         <div className="max-w-[1600px] mx-auto w-full h-full flex items-center overflow-visible">
            <div className="flex flex-nowrap items-center justify-start overflow-x-auto no-scrollbar w-full h-full overflow-visible">
               {quickLinks.map((link, idx) => (
                 <button 
                  key={idx}
                  onClick={link.action}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`flex-1 whitespace-nowrap flex items-center justify-center gap-4 px-10 py-8 ${link.color} text-white rounded-none transition-all duration-500 ease-out group border-r border-white/10 last:border-0 h-full relative
                    ${hoveredIdx !== null && hoveredIdx !== idx ? 'blur-[4px] opacity-30 grayscale scale-95' : 'blur-0 opacity-100 grayscale-0'}
                    ${hoveredIdx === idx ? 'scale-110 z-50 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]' : 'z-10'}
                  `}
                 >
                    <link.icon size={20} className="group-hover:rotate-12 transition-transform duration-500" />
                    <span className="text-[11px] font-black uppercase tracking-widest">{link.label}</span>
                 </button>
               ))}
            </div>
         </div>
      </div>
    </section>
  );
};
