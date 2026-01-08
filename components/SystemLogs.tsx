
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ShieldAlert, Search, Clock, User, ArrowLeft, Terminal, Database } from 'lucide-react';

export const SystemLogs: React.FC = () => {
  const { systemLogs, setActiveTab } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('All');

  const filteredLogs = useMemo(() => {
    return systemLogs.filter(log => {
      const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = filterAction === 'All' || log.action === filterAction;
      return matchesSearch && matchesAction;
    });
  }, [systemLogs, searchTerm, filterAction]);

  // Fix: Explicitly type uniqueActions as string[] to avoid 'unknown' type errors in .map()
  const uniqueActions = useMemo<string[]>(() => {
    const actions = new Set(systemLogs.map(l => l.action));
    return ['All', ...Array.from(actions)];
  }, [systemLogs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-blue-600 shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={18} className="text-rose-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">System Activity</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight uppercase dark:text-white leading-none">System Logs</h1>
            <p className="text-sm text-slate-500 font-medium mt-3 italic">Tracking all user actions, logins, and records.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group min-w-[300px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none" 
            />
          </div>
          <select 
            value={filterAction} 
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase outline-none cursor-pointer"
          >
            {uniqueActions.map(action => <option key={action} value={action}>{action}</option>)}
          </select>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="p-4 md:p-8 space-y-4">
           <div className="hidden md:grid grid-cols-12 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="col-span-3">Date & Time</div>
              <div className="col-span-2">User</div>
              <div className="col-span-2">Action Type</div>
              <div className="col-span-5">Activity Details</div>
           </div>
           
           <div className="space-y-4 md:space-y-0 md:divide-y md:divide-slate-50 md:dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <div className="py-24 text-center">
                  <Terminal size={48} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-[10px] font-black uppercase text-slate-300">No logs found.</p>
                </div>
              ) : filteredLogs.map((log) => (
                <div key={log.id} className="p-6 md:p-0 md:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 md:bg-transparent dark:bg-slate-950/40 md:dark:bg-transparent rounded-3xl md:rounded-none hover:bg-slate-100/30 transition-colors">
                   <div className="col-span-1 md:col-span-3">
                      <div className="flex items-center gap-3">
                         <Clock size={14} className="text-blue-500 md:hidden" />
                         <p className="text-[11px] font-bold dark:text-white">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                   </div>
                   
                   <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-slate-300" />
                        <span className="text-[11px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{log.userName}</span>
                      </div>
                   </div>

                   <div className="col-span-1 md:col-span-2">
                      <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase border border-slate-100 dark:border-slate-700 text-blue-600">
                         {log.action}
                      </span>
                   </div>

                   <div className="col-span-1 md:col-span-5">
                      <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 italic">
                         "{log.details}"
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </div>
        
        <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div className="flex items-center gap-4 text-slate-400">
              <Database size={18} className="text-blue-500" />
              <p className="text-[9px] font-black uppercase tracking-widest">Official Audit Record</p>
           </div>
           <p className="text-[9px] font-mono text-slate-400 uppercase">{filteredLogs.length} Entries</p>
        </div>
      </div>
    </div>
  );
};
