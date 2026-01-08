import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { NAV_ITEMS } from '../constants';
import { Menu, X, LogOut, Bell, Search, Command, Settings, ChevronRight } from 'lucide-react';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, activeTab, setActiveTab, logout } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredNavItems = NAV_ITEMS.filter(item => 
    !user || item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-ghText font-sans">
      {/* Top Header - Google Style */}
      <header className="h-16 border-b border-ghBorder flex items-center justify-between px-4 md:px-8 sticky top-0 bg-white z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <img src={LogoImg} alt="M" className="h-8 w-auto" />
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-lg leading-none tracking-tight">Motion Max</span>
              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest mt-1">Management</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-xl px-4 hidden md:block">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-googleBlue" />
            <input 
              type="text" 
              placeholder="Search school databases..." 
              className="w-full bg-ghBg border border-ghBorder rounded-md py-1.5 pl-10 pr-12 text-sm focus:bg-white focus:ring-2 focus:ring-googleBlue/20 focus:border-googleBlue outline-none transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 border border-ghBorder bg-white rounded px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
              <Command size={10} className="inline mr-1" /> K
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-googleBlue rounded-full border-2 border-white"></span>
          </button>
          <div className="h-8 w-px bg-ghBorder mx-2 hidden sm:block"></div>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-bold leading-none">{user?.name}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">{user?.role.replace('_', ' ')}</p>
            </div>
            <img src={user?.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-ghBorder" />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - GitHub Style */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-ghBg border-r border-ghBorder transform transition-transform duration-300 md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
              <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Portal Navigation</p>
              {filteredNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${activeTab === item.id 
                      ? 'bg-white border border-ghBorder text-ghText shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-200/50'
                    }
                  `}
                >
                  <span className={activeTab === item.id ? 'text-googleBlue' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  {item.label}
                  {activeTab === item.id && <ChevronRight size={14} className="ml-auto opacity-40" />}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-ghBorder bg-slate-100/50">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-white p-6 md:p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};