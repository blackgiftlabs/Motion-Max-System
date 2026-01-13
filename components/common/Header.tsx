
import React from 'react';
import { useStore } from '../../store/useStore';
import { Bell, Moon, Sun, Menu, ShoppingCart, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, theme, toggleTheme, toggleMobileMenu, cart, setActiveTab, notices, toggleNotices, logout } = useStore();

  const canSeeShop = user?.role === 'SUPER_ADMIN' || user?.role === 'PARENT' || user?.role === 'ADMIN_SUPPORT';
  
  const relevantNoticesCount = React.useMemo(() => {
    if (!user) return 0;
    return notices.filter(n => 
      n.target === 'ALL' || n.target === user.role || (user.role === 'SUPER_ADMIN')
    ).length;
  }, [notices, user]);

  return (
    <header className="h-16 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Left side: Navigation Toggle (Mobile) */}
      <div className="flex items-center gap-5">
        <button 
          onClick={() => toggleMobileMenu()}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Right side: Global Actions */}
      <div className="flex items-center gap-3">
        {canSeeShop && (
          <button 
            onClick={() => setActiveTab('shop')}
            className="relative p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Uniform Shop"
          >
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        )}
        
        <button 
          onClick={toggleTheme}
          className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button 
          onClick={() => toggleNotices(true)}
          className="relative p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell size={20} />
          {relevantNoticesCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950 animate-pulse"></span>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

        <button 
          onClick={logout}
          className="flex items-center gap-2.5 px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-all active:scale-95 group"
        >
          <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
