
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { DollarSign, Calendar, Info } from 'lucide-react';

export const FeesAndTerm: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [fees, setFees] = useState(settings?.feesAmount?.toString() || '');
  const [term, setTerm] = useState(settings?.currentTerm || '');
  const [termStart, setTermStart] = useState(settings?.nextTermStartDate || '');
  const borderStyle = "border-[#154A70] dark:border-[#9DB6BF]";

  useEffect(() => {
    setFees(settings.feesAmount.toString());
    setTerm(settings.currentTerm);
    setTermStart(settings.nextTermStartDate || '');
  }, [settings]);

  const handleUpdate = (updates: any) => {
    updateSettings(updates);
  };

  return (
    <div className="p-6 md:p-16 max-w-2xl animate-in fade-in duration-500 space-y-12">
      <div className="space-y-10">
        <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight">School Fees & Terms</h3>
        <div className="space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white ml-1">Standard Fees Amount ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-[#154A70]" size={24} />
              <input 
                type="number" 
                value={fees} 
                onChange={e => { setFees(e.target.value); handleUpdate({ feesAmount: parseFloat(e.target.value) || 0 }); }} 
                className={`w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-slate-950 border-2 ${borderStyle} rounded-none text-4xl font-black font-mono text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner`} 
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white ml-1">Current Term Name</label>
            <input 
              type="text" 
              value={term} 
              onChange={e => { setTerm(e.target.value); handleUpdate({ currentTerm: e.target.value }); }} 
              className={`w-full px-8 py-6 bg-slate-50 dark:bg-slate-950 border-2 ${borderStyle} rounded-none text-2xl font-black uppercase tracking-tight text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner`} 
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white ml-1">Next Term Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#154A70]" size={24} />
              <input 
                type="date" 
                value={termStart} 
                onChange={e => { setTermStart(e.target.value); handleUpdate({ nextTermStartDate: e.target.value }); }} 
                className={`w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-slate-950 border-2 ${borderStyle} rounded-none text-2xl font-black text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner`} 
              />
            </div>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest px-1">Note: Changing this will automatically post a school-wide notice.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
