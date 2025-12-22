
import React from 'react';
import { MapPin, Phone, Mail, Instagram, Linkedin, Twitter } from 'lucide-react';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-slate-50 dark:bg-slate-950 pt-32 pb-12 px-6 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="lg:col-span-1 space-y-8">
            <div className="flex items-center gap-3">
              <img src={LogoImg} alt="M" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter leading-none uppercase">Motion Max</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-400 mt-1">Day Services</span>
              </div>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed">
              Pioneering database-driven autism therapy in Zimbabwe since 2019. Dedicated to holistic growth and clinical excellence.
            </p>
            <div className="flex gap-4">
              {[Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-500 transition-all shadow-sm">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h5 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Contact Terminal</h5>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin size={20} className="text-blue-600 flex-shrink-0" />
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">27 Colnebrook Lane, Harare, Zimbabwe</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={20} className="text-blue-600 flex-shrink-0" />
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">+263 775 926 454</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail size={20} className="text-blue-600 flex-shrink-0" />
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">admin@motionmax.co.zw</span>
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            <h5 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Quick Nodes</h5>
            <ul className="space-y-4">
              {['Home', 'Services', 'Our Story', 'Faculty', 'Uniform Shop'].map(link => (
                <li key={link}>
                  <a href="#" className="text-sm font-bold text-slate-500 hover:text-blue-600 uppercase tracking-widest transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h5 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Operational Status</h5>
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner">
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Node</span>
               </div>
               <p className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-tight">Version: stable-3.1.4_HRE</p>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
            &copy; {new Date().getFullYear()} MOTION MAX // BRANCH: HARARE MAIN // ALL DATA ENCRYPTED
          </p>
        </div>
      </div>
    </footer>
  );
};
