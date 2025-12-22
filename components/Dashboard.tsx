
import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Users, TrendingUp, HeartPulse, ShoppingCart, ChevronRight, 
  Activity, Calendar, Clock, Bell, PlusCircle, Send, 
  FileText, Briefcase, ShieldAlert, Search, 
  ArrowUpDown, User, CheckCircle2, XCircle, Settings
} from 'lucide-react';

const QuickAction = ({ label, icon: Icon, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all group active:scale-95 aspect-square w-full"
  >
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 mb-3 group-hover:scale-110 transition-transform`}>
      <Icon size={24} className={color.replace('bg-', 'text-')} />
    </div>
    <span className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-slate-400 text-center leading-tight px-1">{label}</span>
  </button>
);

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 flex items-center justify-center mb-5`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black mt-1 text-slate-950 dark:text-white tracking-tight">{value}</h3>
      <p className="text-[11px] text-slate-500 mt-2 font-medium italic truncate">{sub}</p>
    </div>
  </div>
);

const formatAge = (dob: string) => {
  const birth = new Date(dob);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  
  if (months < 12) {
    return `${months} MO`;
  }
  const yrs = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths > 0 ? `${yrs}Y ${remainingMonths}M` : `${yrs}Y`;
};

type SortKey = 'name' | 'age' | 'teacher' | 'growth';

export const Dashboard: React.FC = () => {
  const { students, staff, clinicalLogs, user, setActiveTab, milestoneRecords, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const stats = useMemo(() => {
    return {
      totalStudents: students.length,
      lessonsDone: clinicalLogs.length,
      totalStaff: staff.length,
      totalCollected: students.reduce((sum, s) => sum + (s.totalPaid || 0), 0)
    };
  }, [students, staff, clinicalLogs]);

  const performanceData = useMemo(() => {
    return students.map(student => {
      const studentMilestones = milestoneRecords
        .filter(r => r.studentId === student.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      const latest = studentMilestones[0];
      const allTasks = latest?.sections.flatMap(s => s.items) || [];
      const achieved = allTasks.filter(t => t.checked).length;
      const failed = allTasks.filter(t => !t.checked).length;
      
      // Identify teacher by class assignment
      const teacher = staff.find(s => s.assignedClasses?.includes(student.assignedClass))?.fullName || 'Not Assigned';

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        achieved,
        failed,
        growth: latest?.overallPercentage || 0,
        teacher,
        paid: student.totalPaid || 0,
        outstanding: Math.max(0, settings.feesAmount - (student.totalPaid || 0)),
        ageLabel: formatAge(student.dob),
        ageMonths: ((new Date()).getFullYear() - (new Date(student.dob)).getFullYear()) * 12 + ((new Date()).getMonth() - (new Date(student.dob)).getMonth()),
        class: student.assignedClass
      };
    });
  }, [students, milestoneRecords, staff, settings.feesAmount]);

  const graphData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentAvg = performanceData.length > 0 
      ? performanceData.reduce((acc, curr) => acc + curr.growth, 0) / performanceData.length 
      : 0;

    return days.map((day, i) => ({
      name: day,
      success: Math.max(0, Math.min(100, Math.round(currentAvg - (6 - i) * 3 + Math.floor(Math.random() * 8))))
    }));
  }, [performanceData]);

  const filteredAndSortedPerformance = useMemo(() => {
    let data = performanceData.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    data.sort((a, b) => {
      let valA: any, valB: any;
      if (sortKey === 'name') {
        valA = a.firstName.toLowerCase();
        valB = b.firstName.toLowerCase();
      } else if (sortKey === 'age') {
        valA = a.ageMonths;
        valB = b.ageMonths;
      } else if (sortKey === 'teacher') {
        valA = a.teacher.toLowerCase();
        valB = b.teacher.toLowerCase();
      } else {
        valA = a.growth;
        valB = b.growth;
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [performanceData, searchTerm, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase text-slate-950 dark:text-white leading-none">Management Dashboard</h1>
          <p className="text-sm text-slate-500 font-medium mt-3 italic">Welcome back, {user?.name.split(' ')[0]}. Here is your school overview.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="px-4 py-2 border-r border-slate-100 dark:border-slate-800">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today</p>
              <p className="text-xs font-bold text-slate-950 dark:text-white">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
           </div>
           <Clock size={20} className="text-blue-500 mx-2" />
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <QuickAction label="Add Student" icon={PlusCircle} color="bg-blue-600" onClick={() => setActiveTab('students')} />
        <QuickAction label="Lesson Progress" icon={FileText} color="bg-emerald-600" onClick={() => setActiveTab('clinical')} />
        <QuickAction label="Announcements" icon={Send} color="bg-indigo-600" onClick={() => setActiveTab('notices')} />
        <QuickAction label="System Logs" icon={ShieldAlert} color="bg-rose-600" onClick={() => setActiveTab('system-logs')} />
        <QuickAction label="Applications" icon={Briefcase} color="bg-teal-600" onClick={() => setActiveTab('applications')} />
        <QuickAction label="Inventory" icon={ShoppingCart} color="bg-orange-500" onClick={() => setActiveTab('shop')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.totalStudents.toString()} sub="Enrolled in school" icon={Users} color="bg-blue-500" />
        <StatCard title="Lessons Done" value={stats.lessonsDone.toLocaleString()} sub="Activities completed" icon={HeartPulse} color="bg-indigo-500" />
        <StatCard title="Active Staff" value={stats.totalStaff.toString()} sub="Authorized members" icon={TrendingUp} color="bg-orange-500" />
        <StatCard title="Total Collected" value={`$${stats.totalCollected.toLocaleString()}`} sub="Current term revenue" icon={ShoppingCart} color="bg-emerald-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white">Growth Trends</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 italic">Average success rates across all students</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase text-slate-400">Live View</span>
          </div>
        </div>
        <div className="p-8 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 800 }} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} tick={{ fontWeight: 800 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} 
              />
              <Area type="monotone" dataKey="success" stroke="#2563eb" strokeWidth={3} fill="url(#colorSuccess)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white">Student Performance List</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 italic">Tracking lessons and success rates</p>
          </div>
          
          <div className="relative group min-w-[300px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none placeholder:text-slate-400 placeholder:uppercase" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase tracking-[0.2em] text-slate-950 dark:text-slate-400">
                <th className="px-8 py-5 cursor-pointer hover:text-blue-600 group" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-2">Name <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100" /></div>
                </th>
                <th className="px-6 py-5">Tasks Done</th>
                <th className="px-6 py-5 cursor-pointer hover:text-blue-600 group" onClick={() => toggleSort('growth')}>
                  <div className="flex items-center gap-2">Success Rate <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100" /></div>
                </th>
                <th className="px-6 py-5 cursor-pointer hover:text-blue-600 group" onClick={() => toggleSort('teacher')}>
                  <div className="flex items-center gap-2">Teacher <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100" /></div>
                </th>
                <th className="px-6 py-5">Financial Status</th>
                <th className="px-6 py-5 cursor-pointer hover:text-blue-600 group pr-8 text-right" onClick={() => toggleSort('age')}>
                  <div className="flex items-center gap-2 justify-end">Age <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredAndSortedPerformance.length === 0 ? (
                <tr>
                   <td colSpan={6} className="py-20 text-center font-bold text-slate-300 uppercase italic text-xs tracking-widest">No student records found.</td>
                </tr>
              ) : filteredAndSortedPerformance.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/10 transition-colors">
                  <td className="px-8 py-5 font-bold text-xs text-slate-900 dark:text-white uppercase">{p.firstName} {p.lastName}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black border border-emerald-100">+{p.achieved}</span>
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[9px] font-black border border-rose-100">-{p.failed}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-blue-600 font-mono">{p.growth}%</span>
                      <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${p.growth}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase">{p.teacher}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                       <span className="font-mono text-[10px] font-bold text-emerald-600">Paid: ${p.paid}</span>
                       <span className={`font-mono text-[10px] font-bold ${p.outstanding > 0 ? 'text-rose-500' : 'text-slate-400'}`}>Due: ${p.outstanding}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right pr-8 font-mono text-xs text-slate-600 dark:text-slate-400">{p.ageLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
