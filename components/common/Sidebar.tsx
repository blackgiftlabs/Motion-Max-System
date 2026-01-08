
import React from 'react';
import { useStore } from '../../store/useStore';
import { 
  LayoutDashboard, Users, HeartPulse, ShoppingCart, 
  Briefcase, X, Settings, History, Send, Receipt, BellRing, ShieldAlert, Brain, ClipboardList
} from 'lucide-react';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const Sidebar: React.FC = () => {
  const { user, activeTab, setActiveTab, isMobileMenuOpen, toggleMobileMenu, theme } = useStore();

  const getNavItems = () => {
    const role = user?.role;
    const base = [{ id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={18} /> }];

    if (role === 'SUPER_ADMIN') {
      return [
        ...base,
        { id: 'student-applications', label: 'Student Applicants', icon: <ClipboardList size={18} /> },
        { id: 'students', label: 'Students', icon: <Users size={18} /> },
        { id: 'staff', label: 'Staff members', icon: <Briefcase size={18} /> },
        { id: 'notices', label: 'Announcements', icon: <BellRing size={18} /> },
        { id: 'applications', label: 'Careers', icon: <Send size={18} /> },
        { id: 'orders', label: 'Orders', icon: <Receipt size={18} /> },
        { id: 'clinical', label: 'Student Growth', icon: <HeartPulse size={18} /> },
        { id: 'system-logs', label: 'Audit Logs', icon: <ShieldAlert size={18} /> },
        { id: 'shop', label: 'Uniform Shop', icon: <ShoppingCart size={18} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
      ];
    }

    if (role === 'SPECIALIST') {
      return [
        ...base,
        { id: 'my-students', label: 'My Students', icon: <Users size={18} /> },
        { id: 'clinical', label: 'Track Progress', icon: <Brain size={18} /> },
        { id: 'clinical-logs', label: 'Lesson Notes', icon: <History size={18} /> },
      ];
    }

    if (role === 'PARENT' || role === 'STUDENT') {
      const items = [
        ...base,
        { id: 'clinical-history', label: 'Progress Reports', icon: <History size={18} /> },
        { id: 'fees', label: 'School Fees', icon: <Receipt size={18} /> },
      ];
      if (role === 'PARENT') {
        items.push({ id: 'order-history', label: 'My Orders', icon: <Receipt size={18} /> });
        items.push({ id: 'shop', label: 'Uniform Shop', icon: <ShoppingCart size={18} /> });
      }
      return items;
    }

    return base;
  };

  const navItems = getNavItems();

  const SidebarContent = (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="md:hidden flex justify-end p-3">
        <button onClick={() => toggleMobileMenu(false)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="px-5 py-5 flex flex-col gap-4">
        {/* Logo at Top */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center p-2 shadow-sm border border-slate-200 dark:border-slate-800">
            <img src={LogoImg} alt="Logo" className="w-full h-auto" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">Motion Max</span>
            <span className="text-[7px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mt-1">Day Services</span>
          </div>
        </div>

        {/* User Info */}
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-[#002D50] text-white flex items-center justify-center font-bold text-xs shadow-inner border-2 border-white dark:border-slate-800 shrink-0 uppercase">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-none truncate uppercase">
              {user?.name?.split(' ')[0]}
            </p>
            <span className="text-[8px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest mt-1">
              {user?.role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 mb-3">
        <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
      </div>

      <nav className="flex-1 flex flex-col px-3 space-y-1 overflow-y-auto sidebar-scrollbar pb-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-4 py-2 text-[13px] font-bold transition-all rounded-xl group relative ${
                isActive 
                  ? 'bg-[#002D50] text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#002D50] dark:group-hover:text-blue-400'}`}>
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 19 })}
              </span>
              <span className="tracking-tight">{item.label}</span>
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_#60a5fa]" />
              )}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 text-center border-t border-slate-200 dark:border-slate-800 opacity-40">
         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">BUILD 3.1.4</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className={`hidden md:flex w-64 border-r transition-colors duration-300 flex flex-col h-screen sticky top-0 ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-white/5'}`}>{SidebarContent}</aside>
      <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => toggleMobileMenu(false)} />
        <aside className={`absolute inset-y-0 left-0 w-72 shadow-2xl transition-transform duration-500 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-950'}`}>{SidebarContent}</aside>
      </div>
    </>
  );
};
