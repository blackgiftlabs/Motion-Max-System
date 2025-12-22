
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
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
            <Receipt size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Purchase Records</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight uppercase dark:text-white leading-none">Order History</h1>
        <p className="text-sm text-slate-500 font-medium mt-3 italic">View your past uniform purchases and their collection status.</p>
      </header>

      <div className="space-y-6">
        {studentOrders.length === 0 ? (
          <div className="py-32 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
             <Package size={48} className="mx-auto text-slate-300 mb-4" />
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">No orders found for this account.</p>
          </div>
        ) : studentOrders.map(order => (
          <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group">
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${order.status === 'Collected' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'}`}>
                      {order.status === 'Collected' ? <CheckCircle2 size={28} /> : <Clock size={28} />}
                   </div>
                   <div>
                      <h3 className="font-black text-lg dark:text-white uppercase tracking-tight leading-none mb-2">Order #{order.id.substring(0,8).toUpperCase()}</h3>
                      <div className="flex flex-wrap gap-4">
                         <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                            <Calendar size={12} /> {new Date(order.timestamp).toLocaleDateString()}
                         </div>
                         <div className="flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                            <DollarSign size={12} /> {order.paymentMethod}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex flex-wrap items-center gap-8 lg:border-l border-slate-100 dark:border-slate-800 lg:pl-8">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Items</p>
                      <p className="text-xs font-black dark:text-white uppercase">{order.items.length} Products</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Price</p>
                      <p className="text-xl font-black text-blue-600 font-mono">${order.total}</p>
                   </div>
                   <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${order.status === 'Collected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {order.status}
                   </div>
                </div>
             </div>
             
             {/* Expansion preview for items */}
             <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                     <div className="h-20 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                        <img src={item.imageUrl} className="w-full h-full object-cover" />
                     </div>
                     <p className="text-[8px] font-black uppercase tracking-tight truncate leading-none">{item.name}</p>
                     <p className="text-[8px] font-bold text-slate-400">QTY: {item.quantity}</p>
                  </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
