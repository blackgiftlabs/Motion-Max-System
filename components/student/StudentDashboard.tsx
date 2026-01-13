
import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { 
  DollarSign, Activity, Brain, ChevronRight, Target, 
  CreditCard, Bell, BadgeCheck, X, Send, FileSpreadsheet, 
  MessageSquarePlus, FileText, Download, Calendar, User, ArrowLeft, UserCircle, HeartPulse
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
    const days = [];
    const now = new Date();
    const currentDay = now.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    const mon = new Date(now);
    mon.setDate(now.getDate() + diff);

    for (let i = 0; i < 5; i++) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      days.push({
        date: ds,
        day: d.toLocaleDateString('en-US', { weekday: 'long' }),
        lessons: studentLogs.filter(l => l.date.split('T')[0] === ds).length,
        checks: studentMilestones.filter(m => m.timestamp.split('T')[0] === ds).length,
      });
    }
    return days;
  }, [studentLogs, studentMilestones, studentProfile]);

  const profileTabs = [
    { id: 'personal', label: 'Personal Info', icon: <UserCircle size={16} /> },
    { id: 'health', label: 'Medical History', icon: <HeartPulse size={16} /> },
    { id: 'records', label: 'Learning Progress', icon: <Activity size={16} /> },
    { id: 'payments', label: 'Billing & Fees', icon: <CreditCard size={16} /> }
  ];

  if (!studentProfile) return <div className="p-20 text-center font-black animate-pulse text-slate-900 uppercase tracking-widest">Checking Records...</div>;

  const axisColor = theme === 'dark' ? '#ffffff' : '#000000';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16 max-w-[1600px] mx-auto font-sans">
      {/* Header Profile Card */}
      <header className="bg-white dark:bg-slate-900 p-8 shadow-md border border-ghBorder rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-googleBlue to-indigo-600"></div>
        <div className="flex items-center gap-6 z-10">
          <div className="w-24 h-24 bg-slate-900 text-white flex items-center justify-center text-4xl font-black uppercase rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 transition-transform hover:scale-105">
            {studentProfile.imageUrl ? <img src={studentProfile.imageUrl} className="w-full h-full object-cover" alt={studentProfile.fullName} /> : studentProfile.firstName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-black text-ghText dark:text-white uppercase leading-none tracking-tight">{studentProfile.fullName}</h1>
            <div className="flex items-center gap-3 mt-3">
               <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-[10px] font-black uppercase rounded-lg border border-blue-100 dark:border-blue-800 tracking-widest">{studentProfile.assignedClass}</span>
               <span className="text-slate-300">|</span>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {studentProfile.id}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 z-10">
           <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300 border border-ghBorder rounded-xl flex flex-col items-center justify-center shadow-inner">
              <span className="text-[9px] text-slate-400 mb-1 tracking-widest">Fees Due</span>
              <span className="font-mono text-2xl font-black leading-none text-ghText dark:text-white">${Math.max(0, settings.feesAmount - (studentProfile.totalPaid || 0))}</span>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
             <button onClick={() => setActiveTab('fees')} className="px-6 py-3.5 bg-googleBlue text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg rounded-xl flex items-center justify-center gap-2 active:scale-95">
                <CreditCard size={14} /> Pay Fees
             </button>
             <button onClick={() => setShowProfile(true)} className="px-6 py-3.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg rounded-xl flex items-center justify-center gap-2 active:scale-95">
                <User size={14} /> My Profile
             </button>
             <button onClick={() => setActiveTab('clinical-history')} className="col-span-1 sm:col-span-2 px-6 py-3.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg rounded-xl flex items-center justify-center gap-2 active:scale-95">
                <FileText size={14} /> View Student Report
             </button>
           </div>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-8 flex flex-col justify-between border-2 border-blue-100 dark:border-blue-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-2">Total Term Fees</p>
              <h3 className="text-3xl font-black font-mono text-slate-900 dark:text-white">${settings.feesAmount}</h3>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 text-blue-600 rounded-xl shadow-sm"><DollarSign size={24} /></div>
          </div>
          <Activity className="absolute -right-6 -bottom-6 text-blue-100 dark:text-blue-900/10 group-hover:scale-110 transition-transform" size={100} />
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 flex flex-col justify-between border-2 border-emerald-100 dark:border-emerald-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-2">Actually Paid</p>
              <h3 className="text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400">${studentProfile.totalPaid || 0}</h3>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 text-emerald-600 rounded-xl shadow-sm"><BadgeCheck size={24} /></div>
          </div>
          <BadgeCheck className="absolute -right-6 -bottom-6 text-emerald-100 dark:text-emerald-900/10 group-hover:scale-110 transition-transform" size={100} />
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-8 flex flex-col justify-between border-2 border-purple-100 dark:border-purple-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase text-purple-600 tracking-widest mb-2">Learning Records</p>
              <h3 className="text-3xl font-black font-mono text-slate-900 dark:text-white">{studentLogs.length} Entries</h3>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 text-purple-600 rounded-xl shadow-sm"><FileSpreadsheet size={24} /></div>
          </div>
          <Target className="absolute -right-6 -bottom-6 text-purple-100 dark:text-purple-900/10 group-hover:scale-110 transition-transform" size={100} />
        </div>

        <button onClick={() => toggleNotices(true)} className="bg-white dark:bg-slate-900 p-8 flex flex-col justify-between border-2 border-ghBorder dark:border-slate-800 rounded-2xl shadow-sm hover:border-googleBlue transition-all text-left relative overflow-hidden group">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Latest News</p>
              <h3 className="text-xs font-bold uppercase leading-tight line-clamp-2 dark:text-white">{notices[0]?.title || 'No recent updates'}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl shadow-sm group-hover:bg-googleBlue group-hover:text-white transition-colors"><Bell size={24} /></div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-googleBlue group-hover:translate-x-1 transition-transform relative z-10 uppercase tracking-widest">
            Open Bulletin Board <ChevronRight size={14} />
          </div>
        </button>
      </div>

      {/* Profile Overlay Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[10000] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden shadow-2xl">
          <header className="p-4 md:p-6 lg:px-10 border-b border-slate-900 flex items-center justify-between bg-white dark:bg-slate-900 z-50">
            <div className="flex items-center gap-4 min-w-0">
              <button onClick={() => setShowProfile(false)} className="p-2 md:p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-900 text-slate-500 hover:text-black dark:hover:text-white transition-all active:scale-90 flex items-center gap-2">
                <ArrowLeft size={18} /><span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
              </button>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white flex items-center justify-center font-black text-lg text-slate-900 border border-slate-900 shadow-md overflow-hidden shrink-0">
                {studentProfile.imageUrl ? <img src={studentProfile.imageUrl} className="w-full h-full object-cover" alt="" /> : studentProfile.fullName[0]}
              </div>
              <div className="min-w-0">
                <h2 className="text-base md:text-lg font-black uppercase text-slate-950 dark:text-white leading-none truncate">{studentProfile.fullName}</h2>
                <p className="text-[8px] font-mono font-bold text-blue-600 mt-1 uppercase tracking-widest">ID: {studentProfile.id}</p>
              </div>
            </div>
            
            <button onClick={() => setShowProfile(false)} className="p-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors"><X size={24} /></button>
          </header>

          <div className="flex bg-slate-50 dark:bg-slate-900 border-b border-slate-900 p-1 md:px-10 overflow-x-auto no-scrollbar z-40 sticky top-0">
            {profileTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveProfileTab(tab.id as any)} className={`flex-1 md:flex-none px-6 md:px-8 py-3.5 md:py-4 rounded-none flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all border-b-4 whitespace-nowrap ${activeProfileTab === tab.id ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-blue-500 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                {tab.icon}<span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white dark:bg-slate-950 overflow-y-auto">
            <div className="max-w-5xl mx-auto w-full p-4 md:p-10 lg:p-16 pb-20 animate-in fade-in duration-300">
              {activeProfileTab === 'personal' && <PersonalInfo student={studentProfile} isEditing={false} editForm={{}} setEditForm={() => {}} staff={staff} settings={settings} isAdmin={false} />}
              {activeProfileTab === 'health' && <HealthRecord student={studentProfile} isEditing={false} editForm={{}} setEditForm={() => {}} onViewPdf={() => {}} onUploadPdf={() => {}} />}
              {activeProfileTab === 'records' && <PerformanceMatrix student={studentProfile} logs={studentLogs} milestones={studentMilestones} filter="Weekly" setFilter={() => {}} onOpenDay={() => {}} />}
              {activeProfileTab === 'payments' && <PaymentLedger totalPaid={studentProfile.totalPaid || 0} balance={Math.max(0, settings.feesAmount - (studentProfile.totalPaid || 0))} payments={[]} borderClass="border-slate-900" />}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart Container */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-ghBorder rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
          <div className="px-8 py-6 border-b border-ghBorder bg-ghBg/50 dark:bg-slate-950/30 flex items-center gap-3">
             <Activity size={18} className="text-googleBlue" />
             <h3 className="text-sm font-black uppercase tracking-widest text-ghText dark:text-white">Learning Activity</h3>
          </div>
          <div className="p-8 flex-1 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityPulseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: axisColor }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: axisColor }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="sessions" fill="#1a73e8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Log Table Container */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-ghBorder rounded-2xl overflow-hidden shadow-sm flex flex-col">
           <div className="p-8 border-b border-ghBorder bg-ghBg/50 dark:bg-slate-950/30 flex items-center justify-between">
              <div>
                 <h3 className="text-sm font-black uppercase tracking-widest text-ghText dark:text-white">Weekly Progress Summary</h3>
                 <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-widest italic">Actual records for the current school week</p>
              </div>
              <button onClick={() => setActiveTab('clinical-history')} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-googleBlue transition-all shadow-md active:scale-95">Full Report Archive</button>
           </div>
           <div className="overflow-x-auto no-scrollbar flex-1">
              <table className="w-full text-left table-auto border-collapse">
                 <thead className="bg-ghBg dark:bg-slate-950/50 text-[11px] font-black uppercase text-slate-500 border-b border-ghBorder">
                    <tr>
                      <th className="px-8 py-5">Weekday</th>
                      <th className="px-8 py-5 text-center">Lessons</th>
                      <th className="px-8 py-5 text-center">Checklists</th>
                      <th className="px-8 py-5 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-ghBorder">
                    {weeklyGrid.map(day => (
                      <tr key={day.date} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-ghBg dark:bg-slate-800 border border-ghBorder flex items-center justify-center font-black text-[12px] text-slate-400 group-hover:border-googleBlue group-hover:text-googleBlue transition-colors">
                                  {new Date(day.date).getDate()}
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-ghText dark:text-white leading-none">{day.day}</p>
                                  <p className="text-[10px] font-mono text-slate-400 mt-1">{day.date}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <span className={`px-3 py-1.5 text-[9px] font-black uppercase border rounded-lg ${day.lessons > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                              {day.lessons} Lessons
                            </span>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <span className={`px-3 py-1.5 text-[9px] font-black uppercase border rounded-lg ${day.checks > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                              {day.checks} Checked
                            </span>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => setActiveTab('clinical-history')} 
                              className="p-3 bg-white dark:bg-slate-800 text-slate-300 hover:text-googleBlue transition-all border border-ghBorder rounded-xl shadow-sm active:scale-90"
                            >
                               <ChevronRight size={18}/>
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
  );
};
