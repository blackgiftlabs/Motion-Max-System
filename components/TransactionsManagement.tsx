
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ShoppingBag, Search, Filter, CheckCircle2, Clock, X, ChevronRight, DollarSign, Calendar, User, ShoppingCart, Check, Package, CreditCard, ArrowLeft, ArrowRight } from 'lucide-react';
import { Order } from '../types';

const ORDER_COLORS = [
  { bg: 'bg-blue-600', row: 'bg-blue-50', text: 'text-white', border: 'border-blue-900', accent: 'border-blue-600', dark: 'dark:bg-blue-900/40' },
  { bg: 'bg-emerald-600', row: 'bg-emerald-50', text: 'text-white', border: 'border-emerald-900', accent: 'border-emerald-600', dark: 'dark:bg-emerald-900/40' },
  { bg: 'bg-rose-600', row: 'bg-rose-50', text: 'text-white', border: 'border-rose-900', accent: 'border-rose-600', dark: 'dark:bg-rose-900/40' },
  { bg: 'bg-amber-600', row: 'bg-amber-50', text: 'text-white', border: 'border-amber-900', accent: 'border-amber-600', dark: 'dark:bg-amber-900/40' },
];

const getOrderColor = (id: string) => {
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % ORDER_COLORS.length;
  return ORDER_COLORS[index];
};

