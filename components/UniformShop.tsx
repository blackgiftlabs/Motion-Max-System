
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  ShoppingBag, ShoppingCart, Tag, Info, 
  Plus, X, Trash2, Loader2, Package, DollarSign, 
  Image as ImageIcon, AlertTriangle, ArrowRight,
  Minus, CreditCard, Wallet, Smartphone, CheckCircle2,
  Lock, History
} from 'lucide-react';
import { ShopItem, OrderItem } from '../types';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const UniformShop: React.FC = () => {
  const { user, shopItems, addShopItem, deleteShopItem, addToCart, cart, isLoggedIn, setView, updateCartQuantity, removeFromCart, placeOrder, students, parents } = useStore();
  const [filter, setFilter] = useState<'All' | 'Required' | 'Optional'>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showCartView, setShowCartView] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Visa-Mastercard' | 'Ecocash' | 'Omari'>('Visa-Mastercard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [newItem, setNewItem] = useState<Omit<ShopItem, 'id'>>({
    name: '',
    price: 0,
    category: 'Required',
    imageUrl: '',
    stock: 100
  });

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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addShopItem(newItem);
      setIsAdding(false);
      setNewItem({ name: '', price: 0, category: 'Required', imageUrl: '', stock: 100 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFlyAnimation = (startRect: DOMRect, image: string) => {
    const cartIcon = document.getElementById('shop-cart-icon') || document.getElementById('common-header-cart');
    if (!cartIcon) return;
    const endRect = cartIcon.getBoundingClientRect();
    const flyer = document.createElement('div');
    flyer.className = 'fixed z-[9999] pointer-events-none transition-all duration-700 ease-in-out';
    flyer.style.left = `${startRect.left}px`;
    flyer.style.top = `${startRect.top}px`;
    flyer.style.width = '60px';
    flyer.style.height = '60px';
    const img = document.createElement('img');
    img.src = image;
    img.className = 'w-full h-full object-cover rounded-xl shadow-2xl border-2 border-white';
    flyer.appendChild(img);
    document.body.appendChild(flyer);
    flyer.offsetWidth;
    flyer.style.left = `${endRect.left}px`;
    flyer.style.top = `${endRect.top}px`;
    flyer.style.width = '20px';
    flyer.style.height = '20px';
    flyer.style.opacity = '0';
    flyer.style.transform = 'scale(0.1) rotate(45deg)';
    setTimeout(() => {
      document.body.removeChild(flyer);
      cartIcon.classList.add('scale-125', 'text-blue-500');
      setTimeout(() => cartIcon.classList.remove('scale-125', 'text-blue-500'), 200);
    }, 700);
  };

  const handleAddToCart = (e: React.MouseEvent, item: ShopItem) => {
    if (!isLoggedIn) {
      setShowGuestModal(true);
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    triggerFlyAnimation(rect, item.imageUrl);
    addToCart(item);
  };

  const handleCheckout = async () => {
    if (!linkedStudent) return;
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      
      const orderItems: OrderItem[] = cart.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        imageUrl: i.imageUrl,
        quantity: i.quantity
      }));

      await placeOrder({
        userId: user!.id,
        studentId: linkedStudent.id,
        studentName: linkedStudent.fullName,
        items: orderItems,
        total: subtotal,
        paymentMethod
      });
      
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setShowCheckout(false);
        setShowCartView(false);
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredItems = (shopItems || []).filter(item => 
    filter === 'All' ? true : item.category === filter
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           {showCartView && (
             <button 
              onClick={() => setShowCartView(false)}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
             >
               <X size={20} />
             </button>
           )}
           <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                {showCartView ? <ShoppingCart size={16} /> : <ShoppingBag size={16} />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">School Shop</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight uppercase dark:text-white leading-none">
              {showCartView ? 'Your Shopping Cart' : 'Uniform Shop'}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-3">
              {showCartView ? 'Review your items before finishing your order.' : 'Official school uniforms and student apparel.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!showCartView && (
             <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
              {['All', 'Required', 'Optional'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filter === f ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
          
          <button 
            id="shop-cart-icon" 
            onClick={() => setShowCartView(!showCartView)}
            className={`relative p-3 rounded-xl shadow-sm transition-all duration-300 border ${showCartView ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            <ShoppingCart size={20} />
            {(cart || []).length > 0 && (
              <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-950 font-black text-[10px] ${showCartView ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                {cart.length}
              </span>
            )}
          </button>

          {user?.role === 'SUPER_ADMIN' && !showCartView && (
            <button 
              onClick={() => setIsAdding(true)}
              className="px-6 py-3 bg-navy text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-black transition-all active:scale-95"
            >
              <Plus size={16} /> Add Item
            </button>
          )}
        </div>
      </div>

      {!showCartView ? (
        <>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-6 flex items-start gap-5">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
              <Info size={24} />
            </div>
            <div>
              <h4 className="text-blue-900 dark:text-blue-200 font-black text-sm uppercase tracking-tight">School Uniform Policy</h4>
              <p className="text-blue-700 dark:text-blue-400 text-xs mt-1 font-medium leading-relaxed">
                All students are required to wear the official school uniform. Please check your child's sizes regularly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.length === 0 ? (
              <div className="col-span-full py-24 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Package size={64} className="mx-auto text-slate-300 mb-6" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No uniform items available.</p>
              </div>
            ) : filteredItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm group hover:shadow-2xl transition-all duration-500 relative">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl ${item.category === 'Required' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'}`}>
                      {item.category}
                    </span>
                  </div>
                  {user?.role === 'SUPER_ADMIN' && (
                    <button 
                      onClick={() => deleteShopItem(item.id)}
                      className="absolute top-4 right-4 p-2.5 bg-white/90 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg backdrop-blur-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="p-8">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">{item.name}</h3>
                      <p className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-widest">ID: {item.id.substring(0,6)}</p>
                    </div>
                    <div className="flex flex-col items-end">
                       <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono leading-none">${item.price}</p>
                       <span className="text-[8px] font-black uppercase text-slate-400 mt-1">USD</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => handleAddToCart(e, item)}
                    className="w-full bg-slate-950 dark:bg-white dark:text-slate-950 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-xl"
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in slide-in-from-right duration-500">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                       <th className="px-8 py-5">Uniform Item</th>
                       <th className="px-8 py-5">Unit Price</th>
                       <th className="px-8 py-5">Quantity</th>
                       <th className="px-8 py-5">Subtotal</th>
                       <th className="px-8 py-5 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {(cart || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-32 text-center">
                          <ShoppingCart size={64} className="mx-auto text-slate-200 mb-4" />
                          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Your cart is currently empty.</p>
                        </td>
                      </tr>
                    ) : cart.map(item => (
                      <tr key={item.cartId} className="group hover:bg-slate-50/50 dark:hover:bg-blue-900/10 transition-colors">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
                                 <img src={item.imageUrl} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                 <p className="font-black text-sm dark:text-white uppercase tracking-tight">{item.name}</p>
                                 <span className="text-[10px] font-mono text-slate-400 uppercase">{item.id.substring(0,8)}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6 font-mono font-bold text-slate-600 dark:text-slate-400">${item.price}</td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 w-fit p-1 rounded-xl">
                              <button onClick={() => updateCartQuantity(item.cartId, -1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"><Minus size={14} /></button>
                              <span className="font-black text-sm min-w-[20px] text-center">{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.cartId, 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"><Plus size={14} /></button>
                           </div>
                        </td>
                        <td className="px-8 py-6 font-black text-blue-600 dark:text-blue-400 font-mono">${item.price * item.quantity}</td>
                        <td className="px-8 py-6 text-right">
                           <button onClick={() => removeFromCart(item.cartId)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           
           {(cart || []).length > 0 && (
             <div className="p-10 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex gap-12">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
                      <p className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">${subtotal}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setShowCheckout(true)}
                  className="px-12 py-5 bg-[#002D50] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center gap-4 hover:bg-black transition-all active:scale-95"
                >
                   Complete Purchase <ArrowRight size={20} />
                </button>
             </div>
           )}
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in duration-500">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => !isProcessing && setShowCheckout(false)} />
           <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              {orderSuccess ? (
                <div className="p-20 text-center space-y-8 animate-in zoom-in">
                   <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                      <CheckCircle2 size={48} />
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-3xl font-black uppercase tracking-tight dark:text-white leading-none">Order Placed</h3>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed italic">
                        Your uniform order has been successfully recorded in our system.
                      </p>
                   </div>
                </div>
              ) : (
                <>
                  <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <img src={LogoImg} className="h-10 w-auto" />
                        <div>
                           <h3 className="text-sm font-black uppercase tracking-tight leading-none dark:text-white">Motion Max Shop</h3>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Checkout Terminal</p>
                        </div>
                     </div>
                     <button disabled={isProcessing} onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"><X size={20} /></button>
                  </header>

                  <div className="p-8 space-y-8">
                     <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 flex justify-between items-center border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Total Price</span>
                        <span className="text-2xl font-black text-blue-600 font-mono">${subtotal}</span>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Payment Method</label>
                        <div className="grid grid-cols-3 gap-3">
                           {[
                             { id: 'Visa-Mastercard', icon: CreditCard },
                             { id: 'Ecocash', icon: Smartphone },
                             { id: 'Omari', icon: Wallet }
                           ].map(method => {
                             const Icon = method.icon;
                             return (
                               <button 
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id as any)}
                                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${paymentMethod === method.id ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400'}`}
                               >
                                  <Icon size={24} />
                                  <span className="text-[9px] font-black uppercase tracking-tight">{method.id}</span>
                               </button>
                             );
                           })}
                        </div>
                     </div>

                     <div className="space-y-4 animate-in fade-in duration-300">
                        {paymentMethod === 'Visa-Mastercard' ? (
                          <div className="space-y-4">
                             <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Card Number</label>
                                <div className="relative">
                                   <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                   <input placeholder="0000 0000 0000 0000" className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none" />
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <input placeholder="MM/YY" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none" />
                                <input placeholder="CVC" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none" />
                             </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                {paymentMethod === 'Ecocash' ? 'Ecocash Phone Number' : 'Wallet ID'}
                             </label>
                             <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input placeholder="+263 ..." className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none" />
                             </div>
                          </div>
                        )}
                     </div>

                     <button 
                      onClick={handleCheckout}
                      disabled={isProcessing || !linkedStudent}
                      className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                     >
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <>Verify and Pay Now <Lock size={14} /></>}
                     </button>
                  </div>
                </>
              )}
           </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsAdding(false)} />
           <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                 <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Add New Uniform Item</h3>
                 <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Item Name</label>
                       <input 
                        required 
                        placeholder="e.g. Winter Jacket" 
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none" 
                        value={newItem.name}
                        onChange={e => setNewItem({...newItem, name: e.target.value})}
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <input 
                        type="number" 
                        required 
                        placeholder="Price USD"
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none" 
                        value={newItem.price || ''}
                        onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                       />
                       <select 
                        className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none cursor-pointer"
                        value={newItem.category}
                        onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                       >
                          <option value="Required">Required</option>
                          <option value="Optional">Optional</option>
                       </select>
                    </div>
                    <input 
                      required 
                      placeholder="Image URL" 
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none" 
                      value={newItem.imageUrl}
                      onChange={e => setNewItem({...newItem, imageUrl: e.target.value})}
                    />
                 </div>
                 <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-navy text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                 >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Item to Shop'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {showGuestModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-500">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowGuestModal(false)} />
           <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 text-center space-y-8 shadow-2xl overflow-hidden">
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                 <AlertTriangle size={40} />
              </div>
              <div className="space-y-3">
                 <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white">Account Required</h3>
                 <p className="text-slate-500 font-medium text-sm leading-relaxed italic">
                   "You need to be logged in as a parent or student to complete a purchase and link it to your school record."
                 </p>
              </div>
              <div className="flex flex-col gap-3">
                 <button 
                  onClick={() => { setView('login'); setShowGuestModal(false); }}
                  className="w-full py-5 bg-navy text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                 >
                    Login to Portal <ArrowRight size={16} />
                 </button>
                 <button 
                  onClick={() => setShowGuestModal(false)}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-500"
                 >
                    Continue Browsing
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
