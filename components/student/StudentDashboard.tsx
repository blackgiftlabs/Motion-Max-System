
import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  DollarSign, Activity, Brain, ChevronRight, Target, 
  CreditCard, Bell, BadgeCheck, X, Send, FileSpreadsheet, MessageSquarePlus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

export const StudentDashboard: React.FC = () => {
  const { user, students, parents, settings, milestoneRecords, clinicalLogs, notices, replyToNotice, setActiveTab, theme, toggleNotices } = useStore();
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  
  const studentProfile = useMemo(() => {
    if (user?.role === 'STUDENT') return students.find(s => s.firebaseUid === user.id);
    if (user?.role === 'PARENT') {
      const parentProfile = parents.find(p => p.firebaseUid === user.id);
      return parentProfile ? students.find(s => s.id === parentProfile.studentId) : null;
    }
    return null;
  }, [user, students, parents]);

  const studentMilestones = useMemo(() => studentProfile ? milestoneRecords.filter(r => r.studentId === studentProfile.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [], [milestoneRecords, studentProfile]);
  const studentLogs = useMemo(() => studentProfile ? clinicalLogs.filter(l => l.studentId === studentProfile.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [], [clinicalLogs, studentProfile]);

  const activityPulseData = useMemo(() => {
    if (!studentProfile) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((m, idx) => ({ name: m, sessions: studentLogs.filter(l => new Date(l.date).getMonth() === idx).length }));
  }, [studentLogs, studentProfile]);

  const weeklyGrid = useMemo(() => {
    if (!studentProfile) return [];
    const days = [];
    const mon = new Date(); mon.setDate(mon.getDate() - mon.getDay() + 1);
    for (let i = 0; i < 5; i++) {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      days.push({
        date: ds,
        day: d.toLocaleDateString('en-US', { weekday: 'long' }),
        analysis: studentLogs.filter(l => l.date.split('T')[0] === ds).length,
        checks: studentMilestones.filter(m => m.timestamp.split('T')[0] === ds).length,
        speech: studentLogs.filter(l => l.date.split('T')[0] === ds).reduce((a,c) => a + (c.programRequests?.length || 0), 0)
      });
    }
    return days;
  }, [studentLogs, studentMilestones, studentProfile]);

  if (!studentProfile) return <div className="p-20 text-center font-black animate-pulse text-slate-900 uppercase">Registry Loading...</div>;

  const axisColor = theme === 'dark' ? '#ffffff' : '#000000';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-[1600px] mx-auto font-sans">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 shadow-sm border-2 border-slate-900">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center text-2xl font-black uppercase rounded-none overflow-hidden shadow-xl border-2 border-black">
            {studentProfile.imageUrl ? <img src={studentProfile.imageUrl} className="w-full h-full object-cover" alt={studentProfile.fullName} /> : studentProfile.firstName[0]}
          </div>
          <div>
            <h1 className="text-xl font-black text-black dark:text-white uppercase leading-none">{studentProfile.fullName}</h1>
            <p className="text-[10px] font-black text-black dark:text-white mt-1 uppercase tracking-widest">Parent Access Mode</p>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase text-black dark:text-white border-2 border-slate-900">Arrears: ${Math.max(0, settings.feesAmount - (studentProfile.totalPaid || 0))}</div>
           <button onClick={() => setActiveTab('fees')} className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase hover:bg-slate-950 transition-all shadow-sm border-2 border-slate-900">Pay Fees</button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/40 p-6 flex items-center gap-6 border-2 border-slate-900">
          <div className="p-3 bg-blue-600 text-white"><CreditCard size={20} /></div>
          <div><p className="text-[9px] font-black uppercase text-black dark:text-white">Total Tuition</p><h3 className="text-2xl font-black font-mono text-black dark:text-white">${settings.feesAmount}</h3></div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/40 p-6 flex items-center gap-6 border-2 border-slate-900">
          <div className="p-3 bg-emerald-600 text-white"><BadgeCheck size={20} /></div>
          <div><p className="text-[9px] font-black uppercase text-black dark:text-white">Amount Paid</p><h3 className="text-2xl font-black font-mono text-black dark:text-white">${studentProfile.totalPaid || 0}</h3></div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/40 p-6 flex items-center gap-6 border-2 border-slate-900">
          <div className="p-3 bg-purple-600 text-white"><Target size={20} /></div>
          <div><p className="text-[9px] font-black uppercase text-black dark:text-white">Growth Checks</p><h3 className="text-2xl font-black font-mono text-black dark:text-white">{studentMilestones.length}</h3></div>
        </div>
        <button onClick={() => toggleNotices(true)} className="bg-[#154A70] p-6 flex items-center gap-6 text-white text-left hover:bg-slate-950 transition-all border-2 border-slate-900">
          <div className="p-3 bg-white/10 text-white"><Bell size={20} /></div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase text-white/70">Broadcaster</p>
            <h3 className="text-sm font-black uppercase leading-tight truncate">{notices[0]?.title || 'No news'}</h3>
          </div>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-900 bg-slate-50/50 flex items-center justify-between">
           <div className="flex items-center gap-2"><Activity size={14} className="text-blue-600" /><h3 className="text-[10px] font-black uppercase text-black dark:text-white">Monthly Progress Pulse</h3></div>
        </div>
        <div className="p-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityPulseData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: axisColor }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: axisColor }} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '0', border: '2px solid black', fontSize: '10px', fontWeight: 'bold' }} />
              <Bar dataKey="sessions" fill="#154A70" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 overflow-hidden shadow-sm">
         <div className="p-6 border-b border-slate-900 bg-slate-50/50">
            <h3 className="text-sm font-black uppercase text-black dark:text-white">Weekly Progress Summary</h3>
            <p className="text-[10px] font-black text-black dark:text-white mt-1 uppercase tracking-widest">Records for current school week</p>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
               <thead className="bg-slate-100 dark:bg-slate-950 text-[10px] font-black uppercase text-black dark:text-white border-b border-slate-900">
                  <tr><th className="px-6 py-5">Day</th><th className="px-6 py-5 text-center">Milestones</th><th className="px-6 py-5 text-center">Lessons</th><th className="px-6 py-5 text-center">Communication</th><th className="px-6 py-5 text-right">View</th></tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {weeklyGrid.map(day => (
                    <tr key={day.date} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                       <td className="px-6 py-5"><p className="text-[12px] font-black uppercase text-black dark:text-white leading-none">{day.day}</p><p className="text-[9px] font-mono font-bold text-slate-400 mt-1 uppercase">{day.date}</p></td>
                       <td className="px-6 py-5 text-center"><span className={`px-3 py-1 text-[10px] font-black border-2 border-black ${day.checks > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-300'}`}>{day.checks} DONE</span></td>
                       <td className="px-6 py-5 text-center"><span className={`px-3 py-1 text-[10px] font-black border-2 border-black ${day.analysis > 0 ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-300'}`}>{day.analysis} LOGS</span></td>
                       <td className="px-6 py-5 text-center"><span className={`px-3 py-1 text-[10px] font-black border-2 border-black ${day.speech > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-300'}`}>{day.speech} TARGETS</span></td>
                       <td className="px-6 py-5 text-right"><button onClick={() => setActiveTab('students')} className="p-3 bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-blue-600 hover:text-white transition-all border border-black"><ChevronRight size={16}/></button></td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};
