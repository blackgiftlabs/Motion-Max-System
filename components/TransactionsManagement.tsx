
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Receipt, Search, Filter, CheckCircle2, Clock, User, Package, ChevronRight, X, Calendar, DollarSign } from 'lucide-react';
import { Order } from '../types';

export const TransactionsManagement: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'Uncollected' | 'Collected'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || o.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
              <Receipt size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Fulfillment Node</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase dark:text-white leading-none">Order Transactions</h1>
          <p className="text-sm text-slate-500 font-medium mt-3">Verify payments and track uniform collection status.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group min-w-[300px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
            <input 
              type="text" 
              placeholder="Search by student or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none" 
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none"
          >
            <option value="All">All Status</option>
            <option value="Uncollected">Uncollected</option>
            <option value="Collected">Collected</option>
          </select>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">Student / ID</th>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Fulfillment</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest italic">No transactions found in database.</td></tr>
              ) : filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group" onClick={() => setSelectedOrder(order)}>
                  <td className="px-8 py-6 font-mono text-[10px] font-bold text-slate-400">#{order.id.substring(0,8).toUpperCase()}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-black text-xs uppercase">{order.studentName[0]}</div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">{order.studentName}</p>
                        <p className="text-[9px] font-mono text-slate-400 mt-1">{order.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-medium text-slate-500">{new Date(order.timestamp).toLocaleString()}</td>
                  <td className="px-8 py-6 font-black text-blue-600 dark:text-blue-400 font-mono">${order.total}</td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${order.status === 'Collected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[400] flex justify-end">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
           <aside className="relative w-full md:w-[60%] lg:w-[45%] bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
              <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-950 z-10">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-[#002D50] text-white flex items-center justify-center text-2xl font-black">{selectedOrder.studentName[0]}</div>
                    <div>
                       <h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-none">Order Summary</h2>
                       <p className="text-[10px] font-mono text-slate-400 mt-2 uppercase">TX_ID: {selectedOrder.id}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl"><X size={24} /></button>
              </header>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                 <section className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Technical Assets Purchased</h3>
                    <div className="space-y-4">
                       {selectedOrder.items.map((item, idx) => (
                         <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group">
                            <div className="flex items-center gap-4">
                               <img src={item.imageUrl} className="w-14 h-14 rounded-xl object-cover shadow-md" />
                               <div>
                                  <p className="text-xs font-black uppercase tracking-tight">{item.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">QTY: {item.quantity}</p>
                               </div>
                            </div>
                            <span className="font-mono font-bold text-sm text-slate-600">${item.price * item.quantity}</span>
                         </div>
                       ))}
                    </div>
                 </section>

                 <section className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400 mb-2">Payment Method</p>
                       <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-emerald-500" />
                          <span className="text-xs font-black uppercase">{selectedOrder.paymentMethod}</span>
                       </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400 mb-2">Collection Node</p>
                       <div className="flex items-center gap-2">
                          <Package size={14} className="text-blue-500" />
                          <span className="text-xs font-black uppercase">{selectedOrder.status}</span>
                       </div>
                    </div>
                 </section>
              </div>

              <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col gap-4">
                 <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-xs font-black uppercase text-slate-500">Transaction Total</span>
                    <span className="text-2xl font-black font-mono text-blue-600">${selectedOrder.total}</span>
                 </div>
                 {selectedOrder.status === 'Uncollected' ? (
                   <button 
                    onClick={() => { updateOrderStatus(selectedOrder.id, 'Collected'); setSelectedOrder(null); }}
                    className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                   >
                      <CheckCircle2 size={20} /> Mark as Collected
                   </button>
                 ) : (
                   <button 
                    onClick={() => { updateOrderStatus(selectedOrder.id, 'Uncollected'); setSelectedOrder(null); }}
                    className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-3"
                   >
                      <Clock size={20} /> Mark as Uncollected
                   </button>
                 )}
              </footer>
           </aside>
        </div>
      )}
    </div>
  );
};