export const TransactionsManagement: React.FC = () => {
  const { orders, updateOrderStatus, notify, students } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Uncollected' | 'Collected'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-slate-900 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-slate-950 dark:text-white leading-none tracking-tight">Uniform Orders</h1>
          <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase mt-3 tracking-[0.4em] italic">Procurement Hub // Collection Monitoring</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-950 dark:text-white group-focus-within:text-googleBlue" />
            <input 
              type="text" 
              placeholder="Search by name or order ref..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-none text-sm outline-none focus:border-googleBlue transition-all w-full sm:w-80 shadow-sm font-bold text-slate-900 dark:text-white" 
            />
          </div>
          <div className="flex items-center bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-none px-4 shadow-sm">
             <Filter size={16} className="text-slate-950 dark:text-white mr-3" />
             <select 
               value={statusFilter} 
               onChange={(e) => setStatusFilter(e.target.value as any)}
               className="py-4 bg-transparent text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer text-slate-950 dark:text-white"
             >
               <option value="All">All Invoices</option>
               <option value="Uncollected">To Collect</option>
               <option value="Collected">Completed</option>
             </select>
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-none overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left table-auto border-collapse min-w-[800px]">
            <thead className="bg-slate-900 text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-slate-900">
              <tr>
                <th className="px-10 py-6">Parent / Student Account</th>
                <th className="px-8 py-6 text-center">Ref ID</th>
                <th className="px-8 py-6 text-center">Current Status</th>
                <th className="px-8 py-6 text-center">Total Paid</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <ShoppingBag size={64} className="mx-auto text-slate-100 mb-6 opacity-50" />
                    <p className="text-xs font-black uppercase text-slate-300 italic tracking-[0.4em]">Registry is currently empty</p>
                  </td>
                </tr>
              ) : filteredOrders.map(order => {
                const color = getOrderColor(order.studentId);
                const studentProfile = students.find(s => s.id === order.studentId);
                return (
                  <tr 
                    key={order.id} 
                    className={`${color.row} ${color.dark} hover:brightness-95 transition-all cursor-pointer border-l-[12px] ${color.accent} group`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center font-black text-xs text-slate-900 uppercase shadow-md overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          {studentProfile?.imageUrl ? <img src={studentProfile.imageUrl} className="w-full h-full object-cover" /> : order.studentName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-950 dark:text-white uppercase leading-none tracking-tight">{order.studentName}</p>
                          <p className="text-[10px] text-slate-900 dark:text-white/80 mt-1.5 uppercase font-mono font-black tracking-widest">{order.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-[11px] font-mono font-black text-slate-900 dark:text-white uppercase tracking-tight">#{order.id.substring(0,8)}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border-2 shadow-sm ${
                        order.status === 'Collected' ? 'bg-emerald-600 text-white border-slate-900' : 'bg-amber-500 text-white border-slate-900'
                      }`}>
                        {order.status === 'Collected' ? 'Collected' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-2xl font-black font-mono text-slate-950 dark:text-white tracking-tighter leading-none">${order.total}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <div className="flex items-center justify-end gap-5">
                          <p className="text-[10px] font-mono text-slate-950 dark:text-white hidden lg:block uppercase font-black">{new Date(order.timestamp).toLocaleDateString()}</p>
                          <div className="p-2 bg-white dark:bg-slate-800 border-2 border-slate-900 rounded-lg text-slate-900 dark:text-white group-hover:text-googleBlue group-hover:border-googleBlue transition-all">
                             <ChevronRight size={18} />
                          </div>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Slide-over for Review */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[10000] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedOrder(null)} />
          <aside className="relative w-full max-w-xl bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 border-l-8 border-slate-900">
            <header className="px-10 py-8 border-b-2 border-slate-900 bg-white dark:bg-slate-900 sticky top-0 z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-900 dark:text-white transition-colors">
                    <ArrowLeft size={20} />
                 </button>
                 <div>
                   <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">Audit Registry</h2>
                   <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none mt-1">Review Invoice</h3>
                 </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-3 text-slate-900 dark:text-white hover:text-rose-600 transition-all active:scale-90"><X size={28}/></button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-50 dark:bg-slate-950">
              {/* Identity Container */}
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 p-8 rounded-2xl shadow-sm flex items-center gap-8">
                <div className="w-24 h-24 bg-slate-900 border-4 border-slate-100 dark:border-slate-800 shadow-xl rounded-2xl flex items-center justify-center text-4xl font-black text-white uppercase">
                  {selectedOrder.studentName[0]}
                </div>
                <div>
                  <h4 className="text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white leading-tight">{selectedOrder.studentName}</h4>
                  <div className="flex items-center gap-3 mt-3">
                     <p className="text-[10px] font-mono font-black text-googleBlue uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 border border-blue-100 rounded">REF: {selectedOrder.id.toUpperCase()}</p>
                     <span className="text-slate-900 dark:text-white font-black">|</span>
                     <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{selectedOrder.studentId}</p>
                  </div>
                </div>
              </div>

              {/* Stats Containers */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-8 bg-emerald-600 text-white border-2 border-slate-900 rounded-2xl shadow-sm">
                    <p className="text-[9px] font-black uppercase text-emerald-100 tracking-widest mb-3">Total Value</p>
                    <div className="flex items-center gap-2">
                       <DollarSign size={20} className="text-emerald-100" />
                       <p className="text-4xl font-black font-mono leading-none tracking-tighter text-white">{selectedOrder.total}</p>
                    </div>
                 </div>
                 <div className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl shadow-sm">
                    <p className="text-[9px] font-black uppercase text-slate-900 dark:text-white mb-3 tracking-widest">Source Hub</p>
                    <div className="flex items-center gap-3">
                       <CreditCard size={18} className="text-slate-900 dark:text-white" />
                       <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div className="mt-3 inline-block px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-black uppercase border-2 border-slate-900">Verified Secure</div>
                 </div>
              </div>

              {/* Items List Container */}
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl overflow-hidden shadow-sm">
                <header className="px-6 py-4 bg-slate-100 dark:bg-slate-950 border-b-2 border-slate-900">
                   <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">Invoice Inventory</h4>
                </header>
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                   {selectedOrder.items.map((item, idx) => (
                     <div key={idx} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 border-2 border-slate-900 bg-white overflow-hidden rounded-xl shadow-inner">
                              <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight">{item.name}</p>
                              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase mt-1">Quantity: {item.quantity}</p>
                           </div>
                        </div>
                        <p className="text-lg font-black font-mono text-slate-900 dark:text-white">${item.price * item.quantity}</p>
                     </div>
                   ))}
                </div>
              </div>

              {/* Timestamp Info */}
              <div className="p-6 bg-slate-900 text-white border-2 border-slate-900 rounded-2xl shadow-lg flex items-center gap-5 relative overflow-hidden group">
                 <Package className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-1000" size={120} />
                 <div className="p-3 bg-white/10 rounded-xl relative z-10"><Calendar size={24} className="text-blue-400" /></div>
                 <div className="relative z-10">
                    <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest mb-1">Transaction Logged</p>
                    <p className="text-sm font-black uppercase">{new Date(selectedOrder.timestamp).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
                 </div>
              </div>
            </div>

            <footer className="p-8 border-t-2 border-slate-900 bg-white dark:bg-slate-900 sticky bottom-0">
              {selectedOrder.status === 'Uncollected' ? (
                <button 
                  onClick={() => { updateOrderStatus(selectedOrder.id, 'Collected'); setSelectedOrder(null); notify('success', 'Order marked as ready/collected.'); }}
                  className="w-full py-6 bg-emerald-600 text-white rounded-none font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 active:scale-95 border-b-4 border-emerald-800"
                >
                  <CheckCircle2 size={24} /> Confirm Collection
                </button>
              ) : (
                <button 
                  onClick={() => { updateOrderStatus(selectedOrder.id, 'Uncollected'); setSelectedOrder(null); notify('info', 'Registry status reset.'); }}
                  className="w-full py-6 bg-slate-900 text-white rounded-none font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-95 border-b-4 border-slate-700"
                >
                  <Clock size={24} /> Reset Status to Pending
                </button>
              )}
            </footer>
          </aside>
        </div>
      )}
    </div>
  );
};
