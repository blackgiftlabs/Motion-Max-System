
import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { 
  Users, Activity, Bell, Settings, Search, 
  ArrowUpDown, Clock, Target,
  ChevronRight, Brain, History, Zap
} from 'lucide-react';

const QuickAction = ({ label, icon: Icon, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all group active:scale-95 w-full"
  >
    <div className={`p-2 rounded-lg ${color} bg-opacity-10 mb-2 group-hover:scale-110 transition-transform`}>
      <Icon size={18} className={color.replace('bg-', 'text-')} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-tight text-slate-900 dark:text-slate-400 text-center leading-tight px-1">{label}</span>
  </button>
);

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
    <div className="relative z-10">
      <div className={`w-9 h-9 rounded-lg ${color} bg-opacity-10 flex items-center justify-center mb-3`}>
        <Icon size={18} className={color.replace('bg-', 'text-')} />
      </div>
      <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">{title}</p>
      <h3 className="text-xl font-black mt-1 text-slate-950 dark:text-white tracking-tight leading-none">{value}</h3>
      <p className="text-[10px] text-slate-400 mt-2 font-medium italic truncate">{sub}</p>
    </div>
  </div>
);

const formatAge = (dob: string) => {
  const birth = new Date(dob);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 12) return `${months} MO`;
  const yrs = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths > 0 ? `${yrs}Y ${remainingMonths}M` : `${yrs}Y`;
};

const FloatingLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <g className="animate-bounce-slow">
      <rect x={x + width / 2 - 18} y={y - 30} width="36" height="20" rx="5" fill="currentColor" className="text-slate-900 dark:text-white" />
      <text x={x + width / 2} y={y - 17} fill="currentColor" className="text-white dark:text-slate-950" textAnchor="middle" fontSize="9" fontWeight="900">{value}%</text>
      <path d={`M${x + width / 2 - 3},${y - 10} L${x + width / 2},${y - 6} L${x + width / 2 + 3},${y - 10} Z`} fill="currentColor" className="text-slate-900 dark:text-white" />
    </g>
  );
};

type SortKey = 'name' | 'age' | 'growth';

