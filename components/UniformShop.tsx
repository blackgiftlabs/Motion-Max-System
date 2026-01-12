
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  ShoppingBag, ShoppingCart, Trash2, Loader2, Package, 
  ArrowRight, Minus, Plus, CreditCard, Lock, X, Smartphone, Wallet,
  Info, ChevronRight, CheckCircle2, Image as ImageIcon, PlusCircle, AlertTriangle
} from 'lucide-react';
import { ShopItem, OrderItem } from '../types';

// Define payment methods available for the school
const PAYMENT_METHODS = [
  { id: 'Ecocash', name: 'Ecocash', logo: 'https://i.ibb.co/7NQSc15p/ecocash.png' },
  { id: 'Omari', name: "O'mari", logo: 'https://i.ibb.co/BDp0pNV/omari.png' },
  { id: 'Visa-Mastercard', name: 'Visa / Mastercard', logo: 'https://i.ibb.co/tw59PtJJ/visamastercard.png' }
];

// Helper to extract the actual image source if an HTML snippet is pasted
const extractSrcFromHtml = (html: string) => {
  if (!html) return '';
  const match = html.match(/src="([^"]+)"/);
  return match ? match[1] : html.trim();
};

export const UniformShop: React.FC = () => {
  const { user, shopItems, addShopItem, deleteShopItem, addToCart, cart, isLoggedIn, updateCartQuantity, removeFromCart, placeOrder, students, parents } = useStore();
  const [filter, setFilter] = useState<'All' | 'Required' | 'Optional'>('All');
  const [showCartView, setShowCartView] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Visa-Mastercard' | 'Ecocash' | 'Omari'>('Visa-Mastercard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Management state for Admin
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', imageUrl: '', category: 'Required' as 'Required' | 'Optional' });
  const [itemToDelete, setItemToDelete] = useState<ShopItem | null>(null);

  const isAdmin = user?.role === 'SUPER_ADMIN';
  // Parents, students and visitors can shop
  const canShop = !user || user?.role === 'PARENT' || user?.role === 'STUDENT';

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
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 2000)); // Simulate processing
      await placeOrder({
        userId: user?.id || 'guest',
        studentId: linkedStudent?.id || 'guest-user',
        studentName: linkedStudent?.fullName || 'Online Visitor',
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, imageUrl: i.imageUrl, quantity: i.quantity })),
        total: subtotal,
        paymentMethod
      });
      setOrderSuccess(true);
      setTimeout(() => { 
        setOrderSuccess(false); 
        setShowCheckout(false); 
        setShowCartView(false); 
      }, 3000);
    } finally { setIsProcessing(false); }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.imageUrl) return;
    const finalUrl = extractSrcFromHtml(newItem.imageUrl);
    await addShopItem({
      name: newItem.name,
      price: parseFloat(newItem.price),
      imageUrl: finalUrl,
      category: newItem.category,
      stock: 100
    });
    setNewItem({ name: '', price: '', imageUrl: '', category: 'Required' });
    setShowAddModal(false);
  };

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      await deleteShopItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const filteredItems = (shopItems || []).filter(item => filter === 'All' ? true : item.category === filter);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-24 max-w-[1400px] mx-auto selection:bg-blue-100 relative font-sans">
      
      {/* Page Header */}
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-none flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-none">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white leading-none tracking-tighter">
              {showCartView ? 'Your Shopping Cart' : 'School Uniform Shop'}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.3em] italic">Official Motion Max uniforms and gear</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && !showCartView && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-slate-900 text-white rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 border border-slate-800 shadow-lg"
            >
              <PlusCircle size={14} /> Add New Uniform
            </button>
          )}

          {!showCartView && (
            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-none flex gap-1 border border-slate-200 dark:border-slate-700">
              {['All', 'Required', 'Optional'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f as any)} 
                  className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-none transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {showCartView && (
            <button 
              onClick={() => setShowCartView(false)}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
            >
              Back to Shop
            </button>
          )}
        </div>
      </header>

      {/* Product Grid */}
      {!showCartView ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden group hover:border-blue-600 transition-all flex flex-col shadow-sm">
              <div className="aspect-[4/3] bg-slate-50 dark:bg-slate-950 overflow-hidden relative border-b border-slate-100 dark:border-slate-800">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" alt={item.name} />
                <div className="absolute top-3 left-3">
                   <span className="px-3 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-[0.2em]">{item.category}</span>
                </div>
                {isAdmin && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }}
                    className="absolute top-3 right-3 p-2 bg-rose-600 text-white hover:bg-rose-700 shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-6">
                  <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white tracking-tight leading-tight">{item.name}</h3>
                  <span className="text-base font-black font-mono text-blue-600">${item.price}</span>
                </div>
                {canShop && (
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-full mt-auto py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-900 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={14} /> Buy Online
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
               <Package size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No items available in this category</p>
            </div>
          )}
        </div>
      ) : (
        /* Cart List Table */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden animate-in slide-in-from-bottom-4 duration-500 shadow-2xl">
           <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                 <tr>
                    <th className="px-8 py-6">Item</th>
                    <th className="px-8 py-6">Price</th>
                    <th className="px-8 py-6">Quantity</th>
                    <th className="px-8 py-6 text-right">Total</th>
                    <th className="px-8 py-6 text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {cart.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="py-40 text-center">
                        <ShoppingCart size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-[10px] font-black uppercase text-slate-300 italic tracking-[0.4em]">Your cart is empty</p>
                     </td>
                   </tr>
                 ) : cart.map(item => (
                   <tr key={item.cartId} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/5 transition-colors group">
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                           <div className="w-16 h-16 bg-slate-100 border border-slate-200 overflow-hidden rounded-none shadow-sm">
                              <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                           </div>
                           <p className="text-sm font-black uppercase dark:text-white tracking-tight">{item.name}</p>
                        </div>
                     </td>
                     <td className="px-8 py-6 font-mono text-sm text-slate-500 font-bold">${item.price}</td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 w-fit p-1.5 border border-slate-200 dark:border-slate-700">
                           <button onClick={() => updateCartQuantity(item.cartId, -1)} className="p-1.5 hover:text-blue-600 transition-colors"><Minus size={14} /></button>
                           <span className="font-black text-xs min-w-[30px] text-center font-mono">{item.quantity}</span>
                           <button onClick={() => updateCartQuantity(item.cartId, 1)} className="p-1.5 hover:text-blue-600 transition-colors"><Plus size={14} /></button>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-right font-black text-blue-600 font-mono text-lg">${(item.price * item.quantity).toFixed(2)}</td>
                     <td className="px-8 py-6 text-right">
                        <button onClick={() => removeFromCart(item.cartId)} className="text-slate-300 hover:text-rose-500 transition-colors p-2"><Trash2 size={20}/></button>
                     </td>
                   </tr>
                 ))}
              </tbody>
           </table>
           
           {cart.length > 0 && (
             <div className="p-10 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Order Total</p>
                   <p className="text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">${subtotal.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => setShowCheckout(true)}
                  className="px-16 py-6 bg-slate-950 dark:bg-blue-600 text-white font-black uppercase tracking-[0.4em] text-xs shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-blue-600 transition-all flex items-center gap-4 active:scale-95"
                >
                   Proceed to Payment <ArrowRight size={22} />
                </button>
             </div>
           )}
        </div>
      )}

      {/* Floating Cart Widget */}
      {canShop && cart.length > 0 && !showCartView && (
        <button 
          onClick={() => setShowCartView(true)}
          className="fixed bottom-10 right-10 z-[100] group flex items-center gap-6 bg-slate-950 dark:bg-blue-600 text-white pl-8 pr-6 py-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border border-white/10 hover:scale-105 transition-all animate-in slide-in-from-right-10 duration-500"
        >
           <div className="text-left">
              <p className="text-[9px] font-black uppercase text-white/40 tracking-[0.3em] mb-1">Items Total</p>
              <p className="text-2xl font-black font-mono leading-none">${subtotal.toFixed(2)}</p>
           </div>
           <div className="relative p-4 bg-white/10 border border-white/20 rounded-none">
              <ShoppingCart size={24} />
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-slate-950 shadow-lg">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
           </div>
        </button>
      )}

      {/* Admin: Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white dark:bg-slate-900 max-w-md w-full border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden animate-in zoom-in-95">
              <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
                 <h3 className="text-base font-black uppercase tracking-widest dark:text-white">Add New Item</h3>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none transition-colors"><X size={24}/></button>
              </header>
              <div className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Item Name</label>
                    <input 
                      value={newItem.name} 
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                      className="w-full p-5 border-2 border-slate-100 dark:border-slate-800 rounded-none bg-slate-50 dark:bg-slate-950 font-black text-sm outline-none focus:border-blue-500 transition-all shadow-inner" 
                      placeholder="e.g. Academy Tracksuit"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Price (USD)</label>
                        <input 
                          type="number"
                          value={newItem.price} 
                          onChange={e => setNewItem({...newItem, price: e.target.value})}
                          className="w-full p-5 border-2 border-slate-100 dark:border-slate-800 rounded-none bg-slate-50 dark:bg-slate-950 font-mono font-black text-lg outline-none focus:border-blue-500 transition-all shadow-inner" 
                          placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Category</label>
                        <select 
                          value={newItem.category} 
                          onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                          className="w-full p-5 border-2 border-slate-100 dark:border-slate-800 rounded-none bg-slate-50 dark:bg-slate-950 font-black uppercase text-[10px] outline-none cursor-pointer shadow-inner"
                        >
                           <option value="Required">Required</option>
                           <option value="Optional">Optional</option>
                        </select>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Product Image (URL or HTML Link)</label>
                    <textarea 
                      value={newItem.imageUrl} 
                      onChange={e => setNewItem({...newItem, imageUrl: e.target.value})}
                      className="w-full p-5 border-2 border-slate-100 dark:border-slate-800 rounded-none bg-slate-50 dark:bg-slate-950 font-mono text-[10px] outline-none focus:border-blue-500 h-32 resize-none shadow-inner" 
                      placeholder="Paste image link or <img src=...> code here..."
                    />
                 </div>
                 <button 
                  onClick={handleAddItem}
                  className="w-full py-6 bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-slate-950 transition-all active:scale-95"
                 >
                    Save to Shop
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Admin: Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[1100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white dark:bg-slate-900 max-w-md w-full p-10 border border-slate-200 dark:border-slate-800 rounded-none shadow-2xl animate-in zoom-in-95">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-none flex items-center justify-center mx-auto mb-8 border border-rose-100">
                 <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-center mb-4 dark:text-white leading-none">Remove this item?</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center leading-relaxed italic mb-12">
                 You are about to permanently delete <b className="text-slate-900 dark:text-white uppercase">"{itemToDelete.name}"</b> from the shop. This cannot be undone.
              </p>
              <div className="flex gap-4">
                 <button onClick={() => setItemToDelete(null)} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors">Cancel</button>
                 <button onClick={confirmDeleteItem} className="flex-1 py-5 bg-rose-600 text-white rounded-none text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-rose-700 transition-all active:scale-95">Yes, Delete</button>
              </div>
           </div>
        </div>
      )}

      {/* Payment Selection Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white dark:bg-slate-900 max-w-lg w-full border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden animate-in zoom-in-95 shadow-2xl">
              {orderSuccess ? (
                <div className="p-24 text-center space-y-8 animate-in zoom-in duration-500">
                   <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-none flex items-center justify-center mx-auto border border-emerald-100">
                      <CheckCircle2 size={48} />
                   </div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter dark:text-white leading-none">Order Received</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your order has been sent to the school office</p>
                </div>
              ) : (
                <>
                  <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
                     <div>
                        <h3 className="text-base font-black uppercase tracking-widest dark:text-white">Payment Details</h3>
                        <p className="text-[8px] font-black uppercase text-slate-400 mt-1">Choose your payment method</p>
                     </div>
                     <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={24}/></button>
                  </header>
                  <div className="p-10 space-y-10">
                     <div className="grid grid-cols-3 gap-3">
                        {PAYMENT_METHODS.map(m => (
                          <button 
                            key={m.id} 
                            onClick={() => setPaymentMethod(m.id as any)} 
                            className={`flex flex-col items-center justify-center gap-4 p-6 border-2 transition-all rounded-none ${paymentMethod === m.id ? 'bg-blue-50 border-blue-600 shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                          >
                             <img src={m.logo} className={`h-8 w-auto ${paymentMethod === m.id ? 'grayscale-0' : 'grayscale'}`} alt={m.name} />
                             <span className="text-[8px] font-black uppercase tracking-widest text-center">{m.name}</span>
                          </button>
                        ))}
                     </div>
                     
                     <div className="bg-slate-50 dark:bg-slate-950 p-6 border border-slate-100 dark:border-slate-800 rounded-none">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-black uppercase text-slate-400">Total to Pay</span>
                           <span className="text-3xl font-black font-mono text-blue-600">${subtotal.toFixed(2)}</span>
                        </div>
                        <p className="text-[8px] font-medium text-slate-400 italic">Secure payment processing with 256-bit encryption</p>
                     </div>

                     <button 
                      onClick={handleCheckout} 
                      disabled={isProcessing}
                      className="w-full py-6 bg-slate-950 dark:bg-blue-600 text-white font-black uppercase text-xs tracking-[0.4em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center gap-4 hover:bg-blue-600 transition-all active:scale-[0.98]"
                     >
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <>Verify and Pay Now <Lock size={18}/></>}
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
