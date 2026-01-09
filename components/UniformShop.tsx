
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  ShoppingBag, ShoppingCart, Trash2, Loader2, Package, 
  ArrowRight, Minus, Plus, CreditCard, Lock, X, Smartphone, Wallet,
  Info, ChevronRight, CheckCircle2
} from 'lucide-react';
import { ShopItem, OrderItem } from '../types';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const UniformShop: React.FC = () => {
  const { user, shopItems, addShopItem, deleteShopItem, addToCart, cart, isLoggedIn, setView, updateCartQuantity, removeFromCart, placeOrder, students, parents } = useStore();
  const [filter, setFilter] = useState<'All' | 'Required' | 'Optional'>('All');
  const [showCartView, setShowCartView] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Visa-Mastercard' | 'Ecocash' | 'Omari'>('Visa-Mastercard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const subtotal = (cart || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const linkedStudent = useMemo(() => {
    if (!isLoggedIn || !user) return null;
    if (user.role === 'STUDENT') return (students || []).find(s => s.firebaseUid === user.id);
    if (user.role === 'PARENT') {
      const parent = (parents || []).find(p => p.firebaseUid === user.id);
      return parent ? (students || []).find(s => s.id === parent.studentId) : null;
    }
    return null;
  }, [isLoggedIn, user, students, parents]);

  const handleCheckout = async () => {
    if (!linkedStudent) return;
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      await placeOrder({
        userId: user!.id,
        studentId: linkedStudent.id,
        studentName: linkedStudent.fullName,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, imageUrl: i.imageUrl, quantity: i.quantity })),
        total: subtotal,
        paymentMethod
      });
      setOrderSuccess(true);
      setTimeout(() => { setOrderSuccess(false); setShowCheckout(false); setShowCartView(false); }, 3000);
    } finally { setIsProcessing(false); }
  };

  const filteredItems = (shopItems || []).filter(item => filter === 'All' ? true : item.category === filter);

  return (
    <div className="space-y-1 animate-in fade-in duration-500 pb-10 max-w-[1400px] mx-auto selection:bg-blue-100">
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-none flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => showCartView ? setShowCartView(false) : null}
            className={`p-2.5 rounded-none transition-all ${showCartView ? 'bg-slate-100 text-slate-900 border' : 'bg-blue-600 text-white'}`}
          >
            {showCartView ? <X size={20} /> : <ShoppingBag size={20} />}
          </button>
          <div>
            <h1 className="text-lg font-black uppercase text-slate-900 dark:text-white leading-none tracking-tight">
              {showCartView ? 'Checkout Node' : 'Uniform Registry'}
            </h1>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Official school equipment & apparel</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {!showCartView && (
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-none flex gap-1 border border-slate-200 dark:border-slate-700">
              {['All', 'Required', 'Optional'].map(f => (
                <button key={f} onClick={() => setFilter(f as any)} className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-none transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{f}</button>
              ))}
            </div>
          )}
          <button 
            onClick={() => setShowCartView(!showCartView)}
            className={`p-2.5 rounded-none border transition-all ${showCartView ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            <ShoppingCart size={18} />
            {cart.length > 0 && <span className="ml-2 font-mono font-black text-xs">{cart.length}</span>}
          </button>
        </div>
      </header>

      {!showCartView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden group hover:border-blue-600 transition-all flex flex-col">
              <div className="aspect-[4/3] bg-slate-50 dark:bg-slate-950 overflow-hidden relative border-b border-slate-100 dark:border-slate-800">
                <img src={item.imageUrl} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" alt={item.name} />
                <div className="absolute top-2 left-2">
                   <span className="px-2 py-0.5 bg-slate-900 text-white text-[7px] font-black uppercase tracking-widest">{item.category}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <h3 className="font-black text-[12px] uppercase text-slate-900 dark:text-white tracking-tight leading-tight">{item.name}</h3>
                  <span className="text-sm font-black font-mono text-blue-600">${item.price}</span>
                </div>
                <button 
                  onClick={() => addToCart(item)}
                  className="w-full mt-auto py-3 bg-slate-950 dark:bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden animate-in slide-in-from-right-4 duration-300 min-h-[400px]">
           <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-[8px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                 <tr>
                    <th className="px-6 py-4">Item Node</th>
                    <th className="px-6 py-4">Unit Price</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4 text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {cart.length === 0 ? (
                   <tr><td colSpan={5} className="py-32 text-center text-[9px] font-black uppercase text-slate-300 italic">Cart Buffer Empty</td></tr>
                 ) : cart.map(item => (
                   <tr key={item.cartId} className="hover:bg-slate-50 transition-colors group">
                     <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-50 border overflow-hidden rounded-none">
                              <img src={item.imageUrl} className="w-full h-full object-cover" />
                           </div>
                           <p className="text-[11px] font-black uppercase dark:text-white">{item.name}</p>
                        </div>
                     </td>
                     <td className="px-6 py-5 font-mono text-[11px] text-slate-500">${item.price}</td>
                     <td className="px-6 py-5">
                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 w-fit p-1">
                           <button onClick={() => updateCartQuantity(item.cartId, -1)} className="p-1 hover:text-blue-600"><Minus size={12} /></button>
                           <span className="font-black text-[11px] min-w-[20px] text-center">{item.quantity}</span>
                           <button onClick={() => updateCartQuantity(item.cartId, 1)} className="p-1 hover:text-blue-600"><Plus size={12} /></button>
                        </div>
                     </td>
                     <td className="px-6 py-5 text-right font-black text-blue-600 font-mono text-sm">${item.price * item.quantity}</td>
                     <td className="px-6 py-5 text-right">
                        <button onClick={() => removeFromCart(item.cartId)} className="text-slate-300 hover:text-rose-500"><Trash2 size={14}/></button>
                     </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           
           {cart.length > 0 && (
             <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Procurement Total</p>
                   <p className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">${subtotal}</p>
                </div>
                <button 
                  onClick={() => setShowCheckout(true)}
                  className="px-10 py-5 bg-slate-900 dark:bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-black transition-all flex items-center gap-3 active:scale-95"
                >
                   Finalize Order <ArrowRight size={18} />
                </button>
             </div>
           )}
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 max-w-lg w-full border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden animate-in zoom-in-95">
              {orderSuccess ? (
                <div className="p-20 text-center space-y-8 animate-in zoom-in">
                   {/* Fix: CheckCircle2 is now imported from lucide-react */}
                   <CheckCircle2 size={64} className="text-emerald-500 mx-auto" />
                   <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white">Order Registered</h3>
                </div>
              ) : (
                <>
                  <header className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                     <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Transaction Node</h3>
                     <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20}/></button>
                  </header>
                  <div className="p-8 space-y-6">
                     <div className="grid grid-cols-3 gap-2">
                        {['Visa-Mastercard', 'Ecocash', 'Omari'].map(m => (
                          <button key={m} onClick={() => setPaymentMethod(m as any)} className={`p-4 border text-[9px] font-black uppercase text-center rounded-none ${paymentMethod === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400'}`}>{m}</button>
                        ))}
                     </div>
                     <button 
                      onClick={handleCheckout} 
                      disabled={isProcessing}
                      className="w-full py-5 bg-slate-900 dark:bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center justify-center gap-3"
                     >
                        {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <>Verify and Pay ${subtotal} <Lock size={14}/></>}
                     </button>
                  </div>
                </>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