export const TherapistDashboard: React.FC = () => {
  const { theme, students, staff, user, setActiveTab, milestoneRecords, settings, toggleNotices, setSelectedStudentIdForLog } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const myStudents = useMemo(() => {
    const currentStaff = staff.find(st => st.id === user?.id);
    return students.filter(s => currentStaff?.assignedClasses?.includes(s.assignedClass) && s.assignedStaffId === user?.id);
  }, [students, user, staff]);

  const performanceData = useMemo(() => {
    return myStudents.map(student => {
      const studentMilestones = milestoneRecords.filter(r => r.studentId === student.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const latest = studentMilestones[0];
      const allTasks = latest?.sections.flatMap(s => s.items) || [];
      const achieved = allTasks.filter(t => t.checked).length;
      const failed = allTasks.filter(t => !t.checked).length;
      return {
        id: student.id,
        name: student.fullName,
        firstName: student.firstName,
        lastName: student.lastName,
        achieved,
        failed,
        growth: latest?.overallPercentage || 0,
        paid: student.totalPaid || 0,
        outstanding: Math.max(0, settings.feesAmount - (student.totalPaid || 0)),
        ageLabel: formatAge(student.dob),
        ageMonths: ((new Date()).getFullYear() - (new Date(student.dob)).getFullYear()) * 12 + ((new Date()).getMonth() - (new Date(student.dob)).getMonth()),
        class: student.assignedClass
      };
    });
  }, [myStudents, milestoneRecords, settings.feesAmount]);

  const filteredAndSorted = useMemo(() => {
    let data = performanceData.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
    data.sort((a, b) => {
      let valA: any, valB: any;
      if (sortKey === 'name') { valA = a.firstName.toLowerCase(); valB = b.firstName.toLowerCase(); }
      else if (sortKey === 'age') { valA = a.ageMonths; valB = b.ageMonths; }
      else { valA = a.growth; valB = b.growth; }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [performanceData, searchTerm, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) { setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }
    else { setSortKey(key); setSortDir('asc'); }
  };

  const axisColor = theme === 'dark' ? '#fff' : '#000';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <div className="animate-in fade-in duration-700 mt-[-1.5rem]">
      <style>{`
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>

      {/* Header section starts closer to the top */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Teacher Portal</h1>
          <p className="text-[11px] text-slate-500 font-bold mt-2 uppercase tracking-widest italic opacity-70">Node: {user?.name} // Class Overview</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="pr-4 border-r border-slate-100 dark:border-slate-800 text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Date</p>
              <p className="text-[10px] font-black text-slate-950 dark:text-white font-mono uppercase">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
           </div>
           <Clock size={16} className="text-emerald-500" />
        </div>
      </header>

      {/* Grid container with tighter spacing */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction label="Track Milestones" icon={Brain} color="bg-emerald-600" onClick={() => setActiveTab('clinical')} />
          <QuickAction label="Daily Notes" icon={History} color="bg-blue-600" onClick={() => setActiveTab('clinical-logs')} />
          <QuickAction label="Notice Board" icon={Bell} color="bg-indigo-600" onClick={() => toggleNotices(true)} />
          <QuickAction label="Account" icon={Settings} color="bg-slate-600" onClick={() => setActiveTab('settings')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="My Students" value={myStudents.length.toString()} sub="Total assigned" icon={Users} color="bg-blue-500" />
          <StatCard title="Average Mastery" value={`${myStudents.length > 0 ? Math.round(performanceData.reduce((a,b)=>a+b.growth,0)/(performanceData.length||1)) : 0}%`} sub="Class success rate" icon={Target} color="bg-emerald-500" />
          <StatCard title="Active Targets" value={performanceData.reduce((a,b)=>a+b.failed,0).toString()} sub="Goals remaining" icon={Zap} color="bg-orange-500" />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white">Mastery Matrix</h3>
              <span className="text-[9px] font-mono text-slate-400">CLASS_DATA_NODE_v3</span>
            </div>
            <div className="p-4 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 30, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: axisColor, fontWeight: '800' }} interval={0} angle={-30} textAnchor="end" />
                  <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} tick={{ fill: axisColor, fontWeight: '800' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', border: 'none', borderRadius: '8px', fontSize: '10px', fontWeight: '900', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="growth" radius={[4, 4, 0, 0]} barSize={32}>
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.growth > 75 ? '#10b981' : entry.growth > 40 ? '#3b82f6' : '#f59e0b'} />
                    ))}
                    <LabelList dataKey="growth" content={<FloatingLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white">Registry Explorer</h3>
              <div className="relative group w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Filter names..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] font-bold outline-none" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4 cursor-pointer hover:text-blue-600 group" onClick={() => toggleSort('name')}>
                      <div className="flex items-center gap-1">Student <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100" /></div>
                    </th>
                    <th className="px-4 py-4">State</th>
                    <th className="px-4 py-4 cursor-pointer hover:text-blue-600 group" onClick={() => toggleSort('growth')}>
                      <div className="flex items-center gap-1">Mastery <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100" /></div>
                    </th>
                    <th className="px-4 py-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredAndSorted.length === 0 ? (
                    <tr><td colSpan={4} className="py-12 text-center font-bold text-slate-300 uppercase text-[10px] italic">No records.</td></tr>
                  ) : filteredAndSorted.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs uppercase dark:text-white leading-none">{p.firstName} {p.lastName}</span>
                          <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase">{p.id} // {p.ageLabel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${p.growth > 75 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                          <span className="text-[9px] font-black uppercase text-slate-500">{p.growth > 75 ? 'Stable' : 'In-Progress'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                         <div className="flex items-center gap-2">
                           <span className="text-xs font-black text-blue-600 font-mono">{p.growth}%</span>
                           <div className="w-8 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                             <div className="h-full bg-blue-500" style={{ width: `${p.growth}%` }} />
                           </div>
                         </div>
                      </td>
                      <td className="px-4 py-4 text-right pr-6">
                        <button 
                          onClick={() => { setSelectedStudentIdForLog(p.id); setActiveTab('clinical'); }}
                          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 dark:border-blue-800"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
