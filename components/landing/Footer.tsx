import React from 'react';
import { MapPin, Phone, Mail, Instagram, Linkedin, Twitter, Globe, ShieldCheck, Heart } from 'lucide-react';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-white dark:bg-slate-950 pt-32 pb-12 px-6 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-8">
            <div className="flex items-center gap-3">
              <img src={LogoImg} alt="Motion Max Logo" className="h-12 w-auto" />
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter leading-none uppercase text-slate-900 dark:text-white">Motion Max</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400 mt-1">Day Services</span>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed font-medium">
              Helping kids with autism learn and grow since 2019. We use modern tools to track progress and provide the best care in Zimbabwe.
            </p>
            <div className="flex gap-4">
              {[Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-500 hover:shadow-xl transition-all"
                  aria-label="Social Media Link"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div className="space-y-10">
            <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-4 h-px bg-blue-600"></span> Talk to Us
            </h5>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                  <MapPin size={20} />
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                  27 Colnebrook Lane, <br />Harare, Zimbabwe
                </span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                  <Phone size={20} />
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  +263 775 926 454
                </span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                  <Mail size={20} />
                </div>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  admin@motionmax.co.zw
                </span>
              </li>
            </ul>
          </div>

          {/* Navigation Column */}
          <div className="space-y-10">
            <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-4 h-px bg-blue-600"></span> Useful Links
            </h5>
            <ul className="space-y-4">
              {['Home', 'Our Services', 'The Story', 'Join Our Team', 'Uniform Shop'].map(link => (
                <li key={link}>
                  <a href="#" className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-all uppercase tracking-widest">
                    <span className="w-0 h-0.5 bg-blue-600 transition-all group-hover:w-3"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* System Status Column - Innovative Element */}
          <div className="space-y-10">
            <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-4 h-px bg-blue-600"></span> Portal Status
            </h5>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Online</span>
                  </div>
                  <Globe size={14} className="text-slate-300" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mastery Sync</span>
                    <span className="text-[11px] font-black text-blue-600 font-mono">99.8%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-[99.8%] rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-tight">
                    <ShieldCheck size={12} className="text-blue-500" /> Secure Data
                  </div>
                  <span className="text-[8px] font-mono text-slate-300 uppercase">HRE-NODE-01</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            <Heart size={14} className="text-rose-500 fill-rose-500" /> 
            Made for children in Harare
          </div>
          
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            &copy; {new Date().getFullYear()} MOTION MAX • ALL RIGHTS RESERVED
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};