
import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, DollarSign, Calendar, User, Hash, Globe, BadgeCheck } from 'lucide-react';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const ReceiptVerification: React.FC = () => {
  const { payments, setView } = useStore();
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = params.get('v');
    
    if (hash) {
      // Find the payment with this hash
      const found = payments.find(p => p.verificationHash === hash);
      if (found) {
        setReceipt(found);
      }
    }
    setLoading(false);
  }, [payments]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse">VERIFYING NODE...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-10 animate-in fade-in duration-700">
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-slate-100 dark:border-slate-800 pb-8">
           <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setView('landing')}>
              <img src={LogoImg} alt="M" className="h-14 w-auto transition-transform group-hover:rotate-12" />
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter leading-none uppercase">Motion Max</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mt-1">Verification Node</span>
              </div>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full border-2 border-emerald-100 dark:border-emerald-800">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Official Record</span>
           </div>
        </header>

        {!receipt ? (
          <div className="py-32 text-center space-y-8 bg-rose-50 dark:bg-rose-900/10 rounded-[3rem] border-4 border-dashed border-rose-100 dark:border-rose-800 animate-in zoom-in">
             <AlertCircle size={80} className="mx-auto text-rose-500" />
             <div>
                <h2 className="text-3xl font-black uppercase text-rose-600 tracking-tight leading-none">Security Alert</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-4 max-w-sm mx-auto">
                  This verification hash does not match any official Motion Max registry records. Please contact support.
                </p>
             </div>
             <button onClick={() => setView('landing')} className="px-10 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Return to Home</button>
          </div>
        ) : (
          <div className="space-y-8">
             {/* Authenticity Banner */}
             <div className="bg-emerald-50 dark:bg-emerald-900/10 border-4 border-emerald-100 dark:border-emerald-800 rounded-[3rem] p-10 flex flex-col items-center text-center space-y-6 relative overflow-hidden shadow-2xl">
                <BadgeCheck className="absolute -right-12 -bottom-12 text-emerald-100 dark:text-emerald-900/20" size={300} />
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl ring-8 ring-emerald-50 dark:ring-emerald-900/50 relative z-10">
                   <CheckCircle2 size={48} />
                </div>
                <div className="relative z-10">
                   <h2 className="text-4xl font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-tighter leading-none">Verified Authentic</h2>
                   <p className="text-emerald-600/70 dark:text-emerald-500 font-bold mt-4 uppercase tracking-[0.3em] text-[11px]">Secure Ledger Entry Detected</p>
                </div>
             </div>

             {/* Details Matrix */}
             <div className="bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 rounded-[3.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                   <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Registry Details</h3>
                   <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase">Hash: {receipt.verificationHash.slice(0,16)}</span>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <div className="flex items-center gap-5">
                         <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><User size={24}/></div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Student Node</p>
                            <p className="text-xl font-black uppercase tracking-tight">{receipt.studentName}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-5">
                         <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl"><DollarSign size={24}/></div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Transaction Value</p>
                            <p className="text-4xl font-black font-mono text-emerald-600">${receipt.amount.toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="flex items-center gap-5">
                         <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl"><Calendar size={24}/></div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Timestamp</p>
                            <p className="text-base font-black uppercase tracking-tight">{new Date(receipt.timestamp).toLocaleString()}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-5">
                         <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><Globe size={24}/></div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Payment Hub</p>
                            <p className="text-base font-black uppercase tracking-tight">{receipt.method}</p>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t-2 border-slate-50 dark:border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Server Match</span>
                   </div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Motion Max Secure Terminal v3.1</p>
                </div>
             </div>

             <footer className="text-center pt-8">
                <button 
                  onClick={() => setView('landing')}
                  className="px-12 py-5 bg-black dark:bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto active:scale-95"
                >
                   <ArrowLeft size={16}/> Access Main Terminal
                </button>
             </footer>
          </div>
        )}
      </div>
    </div>
  );
};
