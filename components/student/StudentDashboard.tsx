
import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  DollarSign, Activity, ChevronRight, Target, 
  CreditCard, Bell, BadgeCheck, X, FileSpreadsheet, 
  FileText, ArrowLeft, UserCircle, HeartPulse, User
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { PersonalInfo } from '../student-profile/PersonalInfo';
import { HealthRecord } from '../student-profile/HealthRecord';
import { PerformanceMatrix } from '../student-profile/PerformanceMatrix';
import { PaymentLedger } from '../student-profile/PaymentLedger';

export const StudentDashboard: React.FC = () => {
  const { user, students, parents, settings, milestoneRecords, clinicalLogs, notices, setActiveTab, theme, toggleNotices, staff } = useStore();
  const [showProfile, setShowProfile] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'personal' | 'health' | 'records' | 'payments'>('personal');
  
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
    const now = new Date();
    const currentDay = now.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    const mon = new Date(now);
    mon.setDate(now.getDate() + diff);

    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      days.push({
        date: ds,
        day: d.toLocaleDateString('en-US', { weekday: 'long' }),
        lessons: studentLogs.filter(l => l.date.split('T')[0] === ds).length,
        checks: studentMilestones.filter(m => m.timestamp.split('T')[0] === ds).length,
        isToday: ds === today
      });
    }
    // Sort so Today is at the top, then descending order
    return days.sort((a, b) => {
      if (a.isToday) return -1;
      if (b.isToday) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [studentLogs, studentMilestones, studentProfile]);

  const profileTabs = [
    { id: 'personal', label: 'Info', icon: <UserCircle size={18} /> },
    { id: 'health', label: 'Health', icon: <HeartPulse size={18} /> },
    { id: 'records', label: 'History', icon: <Activity size={18} /> },
    { id: 'payments', label: 'Fees', icon: <CreditCard size={18} /> }
  ];

  if (!studentProfile) return <div className="p-20 text-center font-black animate-pulse text-slate-900 uppercase tracking-widest">Syncing Records...</div>;

  const axisColor = theme === 'dark' ? '#ffffff' : '#000000';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16 max-w-[1600px] mx-auto px-2 font-sans">
      <header className="bg-white dark:bg-slate-900 p-6 border-2 border-slate-900 rounded-none flex flex-col md:flex-row items-center justify-between gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-20 h-20 bg-slate-900 text-white flex items-center justify-center text-3xl font-black uppercase rounded-none overflow-hidden border-4 border-white dark:border-slate-800">
            {studentProfile.imageUrl ? <img src={studentProfile.imageUrl} className="w-full h-full object-cover" alt="" /> : studentProfile.firstName[0]}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-black text-ghText dark:text-white uppercase leading-none truncate">{studentProfile.fullName}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">ID: {studentProfile.id} • {studentProfile.assignedClass}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
           <button onClick={() => setShowProfile(true)} className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all rounded-none border-b-4 border-slate-700 active:border-b-0 active:translate-y-1">
              My Profile
           </button>
           <button onClick={() => setActiveTab('clinical-history')} className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all rounded-none border-b-4 border-blue-800 active:border-b-0 active:translate-y-1">
              Full Report
           </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Term Fees', val: `$${settings.feesAmount}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50/50' },
          { label: 'Total Paid', val: `$${studentProfile.totalPaid || 0}`, icon: BadgeCheck, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
          { label: 'Current Balance', val: `$${Math.max(0, settings.feesAmount - (studentProfile.totalPaid || 0))}`, icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50/50' },
          { label: 'Lessons', val: studentLogs.length, icon: FileSpreadsheet, color: 'text-purple-600', bg: 'bg-purple-50/50' },
        ].map((stat, i) => (
          <div key={i} className={`p-5 border-2 border-slate-900 rounded-none bg-white dark:bg-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
            <div className={`p-2 w-fit mb-3 ${stat.bg} ${stat.color} rounded-none border border-slate-900/10`}><stat.icon size={18} /></div>
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
            <p className="text-lg font-black font-mono text-slate-900 dark:text-white leading-none">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Progress - Fixed for Mobile Width */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
           <header className="p-6 border-b-2 border-slate-900 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
              <div>
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Week Overview</h3>
                 <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Today shown at top</p>
              </div>
           </header>
           
           <div className="divide-y-2 divide-slate-900">
              {weeklyGrid.map(day => (
                <div key={day.date} className={`flex items-center justify-between p-5 transition-all ${day.isToday ? 'bg-blue-50/40 dark:bg-blue-900/10' : 'hover:bg-slate-50'}`}>
                   <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-12 h-12 border-2 border-slate-900 flex flex-col items-center justify-center rounded-none font-black ${day.isToday ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400'}`}>
                         <span className="text-base leading-none">{new Date(day.date).getDate()}</span>
                         <span className="text-[7px] uppercase mt-1 tracking-tighter">{day.day.substring(0,3)}</span>
                      </div>
                      <div className="min-w-0">
                         <p className={`text-xs font-black uppercase tracking-tight truncate ${day.isToday ? 'text-blue-600' : 'text-slate-900 dark:text-white'}`}>{day.day} {day.isToday && ' (TODAY)'}</p>
                         <p className="text-[8px] font-mono font-bold text-slate-400 mt-1 uppercase">{day.date}</p>
                      </div>
                   </div>

                   <div className="flex gap-4 shrink-0">
                      <div className="flex flex-col items-center">
                         <span className="text-xs font-black font-mono leading-none">{day.lessons}</span>
                         <span className="text-[7px] font-black uppercase text-slate-400 mt-1">Lessons</span>
                      </div>
                      <div className="flex flex-col items-center">
                         <span className="text-xs font-black font-mono leading-none">{day.checks}</span>
                         <span className="text-[7px] font-black uppercase text-slate-400 mt-1">Checks</span>
                      </div>
                      <button onClick={() => setActiveTab('clinical-history')} className="p-2 border-2 border-slate-900 rounded-none text-slate-400 hover:text-blue-600"><ChevronRight size={14}/></button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Chart Area */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-none p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
           <h3 className="text-[11px] font-black uppercase tracking-widest mb-8 text-slate-900 dark:text-white flex items-center gap-2 border-b-2 border-slate-100 pb-3">
              <Activity size={14} className="text-blue-600" /> Learning Pulse
           </h3>
           <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityPulseData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" stroke={axisColor} axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'black', fill: axisColor }} />
                  <YAxis stroke={axisColor} axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'black', fill: axisColor }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '0px', border: '2px solid #000', fontSize: '9px', fontWeight: 'black' }} />
                  <Bar dataKey="sessions" fill="#2563eb" radius={0} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Profile Modal with Labels */}
      {showProfile && (
        <div className="fixed inset-0 z-[10000] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
          <header className="p-4 border-b-2 border-slate-900 flex items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <button onClick={() => setShowProfile(false)} className="p-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 text-slate-500 active:scale-90 flex items-center gap-2">
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-sm font-black uppercase text-slate-950 dark:text-white leading-none truncate">My Profile</h2>
            </div>
            <button onClick={() => setShowProfile(false)} className="p-2 text-slate-400"><X size={24} /></button>
          </header>

          <div className="flex bg-slate-100 dark:bg-slate-900 border-b-2 border-slate-900 p-0 overflow-x-hidden">
            {profileTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveProfileTab(tab.id as any)} className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 transition-all border-b-4 ${activeProfileTab === tab.id ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-blue-500 border-slate-900' : 'text-slate-400 border-transparent'}`}>
                {tab.icon}
                <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white dark:bg-slate-950 overflow-y-auto">
            <div className="max-w-5xl mx-auto w-full p-6 pb-20 animate-in fade-in duration-300">
              {activeProfileTab === 'personal' && <PersonalInfo student={studentProfile} isEditing={false} editForm={{}} setEditForm={() => {}} staff={staff} settings={settings} isAdmin={false} />}
              {activeProfileTab === 'health' && <HealthRecord student={studentProfile} isEditing={false} editForm={{}} setEditForm={() => {}} onViewPdf={() => {}} onUploadPdf={() => {}} />}
              {activeProfileTab === 'records' && <PerformanceMatrix student={studentProfile} logs={studentLogs} milestones={studentMilestones} filter="Weekly" setFilter={() => {}} onOpenDay={() => {}} />}
              {activeProfileTab === 'payments' && <PaymentLedger totalPaid={studentProfile.totalPaid || 0} balance={Math.max(0, settings.feesAmount - (studentProfile.totalPaid || 0))} payments={[]} borderClass="border-slate-900" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
