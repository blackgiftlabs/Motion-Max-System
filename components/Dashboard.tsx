import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  Users, Activity, HeartPulse, ShoppingCart, 
  ChevronRight, ArrowUpRight, TrendingUp, Clock,
  FileText, ShieldAlert, Package, Search, Plus,
  UserPlus, BellRing, Settings, Send, Receipt, History, Zap,
  Filter, DollarSign, Target, Database, ShieldCheck, CalendarDays
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ActionCard = ({ label, icon: Icon, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 border border-ghBorder dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-googleBlue transition-all group active:scale-95 w-full text-center"
  >
    <div className={`p-2 rounded-lg ${color} bg-opacity-10 mb-2 group-hover:scale-110 transition-transform`}>
      <Icon size={18} className={color.replace('bg-', 'text-')} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-400 leading-tight">{label}</span>
  </button>
);

const StatBox = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 gh-box p-5 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        <h3 className="text-3xl font-black mt-2 text-ghText dark:text-white font-mono tracking-tighter">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-ghBorder dark:border-slate-700 ${color} group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-sm`}>
        <Icon size={22} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2 relative z-10">
      <span className="flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/50">
        <ArrowUpRight size={12} className="mr-0.5" /> {change}
      </span>
      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">v last month</span>
    </div>
    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
      <Icon size={120} />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { students, staff, clinicalLogs, user, setActiveTab, orders, applications, notices, settings, milestoneRecords } = useStore();
  const [tableSearch, setTableSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [chartRange, setChartRange] = useState<'7d' | '30d'>('7d');

  const processedGraphData = useMemo(() => {
    const days = chartRange === '7d' ? 7 : 30;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Count actual logs for this date
      const count = (clinicalLogs || []).filter(log => log.date.startsWith(dateStr)).length;
      
      data.push({
        name: d.toLocaleDateString(undefined, { 
          weekday: days === 7 ? 'short' : undefined, 
          day: 'numeric', 
          month: days === 30 ? 'short' : undefined 
        }),
        sessions: count,
        fullDate: dateStr
      });
    }
    return data;
  }, [clinicalLogs, chartRange]);

  const studentPerformanceList = useMemo(() => {
    return students.map(student => {
      const latestMilestone = milestoneRecords
        .filter(r => r.studentId === student.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      const balance = Math.max(0, settings.feesAmount - (student.totalPaid || 0));
      
      return {
        ...student,
        mastery: latestMilestone?.overallPercentage || 0,
        balance
      };
    });
  }, [students, milestoneRecords, settings.feesAmount]);

  const filteredStudents = studentPerformanceList.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(tableSearch.toLowerCase()) || s.id.toLowerCase().includes(tableSearch.toLowerCase());
    const matchesClass = classFilter === 'All' || s.assignedClass === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-8 animate-fade-up max-w-[1600px] mx-auto pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">System Entry Point</span>
          </div>
          <h1 className="text-4xl font-black text-ghText dark:text-white uppercase tracking-tighter leading-none">Management Center</h1>
          <p className="text-sm text-slate-500 mt-3 font-medium italic">Terminal active for {user?.name}. Global metrics are stable.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-ghBg dark:bg-slate-900 border border-ghBorder dark:border-slate-800 px-4 py-2 rounded-xl text-slate-500 shadow-sm">
          <Clock size={14} className="text-googleBlue" /> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </header>

      {/* 1. Quick Command Terminal */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
           <Zap size={14} className="text-amber-500 fill-amber-500" />
           <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Quick Commands</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <ActionCard label="Add Student" icon={UserPlus} color="bg-blue-600" onClick={() => setActiveTab('students')} />
          <ActionCard label="Hire Staff" icon={Users} color="bg-emerald-600" onClick={() => setActiveTab('staff')} />
          <ActionCard label="Clinical" icon={HeartPulse} color="bg-rose-600" onClick={() => setActiveTab('clinical')} />
          <ActionCard label="Announce" icon={BellRing} color="bg-indigo-600" onClick={() => setActiveTab('notices')} />
          <ActionCard label="Orders" icon={Receipt} color="bg-orange-600" onClick={() => setActiveTab('orders')} />
          <ActionCard label="Shop" icon={ShoppingCart} color="bg-purple-600" onClick={() => setActiveTab('shop')} />
          <ActionCard label="Audits" icon={ShieldAlert} color="bg-slate-700" onClick={() => setActiveTab('system-logs')} />
          <ActionCard label="Settings" icon={Settings} color="bg-blue-500" onClick={() => setActiveTab('settings')} />
        </div>
      </section>

      {/* 2. KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox title="Enrolled Students" value={students.length} change="12%" icon={Users} color="text-googleBlue" />
        <StatBox title="Session Notes" value={clinicalLogs.length} change="8%" icon={Activity} color="text-indigo-600" />
        <StatBox title="Active Staff" value={staff.length} change="2%" icon={ShieldAlert} color="text-emerald-600" />
        <StatBox title="Stock Value" value={`$${(orders.length * 125).toLocaleString()}`} change="5%" icon={Package} color="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Main Progress Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-ghBorder dark:border-slate-800 flex flex-col shadow-sm rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-ghBorder dark:border-slate-800 bg-ghBg/50 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-googleBlue" />
              <h3 className="text-sm font-black uppercase tracking-widest text-ghText dark:text-white">Activity Growth</h3>
            </div>
            
            {/* Range Selector - GitHub Style Segmented Control */}
            <div className="flex items-center bg-ghBg dark:bg-slate-800 p-1 rounded-xl border border-ghBorder dark:border-slate-700">
               <button 
                onClick={() => setChartRange('7d')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${chartRange === '7d' ? 'bg-white dark:bg-slate-700 text-googleBlue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <CalendarDays size={14} /> 7 Days
               </button>
               <button 
                onClick={() => setChartRange('30d')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${chartRange === '30d' ? 'bg-white dark:bg-slate-700 text-googleBlue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <CalendarDays size={14} /> 30 Days
               </button>
            </div>
          </div>
          
          <div className="p-8 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedGraphData}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1a73e8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d0d7de33" />
                <XAxis 
                  dataKey="name" 
                  stroke="#57606a" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontWeight: 800 }} 
                  interval={chartRange === '30d' ? 4 : 0}
                />
                <YAxis stroke="#57606a" fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: 800 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }} 
                  labelClassName="text-googleBlue"
                />
                <Area type="monotone" dataKey="sessions" stroke="#1a73e8" strokeWidth={3} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Notification Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-ghBorder dark:border-slate-800 flex flex-col shadow-sm rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-ghBorder dark:border-slate-800 bg-ghBg/50 dark:bg-slate-950/50">
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">System Feed</h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'New Careers', value: applications.filter(a => a.status === 'Pending').length, icon: Send, color: 'text-amber-500', tab: 'applications' },
                { label: 'Pending Orders', value: orders.filter(o => o.status === 'Uncollected').length, icon: Receipt, color: 'text-blue-500', tab: 'orders' },
                { label: 'Notice Board', value: notices.length, icon: BellRing, color: 'text-emerald-500', tab: 'notices' },
                { label: 'System Errors', value: 0, icon: ShieldAlert, color: 'text-rose-500', tab: 'system-logs' },
              ].map((log, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveTab(log.tab)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-ghBorder dark:border-slate-800 hover:bg-ghBg dark:hover:bg-slate-800 transition-all group shadow-sm active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 bg-slate-50 dark:bg-slate-950 border border-ghBorder dark:border-slate-800 rounded-lg group-hover:scale-110 transition-transform ${log.color}`}>
                      <log.icon size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{log.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{log.value}</span>
                     <ChevronRight size={12} className="text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Student Intelligence Ledger Table */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
             <Target size={18} className="text-googleBlue" />
             <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Intelligence Ledger</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-googleBlue" />
              <input 
                type="text" 
                placeholder="Filter ID or Name..." 
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-ghBorder dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-googleBlue transition-all w-full sm:w-64"
              />
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-ghBorder dark:border-slate-800 px-3 py-2 rounded-xl">
               <Filter size={14} className="text-slate-400" />
               <select 
                 value={classFilter}
                 onChange={e => setClassFilter(e.target.value)}
                 className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-slate-700 dark:text-slate-400"
               >
                 <option value="All">All Classes</option>
                 {(settings?.classes || []).map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-ghBorder dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-ghBg/50 dark:bg-slate-950/50 border-b border-ghBorder dark:border-slate-800 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <tr>
                       <th className="px-8 py-5">System ID / Student</th>
                       <th className="px-8 py-5">Assigned Class</th>
                       <th className="px-8 py-5 text-center">Milestone Growth</th>
                       <th className="px-8 py-5">Fees Paid</th>
                       <th className="px-8 py-5">Outstanding</th>
                       <th className="px-8 py-5 text-right">System Entry</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center">
                           <Database size={48} className="mx-auto text-slate-100 mb-4" />
                           <p className="text-[10px] font-black uppercase text-slate-300 italic tracking-widest">No matching entry found</p>
                        </td>
                      </tr>
                    ) : filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/5 group transition-colors cursor-pointer" onClick={() => setActiveTab('students')}>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-googleBlue flex items-center justify-center font-black text-xs uppercase shadow-sm">
                                  {student.fullName[0]}
                               </div>
                               <div>
                                  <p className="text-[11px] font-black uppercase tracking-tight text-slate-950 dark:text-white leading-none">{student.fullName}</p>
                                  <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-widest">{student.id}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase border border-slate-200 dark:border-slate-700 text-slate-500">
                               {student.assignedClass}
                            </span>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-3">
                               <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-1000 ${student.mastery > 75 ? 'bg-emerald-500' : student.mastery > 40 ? 'bg-googleBlue' : 'bg-amber-500'}`} 
                                    style={{ width: `${student.mastery}%` }}
                                  />
                               </div>
                               <span className="text-[10px] font-black font-mono text-slate-700 dark:text-slate-400">{student.mastery}%</span>
                            </div>
                         </td>
                         <td className="px-8 py-6 font-black font-mono text-[13px] text-emerald-600">
                            ${(student.totalPaid || 0).toLocaleString()}
                         </td>
                         <td className="px-8 py-6">
                            <span className={`text-[13px] font-black font-mono ${student.balance > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                               ${student.balance.toLocaleString()}
                            </span>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-googleBlue group-hover:text-white transition-all shadow-sm">
                               <ChevronRight size={18} />
                            </button>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <div className="p-8 bg-ghBg/30 dark:bg-slate-950/30 border-t border-ghBorder dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                 <ShieldCheck size={16} className="text-emerald-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Verified Database Sync</span>
              </div>
              <p className="text-[9px] font-mono text-slate-400 uppercase">{filteredStudents.length} Active Records Tracked</p>
           </div>
        </div>
      </section>
    </div>
  );
};