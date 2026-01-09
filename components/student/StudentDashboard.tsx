
import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Calendar, DollarSign, 
  Activity, Brain,
  Check, ChevronRight, Target,
  Clock, Download, Info,
  CreditCard, Bell, FileText,
  BadgeCheck, Loader2, X, MessageSquare, Send, History
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const { user, students, parents, settings, milestoneRecords, clinicalLogs, notices, replyToNotice } = useStore();
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  
  const studentProfile = useMemo(() => {
    if (user?.role === 'STUDENT') {
      return students.find(s => s.firebaseUid === user.id);
    } else if (user?.role === 'PARENT') {
      const parentProfile = parents.find(p => p.firebaseUid === user.id);
      if (parentProfile) {
        return students.find(s => s.id === parentProfile.studentId);
      }
    }
    return null;
  }, [user, students, parents]);

  const totalFees = settings.feesAmount;
  const paidFees = studentProfile?.totalPaid || 0;
  const balance = Math.max(0, totalFees - paidFees);

  const studentMilestones = useMemo(() => 
    milestoneRecords.filter(r => r.studentId === studentProfile?.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [milestoneRecords, studentProfile]
  );

  const latestMilestone = studentMilestones[0];

  const studentLogs = useMemo(() => 
    clinicalLogs.filter(l => l.studentId === studentProfile?.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [clinicalLogs, studentProfile]
  );

  const activityPulseData = useMemo(() => {
    if (!studentProfile) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, idx) => {
      const count = studentLogs.filter(l => new Date(l.date).getMonth() === idx).length;
      return { name: m, sessions: count };
    }).slice(-6);
  }, [studentLogs, studentProfile]);

  const handleReply = async () => {
    if (!replyText || !selectedNotice) return;
    await replyToNotice(selectedNotice.id, replyText);
    setReplyText('');
  };

  if (!studentProfile) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-400">Synchronizing registry node...</div>;

  return (
    <div className="space-y-1 animate-in fade-in duration-500 pb-10 max-w-[1600px] mx-auto selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Compact Hero Section */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-none shadow-sm mb-1">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center text-lg font-black uppercase">
            {studentProfile.firstName[0]}
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{studentProfile.fullName}</h1>
            <div className="flex items-center gap-2 mt-1 text-slate-500 font-bold uppercase tracking-widest text-[9px]">
              <span className="text-blue-600">Class: {studentProfile.assignedClass}</span>
              <span className="opacity-30">|</span>
              <span>ID: {studentProfile.id}</span>
              <span className="opacity-30">|</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-none">{settings.currentTerm}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
           <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all">
              Statement
           </button>
           <button className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-sm">
              Account
           </button>
        </div>
      </header>

      {/* 2. Status Rectangle Row (Not Rounded) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
        {[
          { title: 'School Fees', value: `$${totalFees}`, icon: CreditCard, color: 'text-slate-600' },
          { title: 'Total Paid', value: `$${paidFees}`, icon: BadgeCheck, color: 'text-emerald-600' },
          { title: 'Balance Due', value: `$${balance}`, icon: DollarSign, color: balance > 0 ? 'text-rose-600' : 'text-emerald-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-none flex items-center gap-4 group">
            <div className={`p-2 bg-slate-50 dark:bg-slate-800 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{s.title}</p>
              <h3 className={`text-base font-black font-mono leading-none mt-0.5 ${s.color}`}>{s.value}</h3>
            </div>
          </div>
        ))}
        {/* Notice Card */}
        <button 
          onClick={() => {
            const latest = notices.filter(n => n.target === 'ALL' || n.target === 'PARENT')[0];
            if (latest) setSelectedNotice(latest);
          }}
          className="bg-slate-900 text-white p-4 rounded-none flex items-center gap-4 hover:bg-blue-600 transition-all text-left"
        >
          <div className="p-2 bg-white/10 text-blue-400">
            <Bell size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-black uppercase text-blue-300 tracking-widest">Latest Notice</p>
            <p className="text-[10px] font-black uppercase tracking-tight truncate mt-0.5">
              {notices.filter(n => n.target === 'ALL' || n.target === 'PARENT')[0]?.title || 'No Messages'}
            </p>
          </div>
        </button>
      </div>

      {/* 3. Rectangle Graph (Small Margins, High Visibility) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden shadow-sm">
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Activity size={12} className="text-blue-600" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Attendance Pulse Graph</h3>
           </div>
           <span className="text-[8px] font-mono font-bold text-slate-400">NODE_V3.1 // SYNC_STABLE</span>
        </div>
        {/* Margin 3px left/right as requested */}
        <div className="mx-[3px] mt-2 mb-1 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityPulseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#24292f" strokeOpacity={0.2} />
              <XAxis 
                dataKey="name" 
                axisLine={{ stroke: '#24292f', strokeWidth: 2 }} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 900, fill: '#24292f' }} 
              />
              <YAxis 
                axisLine={{ stroke: '#24292f', strokeWidth: 2 }} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 900, fill: '#24292f' }} 
              />
              <Tooltip 
                cursor={{ fill: '#f6f8fa' }} 
                contentStyle={{ borderRadius: '0', border: '1px solid #24292f', boxShadow: 'none', fontSize: '9px', fontWeight: 'bold' }} 
              />
              <Bar dataKey="sessions" radius={0} barSize={32}>
                {activityPulseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === activityPulseData.length - 1 ? '#1a73e8' : '#24292f'} fillOpacity={index === activityPulseData.length - 1 ? 1 : 0.1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Lesson Success List (No Rounding, Small Margin) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden shadow-sm">
           <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-tight">Mastery Success Matrix</h3>
                <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  {latestMilestone ? `Assessment: ${latestMilestone.ageCategory}` : 'Awaiting sync'}
                </p>
              </div>
              {latestMilestone && (
                <div className="bg-blue-600 px-3 py-1 shadow-sm">
                   <p className="text-[9px] font-black text-white">{latestMilestone.overallPercentage}% COMPLETE</p>
                </div>
              )}
           </div>
           
           <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {latestMilestone ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {latestMilestone.sections.map((section: any) => (
                    <div key={section.title}>
                      <div className="bg-slate-50 dark:bg-slate-950 px-4 py-1.5 border-y border-slate-100 dark:border-slate-800">
                        <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">{section.title}</h4>
                      </div>
                      {section.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`w-1.5 h-1.5 shrink-0 ${item.checked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                              <span className={`text-[11px] font-bold truncate ${item.checked ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                {item.text}
                              </span>
                           </div>
                           <div className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 border ${item.checked ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 'text-slate-300 border-slate-50 bg-slate-50'}`}>
                              {item.checked ? 'Passed' : 'Pending'}
                           </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center opacity-20">
                   <Brain size={40} className="mx-auto mb-2" />
                   <p className="text-[9px] font-black uppercase tracking-[0.3em]">No registry records</p>
                </div>
              )}
           </div>
        </div>

        {/* 5. Report History Registry */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-4 shadow-sm space-y-4">
           <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2">
              <History size={12} /> Clinical Reports
           </h3>
           <div className="space-y-1 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
              {studentMilestones.length === 0 ? (
                <p className="text-[9px] font-bold text-slate-400 text-center py-10 uppercase italic">Empty archive</p>
              ) : studentMilestones.map((rec, i) => (
                <button 
                  key={i} 
                  className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:bg-slate-50 transition-all text-left group"
                >
                  <div>
                     <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{rec.ageCategory}</p>
                     <p className="text-[8px] font-mono font-bold text-slate-400 uppercase">{new Date(rec.timestamp).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight size={12} className="text-slate-200 group-hover:text-blue-600 transition-all" />
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Full Page Split Notice View */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[1000] bg-white dark:bg-slate-950 flex flex-col animate-in fade-in duration-300">
           <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-slate-900 sticky top-0 z-50">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-600 text-white">
                    <Bell size={18} />
                 </div>
                 <div>
                    <h2 className="text-base font-black uppercase tracking-tight dark:text-white">Announcement Registry</h2>
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Broadcast Node ID: {selectedNotice.id}</p>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedNotice(null)} 
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-black hover:text-white transition-all"
              >
                <X size={20} />
              </button>
           </header>

           <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Left Side: Notice Content (50%) */}
              <div className="flex-1 overflow-y-auto p-10 lg:p-16 bg-slate-50 dark:bg-slate-900/50 custom-scrollbar border-r border-slate-200 dark:border-slate-800">
                 <div className="max-w-2xl mx-auto space-y-8">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase tracking-[0.2em]">
                       {selectedNotice.type} Notification
                    </span>
                    <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter dark:text-white leading-[0.9]">
                      {selectedNotice.title}
                    </h3>
                    <div className="h-0.5 w-12 bg-blue-600"></div>
                    <div className="prose dark:prose-invert max-w-none">
                       <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed border-l-4 border-blue-200 pl-6 py-2">
                          "{selectedNotice.content}"
                       </p>
                    </div>
                    <div className="flex items-center gap-4 pt-10 border-t border-slate-200 dark:border-slate-800">
                       <div className="w-10 h-10 bg-slate-950 text-white flex items-center justify-center font-black text-xs">
                          {selectedNotice.authorName[0]}
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Authorized Source</p>
                          <p className="text-xs font-black uppercase dark:text-white">{selectedNotice.authorName}</p>
                       </div>
                       <div className="ml-auto text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Date Logged</p>
                          <p className="text-xs font-mono font-bold dark:text-white">{new Date(selectedNotice.timestamp).toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right Side: Replies (50%) */}
              <div className="w-full lg:w-1/2 bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
                 <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                       <MessageSquare size={14} /> Community Feedback Node
                    </h4>
                    <span className="text-[9px] font-mono font-bold text-blue-600">{(selectedNotice.replies || []).length} RECORDS</span>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {(selectedNotice.replies || []).length > 0 ? selectedNotice.replies.map((r: any, idx: number) => (
                      <div key={idx} className={`p-5 border transition-all ${r.userId === user?.id ? 'bg-blue-50/50 border-blue-200' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                         <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                               <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-400 border border-slate-200 uppercase">
                                  {r.userName[0]}
                               </div>
                               <div>
                                  <p className="text-[10px] font-black uppercase tracking-tight dark:text-white">{r.userName}</p>
                                  <p className="text-[8px] text-slate-400 font-mono uppercase">{new Date(r.timestamp).toLocaleTimeString()}</p>
                               </div>
                            </div>
                         </div>
                         <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium pl-1 italic">"{r.message}"</p>
                      </div>
                    )) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-20 grayscale">
                         <MessageSquare size={48} className="mb-4" />
                         <p className="text-[9px] font-black uppercase tracking-widest">Feed awaiting data nodes</p>
                      </div>
                    )}
                 </div>

                 <footer className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="relative">
                       <textarea 
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Type response message..."
                          className="w-full p-4 pr-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-bold outline-none focus:border-blue-500 transition-all resize-none shadow-inner"
                          rows={2}
                       />
                       <button 
                        onClick={handleReply}
                        disabled={!replyText}
                        className="absolute right-2 bottom-2 p-3 bg-blue-600 text-white rounded-none shadow-lg hover:bg-slate-950 transition-all active:scale-95 disabled:opacity-50"
                       >
                          <Send size={14} />
                       </button>
                    </div>
                 </footer>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
