
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { NAV_ITEMS } from '../constants';
import { Menu, X, Sun, Moon, LogOut, ChevronRight, Bell, Search, Command, LayoutGrid } from 'lucide-react';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme, user, activeTab, setActiveTab, logout } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const filteredNavItems = NAV_ITEMS.filter(item => 
    !user || item.roles.includes(user.role)
  );

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans`}>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-[100] h-16 shadow-sm">
        <div className="flex items-center gap-2">
          <img src={LogoImg} alt="M" className="h-8 w-auto dark:invert" />
          <div className="flex flex-col">
            <span className="font-black text-base tracking-tight uppercase leading-none">Motion Max</span>
            <span className="text-[6px] font-bold uppercase tracking-[0.35em] text-slate-500 mt-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>Day Services</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleTheme} className="p-2 text-slate-500">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg ml-1">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 md:w-64 bg-white dark:bg-slate-900 border-r-2 border-slate-200 dark:border-slate-800 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-none'}
      `}>
        <div className="h-full flex flex-col pt-20 md:pt-0">
          <div className="hidden md:flex flex-col items-center p-8 pb-4">
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center p-2 shadow-lg shadow-blue-500/20">
                 <img src={LogoImg} alt="Motion Max" className="w-full h-auto brightness-0 invert" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-tight leading-none uppercase text-slate-900 dark:text-white">Motion Max</span>
                <span className="text-[7px] uppercase font-bold tracking-[0.4em] text-slate-500 dark:text-slate-400 mt-1.5" style={{ fontFamily: 'Arial, sans-serif' }}>Day Services</span>
              </div>
            </div>
          </div>

          <div className="px-6 md:mt-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-1.5 flex gap-1 border-2 border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'light' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Sun size={12} /> Light
              </button>
              <button 
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-slate-700 shadow-sm text-blue-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Moon size={12} /> Dark
              </button>
            </div>
          </div>

          <nav className="flex-1 px-4 mt-8 space-y-1.5 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-[10px] font-black text-black dark:text-slate-500 uppercase tracking-[0.25em] mb-4">Main Menu</p>
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-bold uppercase tracking-tight transition-all group
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                  }
                `}
              >
                <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t-2 border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-inner">
                <img src={user?.avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate text-slate-900 dark:text-white uppercase tracking-tight">{user?.name}</p>
                <p className="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">{user?.role.replace('_', ' ')}</p>
              </div>
              <button 
                onClick={logout}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950">
        {/* Desktop Navbar */}
        <div className="hidden md:flex h-20 items-center justify-between px-5 bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-4 bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 px-5 py-2.5 rounded-2xl w-[520px] group transition-all focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500/50">
            <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search school records..." 
              className="bg-transparent border-none text-[13px] font-bold focus:ring-0 w-full outline-none placeholder:text-slate-400 placeholder:uppercase"
            />
            <div className="flex items-center gap-1.5 text-[10px] border border-slate-300 dark:border-slate-700 px-2 py-1 rounded-xl text-slate-400 font-mono font-bold bg-white dark:bg-slate-800 shadow-sm">
              <Command size={10} /> <span>K</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Status: Online</span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">VERSION 3.1</span>
            </div>
            
            <div className="flex items-center gap-3 pl-6 border-l-2 border-slate-200 dark:border-slate-800">
               <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                 <Bell size={20} />
                 <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-4 ring-white dark:ring-slate-900 animate-bounce"></span>
               </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto pb-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
