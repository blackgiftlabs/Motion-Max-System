
import React from 'react';
import { PaymentRecord } from '../../types';

interface Props {
  totalPaid: number;
  balance: number;
  payments: PaymentRecord[];
  borderClass: string;
}

export const PaymentLedger: React.FC<Props> = ({ totalPaid, balance, payments, borderClass }) => (
  <div className="space-y-12 max-w-4xl animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className={`p-10 bg-emerald-50 dark:bg-emerald-900/10 border-2 ${borderClass} rounded-none text-center`}>
        <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white mb-4 tracking-widest">Education Paid</p>
        <p className="text-5xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tighter">${totalPaid}</p>
      </div>
      <div className={`p-10 bg-rose-50 dark:bg-rose-900/10 border-2 ${borderClass} rounded-none text-center`}>
        <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white mb-4 tracking-widest">Fees Arrears</p>
        <p className="text-5xl font-black text-rose-700 dark:text-rose-400 font-mono tracking-tighter">${balance}</p>
      </div>
    </div>
    
    <div className="space-y-6">
      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 border-b border-slate-100 pb-2">Billing Log</h3>
      <div className="bg-white dark:bg-slate-950 border-2 border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] font-black uppercase text-slate-900 dark:text-white">
            <tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Method</th><th className="px-6 py-4 text-right">Amount</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.length === 0 ? <tr><td colSpan={3} className="py-10 text-center text-[10px] font-bold text-slate-300 uppercase italic">No history logged</td></tr> : payments.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">{new Date(p.timestamp).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">{p.method}</td>
                <td className="px-6 py-4 text-right font-black text-emerald-600 font-mono">${p.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
