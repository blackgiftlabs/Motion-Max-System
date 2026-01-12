
import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Users, Activity, Bell, Settings, Clock, Target,
  Brain, History, Zap, MessageSquare
} from 'lucide-react';

const QuickAction = ({ label, icon: Icon, onClick, bg }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 p-5 ${bg} text-white border border-slate-900 rounded-none shadow-sm hover:brightness-110 active:scale-95 transition-all w-full`}
  >
    <div className="p-2 bg-white/20 rounded-none">
      <Icon size={20} />
    </div>
    <span className="text-[11px] font-black uppercase tracking-widest leading-none">{label}</span>
  </button>
);

const StatCard = ({ title, value, sub, icon: Icon, bg }: any) => (
  <div className={`${bg} text-white p-8 border border-slate-900 rounded-none flex items-center justify-between shadow-sm group`}>
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-80">{title}</p>
      <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
      <p className="text-[11px] font-bold italic opacity-70 border-l-2 border-white/30 pl-3 mt-4">{sub}</p>
    </div>
    <div className="w-16 h-16 bg-white/10 flex items-center justify-center rounded-none group-hover:scale-110 transition-transform">
      <Icon size={32} />
    </div>
  </div>
);

export const TherapistDashboard: React.FC = () => {
  const { theme, students, staff, user, setActiveTab, milestoneRecords, notify, toggleNotices } = useStore();

  const myStudents = useMemo(() => {
    const currentStaff = staff.find(st => st.id === user?.id);
    return students.filter(s => currentStaff?.assignedClasses?.includes(s.assignedClass) && s.assignedStaffId === user?.id);
  }, [students, user, staff]);

  const performanceData = useMemo(() => {
    return myStudents.map(student => {
      const studentMilestones = milestoneRecords.filter(r => r.studentId === student.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return {
        id: student.id,
        name: student.fullName,
        growth: studentMilestones[0]?.overallPercentage || 0,
      };
    });
  }, [myStudents, milestoneRecords]);

  const axisColor = theme === 'dark' ? '#fff' : '#000';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase text-slate-900 dark:text-white leading-none">Teacher Terminal</h1>
          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-[0.4em] italic">Authorized: {user?.name}</p>
        </div>
        <div className="bg-slate-900 text-white px-6 py-3 border border-slate-900 flex items-center gap-4">
           <p className="text-[10px] font-black uppercase font-mono">{new Date().toDateString()}</p>
           <Clock size={16} className="text-blue-400" />
        </div>
      </header>

      {/* 2 in a row Small Cards */}
      <div className="grid grid-cols-2 gap-2">
        <QuickAction label="Check Growth" icon={Brain} bg="bg-emerald-600" onClick={() => setActiveTab('clinical')} />
        <QuickAction label="Lesson Notes" icon={History} bg="bg-blue-600" onClick={() => setActiveTab('clinical-logs')} />
        <QuickAction label="Broadcaster" icon={Bell} bg="bg-purple-600" onClick={() => toggleNotices(true)} />
        <QuickAction label="Teach Lounge" icon={MessageSquare} bg="bg-amber-600" onClick={() => notify('info', 'Implementation in progress...', 3000)} />
      </div>

      {/* 1 in a row Stat Cards */}
      <div className="grid grid-cols-1 gap-2">
        <StatCard title="Assigned Nodes" value={myStudents.length.toString()} sub="Active students in your care" icon={Users} bg="bg-indigo-600" />
        <StatCard title="Classroom Mastery" value={`${Math.round(performanceData.reduce((a,b)=>a+b.growth,0)/(performanceData.length||1))}%`} sub="Average learner progress" icon={Target} bg="bg-cyan-600" />
        <StatCard title="Pending Goals" value="12" sub="Tasks awaiting marking today" icon={Zap} bg="bg-rose-600" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-900 p-8 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-slate-100 dark:border-slate-800">
           <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-[0.2em]">Class Analytics</h3>
           <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Live_Sync</span>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={{ stroke: axisColor }} tick={{ fontWeight: '900', fill: axisColor }} />
              <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={{ stroke: axisColor }} tick={{ fontWeight: '900', fill: axisColor }} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '0', border: '1px solid black', fontSize: '10px', fontWeight: '900' }} />
              <Bar dataKey="growth" fill="#1e293b" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
