
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { DollarSign, Calendar, Info, Clock } from 'lucide-react';

export const FeesAndTerm: React.FC = () => {
  const { settings, updateSettings, notify } = useStore();
  const [fees, setFees] = useState(settings?.feesAmount?.toString() || '');
  const [term, setTerm] = useState(settings?.currentTerm || '');
  const [termStart, setTermStart] = useState(settings?.nextTermStartDate || '');

  useEffect(() => {
    setFees(settings.feesAmount.toString());
    setTerm(settings.currentTerm);
    setTermStart(settings.nextTermStartDate || '');
  }, [settings]);

  const handleUpdate = (updates: any) => {
    updateSettings(updates);
  };

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-500 max-w-3xl">
      <header className="mb-10">
        <h3 className="text-xl font-bold text-ghText tracking-tight">Finances & Academic Calendar</h3>
        <p className="text-sm text-slate-500 mt-1">Set the standard tuition fees and school term dates.</p>
      </header>

      <div className="space-y-10">
        <section className="space-y-4">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Tuition Fees (Per Term)</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-50 text-emerald-600 rounded-md flex items-center justify-center border border-emerald-100">
               <DollarSign size={20} />
            </div>
            <input 
              type="number" 
              value={fees} 
              onChange={e => { setFees(e.target.value); handleUpdate({ feesAmount: parseFloat(e.target.value) || 0 }); }} 
              className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-ghBorder rounded-md text-2xl font-bold font-mono text-ghText outline-none focus:bg-white focus:ring-2 focus:ring-googleBlue/20 focus:border-googleBlue transition-all shadow-inner" 
            />
          </div>
          <p className="text-[10px] text-slate-400 italic px-1">This amount will be applied as the target for all student balances.</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <section className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Current School Term</label>
              <div className="relative">
                 <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="text" 
                   value={term} 
                   onChange={e => { setTerm(e.target.value); handleUpdate({ currentTerm: e.target.value }); }} 
                   placeholder="e.g. Term 1, 2025"
                   className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-ghBorder rounded-md text-sm font-bold text-ghText outline-none focus:bg-white focus:border-googleBlue transition-all" 
                 />
              </div>
           </section>

           <section className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Next Term Start Date</label>
              <div className="relative">
                 <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="date" 
                   value={termStart} 
                   onChange={e => { setTermStart(e.target.value); handleUpdate({ nextTermStartDate: e.target.value }); }} 
                   className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-ghBorder rounded-md text-sm font-bold text-ghText outline-none focus:bg-white focus:border-googleBlue transition-all" 
                 />
              </div>
           </section>
        </div>

        <div className="p-6 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-4">
           <Info size={18} className="text-googleBlue mt-0.5 shrink-0" />
           <p className="text-xs text-blue-700 leading-relaxed font-medium">
             <b>Note:</b> Updating the school term or start date will automatically post an announcement to the school wall for all parents and staff members to see.
           </p>
        </div>
      </div>
    </div>
  );
};
