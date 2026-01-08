
import React from 'react';
import { Phone, Mail, Instagram, Linkedin, Twitter, MapPin, Heart, ArrowRight, Globe, Command } from 'lucide-react';
import { useStore } from '../../store/useStore';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const Footer: React.FC = () => {
  const { setView } = useStore();

  return (
    <footer id="contact" className="bg-white dark:bg-slate-950 pt-24 relative overflow-hidden">
      {/* Top Branding Section - Inspired by the Banner Image */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
          
          {/* Left: Identity Block */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-blue-600 font-black text-5xl md:text-6xl uppercase tracking-tighter leading-none">
                Motion Max
              </h2>
              <p className="text-slate-900 dark:text-white font-bold text-xl md:text-2xl uppercase tracking-tight">
                Behavioral Specialist
              </p>
            </div>
            <div className="w-48 h-1 bg-slate-100 dark:bg-slate-800"></div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
              Individualized support for neurodiverse children. <br />
              Setting the standard in clinical excellence across Zimbabwe since 2019.
            </p>
          </div>

          {/* Center: Brand Arc / Photo Style Visual */}
          <div className="flex justify-center relative py-10">
            <div className="relative w-48 h-48 md:w-56 md:h-56">
               {/* Decorative Arc like the Green one in the image */}
               <div className="absolute inset-0 border-[12px] border-blue-600 rounded-full clip-path-arc rotate-[45deg]"></div>
               <div className="absolute inset-2 border-[1px] border-slate-200 dark:border-slate-800 rounded-full"></div>
               
               {/* Main Logo Container */}
               <div className="absolute inset-6 bg-white dark:bg-slate-900 rounded-full shadow-2xl flex items-center justify-center p-8 border border-slate-100 dark:border-slate-800">
                  <img src={LogoImg} alt="Brand" className="w-full h-auto" />
               </div>
            </div>
            
            <style>{`
              .clip-path-arc {
                clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%, 50% 50%);
              }
            `}</style>
          </div>

          {/* Right: Connection Hub */}
          <div className="flex flex-col lg:items-end space-y-10">
            {/* Social Matrix */}
            <div className="flex gap-3">
              {[Twitter, Instagram, Linkedin, Globe].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-all shadow-lg active:scale-90"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>

            {/* Contact Stack */}
            <div className="space-y-6 lg:text-right w-full">
              <div className="flex lg:flex-row-reverse items-center gap-4 group cursor-default">
                 <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-blue-600 border border-slate-100 dark:border-slate-800">
                    <Mail size={14} />
                 </div>
                 <span className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">admin@motionmax.co.zw</span>
              </div>
              <div className="flex lg:flex-row-reverse items-center gap-4 group cursor-default">
                 <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-blue-600 border border-slate-100 dark:border-slate-800">
                    <Phone size={14} />
                 </div>
                 <span className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">+263 775 926 454</span>
              </div>
              <div className="flex lg:flex-row-reverse items-center gap-4 group cursor-default">
                 <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-blue-600 border border-slate-100 dark:border-slate-800">
                    <MapPin size={14} />
                 </div>
                 <span className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">27 Colnebrook Lane, Harare</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Decorative Bottom Wave / Geometric Slash - Matches the Image style */}
      <div className="relative h-24 overflow-visible">
         {/* Background shape - Dark Blue for all themes to contrast with main content */}
         <div className="absolute inset-0 bg-[#002D50] z-0"></div>
         <div className="absolute top-0 left-0 w-full h-24 bg-white dark:bg-slate-950 -translate-y-12 rotate-[1.5deg] scale-110 shadow-sm z-0"></div>
         
         <div className="relative z-10 max-w-[1600px] mx-auto h-full px-12 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">© {new Date().getFullYear()} Motion Max Registry</span>
            </div>
            
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setView('login')} 
                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md active:scale-95 flex items-center gap-2"
               >
                 Access Portal <ArrowRight size={14} />
               </button>
               <button 
                onClick={() => window.scrollTo({top:0, behavior:'smooth'})} 
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2"
               >
                 Jump to Top <Command size={12} />
               </button>
            </div>
         </div>
      </div>
    </footer>
  );
};
