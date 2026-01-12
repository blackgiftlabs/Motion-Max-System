
import React from 'react';
import { useStore } from '../../store/useStore';
import { 
  LayoutDashboard, Users, HeartPulse, ShoppingCart, 
  Briefcase, X, Settings, History, Send, Receipt, BellRing, ShieldAlert, Brain, ClipboardList, Coffee
} from 'lucide-react';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const Sidebar: React.FC = () => {
  const { user, activeTab, setActiveTab, isMobileMenuOpen, toggleMobileMenu, theme, notify } = useStore();

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
        { id: 'system-logs', label: 'Audit Logs', icon: <ShieldAlert size={18} /> },
        { id: 'shop', label: 'Uniform Shop', icon: <ShoppingCart size={18} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
      ];
    }

    if (role === 'SPECIALIST') {
      return [
        ...base,
        { id: 'my-students', label: 'My Students', icon: <Users size={18} /> },
        { id: 'clinical', label: 'Checklist', icon: <Brain size={18} /> },
        { id: 'clinical-logs', label: 'Task Analysis', icon: <History size={18} /> },
        { id: 'lounge', label: 'Teach Lounge', icon: <Coffee size={18} /> },
        { id: 'settings', label: 'My Profile', icon: <Settings size={18} /> },
      ];
    }

    if (role === 'PARENT' || role === 'STUDENT') {
      const items = [
        ...base,
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

  const handleNavClick = (id: string) => {
    if (id === 'lounge') {
      notify('info', 'Teach Lounge: Implementation in progress...', 3000);
      return;
    }
    setActiveTab(id);
    toggleMobileMenu(false);
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#154A70] dark:bg-slate-950 overflow-hidden">
      <div className="md:hidden flex justify-end p-3">
        <button onClick={() => toggleMobileMenu(false)} className="p-1.5 text-white/60 hover:text-rose-400 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="px-5 py-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-2 shadow-sm">
            <img src={LogoImg} alt="Logo" className="w-full h-auto" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-white leading-none uppercase tracking-tighter">Motion Max</span>
            <span className="text-[7px] font-bold text-blue-200 dark:text-blue-400 uppercase tracking-[0.3em] mt-1">Day Services</span>
          </div>
        </div>

        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-white text-[#154A70] overflow-hidden flex items-center justify-center font-bold text-xs shadow-inner border-2 border-white shrink-0 uppercase">
            {user?.avatar ? (
              <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
            ) : (
              user?.name?.[0] || 'U'
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-[13px] font-bold text-white leading-none truncate uppercase">
              {user?.name?.split(' ')[0]}
            </p>
            <span className="text-[8px] font-black uppercase text-blue-200 tracking-widest mt-1">
              {user?.role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 mb-3">
        <div className="h-px bg-white/10 w-full" />
      </div>

      <nav className="flex-1 flex flex-col px-3 space-y-1 overflow-y-auto sidebar-scrollbar pb-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-4 px-4 py-2 text-[13px] font-bold transition-all rounded-xl group relative ${
                isActive 
                  ? 'bg-white text-[#154A70] shadow-lg' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-[#154A70]' : 'text-white/60 group-hover:text-white'}`}>
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 19 })}
              </span>
              <span className="tracking-tight">{item.label}</span>
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 bg-[#154A70] rounded-full shadow-[0_0_8px_rgba(21,74,112,0.5)]" />
              )}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 text-center border-t border-white/10 opacity-40">
         <p className="text-[8px] font-bold text-white uppercase tracking-widest leading-none">BUILD 3.1.4</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className={`hidden md:flex w-64 border-r transition-colors duration-300 flex flex-col h-screen sticky top-0 ${theme === 'light' ? 'bg-[#154A70] border-slate-200' : 'bg-slate-950 border-white/5'}`}>{SidebarContent}</aside>
      <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => toggleMobileMenu(false)} />
        <aside className={`absolute inset-y-0 left-0 w-72 shadow-2xl transition-transform duration-500 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${theme === 'light' ? 'bg-[#154A70]' : 'bg-slate-950'}`}>{SidebarContent}</aside>
      </div>
    </>
  );
};
