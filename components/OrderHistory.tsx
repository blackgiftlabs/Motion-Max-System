
import React from 'react';
import { useStore } from '../store/useStore';
import { Receipt, Package, CheckCircle2, Clock, Calendar, DollarSign, ChevronRight } from 'lucide-react';

export const OrderHistory: React.FC = () => {
  const { user, orders, students, parents } = useStore();

  const linkedStudent = React.useMemo(() => {
    if (user?.role === 'STUDENT') return students.find(s => s.firebaseUid === user.id);
    if (user?.role === 'PARENT') {
      const parent = parents.find(p => p.firebaseUid === user.id);
      return parent ? students.find(s => s.id === parent.studentId) : null;
    }
    return null;
  }, [user, students, parents]);

  const studentOrders = React.useMemo(() => 
    (orders || []).filter(o => o.studentId === linkedStudent?.id),
    [orders, linkedStudent]
  );

  return (
    <div className="space-y-1 animate-in fade-in duration-500 pb-10 max-w-5xl mx-auto selection:bg-blue-100">
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-none flex items-center gap-4">
        <div className="p-2.5 bg-blue-600 text-white">
          <Receipt size={20} />
        </div>
        <div>
          <h1 className="text-lg font-black uppercase text-slate-900 dark:text-white leading-none tracking-tight">Order Audit</h1>
          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Inventory Procurement History</p>
        </div>
      </header>

      <div className="space-y-1">
        {studentOrders.length === 0 ? (
          <div className="py-32 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none">
             <Package size={48} className="mx-auto text-slate-100 mb-4 opacity-50" />
             <p className="text-[9px] font-black uppercase text-slate-300 italic tracking-widest">No procurement nodes recorded.</p>
          </div>
        ) : studentOrders.map(order => (
          <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-5 group hover:border-blue-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
             <div className="flex items-center gap-5">
                <div className={`p-3 rounded-none ${order.status === 'Collected' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                   {order.status === 'Collected' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                </div>
                <div>
                   <h3 className="text-sm font-black uppercase dark:text-white leading-none mb-1.5">TX_NODE #{order.id.substring(0,8).toUpperCase()}</h3>
                   <div className="flex items-center gap-3 text-[9px] font-mono font-bold text-slate-400 uppercase">
                      <span>{new Date(order.timestamp).toLocaleDateString()}</span>
                      <span className="opacity-30">|</span>
                      <span>{order.paymentMethod}</span>
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-10">
                <div className="text-right">
                   <p className="text-[8px] font-black uppercase text-slate-400 mb-1">TX Value</p>
                   <p className="text-lg font-black font-mono text-blue-600">${order.total}</p>
                </div>
                <div className={`px-4 py-2 border text-[9px] font-black uppercase tracking-widest ${order.status === 'Collected' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                   {order.status}
                </div>
                <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-600 transition-all" />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
