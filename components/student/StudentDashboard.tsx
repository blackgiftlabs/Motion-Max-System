
import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Calendar, DollarSign, 
  TrendingUp, History,
  Activity, Brain,
  Check, X, ChevronRight, Target,
  Clock,
  Download,
  Info,
  HelpCircle,
  CreditCard,
  Bell,
  FileText,
  BadgeCheck,
  MapPin,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const StudentDashboard: React.FC = () => {
  const { user, students, parents, settings, milestoneRecords, clinicalLogs, notices, toggleNotices } = useStore();
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
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

  const latestMilestone = selectedHistoryItem || studentMilestones[0];

  const studentLogs = useMemo(() => 
    clinicalLogs.filter(l => l.studentId === studentProfile?.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [clinicalLogs, studentProfile]
  );

  const radarData = useMemo(() => {
    if (!latestMilestone) return [];
    return latestMilestone.sections.map((s: any) => {
      const total = s.items.length;
      const checked = s.items.filter((i: any) => i.checked).length;
      return {
        subject: s.title,
        score: Math.round((checked / (total || 1)) * 100),
      };
    });
  }, [latestMilestone]);

  const activityPulseData = useMemo(() => {
    if (!studentProfile) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, idx) => {
      const count = studentLogs.filter(l => new Date(l.date).getMonth() === idx).length;
      return { name: m, sessions: count };
    }).slice(-6);
  }, [studentLogs, studentProfile]);

  const handleDownloadFullReport = async () => {
    if (!studentProfile) return;
    setIsGeneratingPdf(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // 1. School Logo (Top Right)
      try {
        const img = new Image();
        img.src = LogoImg;
        await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
        if (img.complete) {
          doc.addImage(img, 'PNG', pageWidth - 45, 12, 30, 30);
        }
      } catch (e) {
        console.error("Logo failed to load for PDF");
      }

      // 2. School Info (Top Left)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(0, 45, 80);
      doc.text('MOTION MAX', 15, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Autism Center for Child Development', 15, 32);
      doc.text('27 Colnebrook Lane, Harare, Zimbabwe', 15, 37);
      doc.text('Phone: +263 775 926 454', 15, 42);
      doc.text('Email: admin@motionmax.co.zw', 15, 47);

      doc.setDrawColor(230, 230, 230);
      doc.line(15, 52, pageWidth - 15, 52);

      // 3. Document Title & Student Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('STUDENT PROGRESS & ACCOUNT STATEMENT', 15, 65);

      doc.setFontSize(10);
      doc.text(`Student: ${studentProfile.fullName}`, 15, 75);
      doc.text(`ID Number: ${studentProfile.id}`, 15, 80);
      doc.text(`Class Room: ${studentProfile.assignedClass}`, 110, 75);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 110, 80);

      // 4. Financial Account Table
      doc.setFontSize(12);
      doc.text('School Fees Account Summary', 15, 95);
      autoTable(doc, {
        startY: 98,
        head: [['Account Description', 'Amount in USD']],
        body: [
          ['Total Tuition Fees for Term', `$${totalFees.toLocaleString()}`],
          ['Total Fees Paid to Date', `$${paidFees.toLocaleString()}`],
          ['Outstanding Balance Due', `$${balance.toLocaleString()}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [0, 45, 80] },
        styles: { fontStyle: 'bold' }
      });

      // 5. Progress Milestones Table
      const milestoneY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.text('Learning Progress Status', 15, milestoneY);
      
      if (latestMilestone) {
        const milestoneRows = latestMilestone.sections.flatMap((s: any) => 
          s.items.map((i: any) => [s.title, i.text, i.checked ? 'Goal Achieved' : 'In Progress'])
        );

        autoTable(doc, {
          startY: milestoneY + 4,
          head: [['Learning Area', 'Skill / Goal', 'Status']],
          body: milestoneRows,
          theme: 'striped',
          headStyles: { fillColor: [37, 99, 235] }
        });
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No learning milestone data is currently recorded.', 15, milestoneY + 10);
      }

      // 6. Recent Daily Activity Table
      const lessonsY = (doc as any).lastAutoTable.finalY + 15;
      if (lessonsY > 230) doc.addPage();
      
      const sessionStartY = (lessonsY > 230 ? 25 : lessonsY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Recent Daily Lessons & Session Logs', 15, sessionStartY);
      
      const lessonRows = studentLogs.slice(0, 15).map(l => [
        new Date(l.date).toLocaleDateString(),
        l.targetBehavior,
        `${l.independenceScore}%`
      ]);

      autoTable(doc, {
        startY: sessionStartY + 4,
        head: [['Date of Lesson', 'Skill Practiced', 'Success Level']],
        body: lessonRows.length > 0 ? lessonRows : [['-', 'No lessons recorded yet', '-']],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
      });

      // Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Official Motion Max Document - Page ${i} of ${totalPages}`, pageWidth / 2, 285, { align: 'center' });
      }

      doc.save(`MotionMax_Report_${studentProfile.id}.pdf`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!studentProfile) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-400">Loading your dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-6xl mx-auto">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-4xl font-black uppercase shadow-xl ring-8 ring-blue-50 dark:ring-blue-900/20">
            {studentProfile.firstName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{studentProfile.fullName}</h1>
            <div className="flex items-center gap-3 mt-3 text-slate-500 font-bold uppercase tracking-widest text-[11px]">
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Class: {studentProfile.assignedClass}</span>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">ID: {studentProfile.id}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleDownloadFullReport}
          disabled={isGeneratingPdf}
          className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
        >
          {isGeneratingPdf ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          Download Complete PDF Report
        </button>
      </header>

      {/* Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Current Term', value: settings.currentTerm, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'School Fees', value: `$${totalFees.toLocaleString()}`, icon: CreditCard, color: 'text-slate-600', bg: 'bg-slate-50' },
          { title: 'Total Paid', value: `$${paidFees.toLocaleString()}`, icon: BadgeCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Balance Due', value: `$${balance.toLocaleString()}`, icon: DollarSign, color: balance > 0 ? 'text-rose-600' : 'text-emerald-600', bg: balance > 0 ? 'bg-rose-50' : 'bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-blue-500 transition-all">
            <div className={`p-3 w-fit rounded-2xl ${s.bg} dark:bg-slate-800 mb-5 ${s.color}`}>
              <s.icon size={24} />
            </div>
            <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">{s.title}</p>
            <h3 className={`text-2xl font-black mt-1 font-mono tracking-tight ${s.color}`}>{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Visuals */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                 <Target size={18} className="text-blue-500" /> Milestone Success
               </h3>
               <div className="h-[300px] w-full">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                      />
                      <Radar name="Student" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                     <Info size={40} className="mb-2 opacity-20" />
                     <p className="text-[11px] font-black uppercase italic tracking-widest">No progress data recorded yet</p>
                  </div>
                )}
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                 <Activity size={18} className="text-indigo-500" /> Attendance Graph
               </h3>
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={activityPulseData} margin={{ left: -30 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                     <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                     <Bar dataKey="sessions" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={24} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>

          {/* Progress List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
             <div className="p-8 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white tracking-tight">Lesson Success List</h3>
                  <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                    {latestMilestone ? `Viewing: ${latestMilestone.ageCategory}` : 'Wait for teacher update'}
                  </p>
                </div>
                {latestMilestone && (
                  <div className="bg-blue-600 px-5 py-2 rounded-2xl shadow-lg">
                     <p className="text-xs font-black text-white">{latestMilestone.overallPercentage}% Achieved</p>
                  </div>
                )}
             </div>
             
             <div className="p-8 max-h-[500px] overflow-y-auto sidebar-scrollbar">
                {latestMilestone ? (
                  <div className="space-y-12">
                    {latestMilestone.sections.map((section: any) => (
                      <div key={section.title} className="space-y-5">
                        <div className="flex items-center gap-4">
                           <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">{section.title}</h4>
                           <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {section.items.map((item: any, idx: number) => (
                             <div key={idx} className="flex items-start gap-4 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 group hover:border-blue-300 transition-all">
                                <div className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${item.checked ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-200 border border-slate-100 dark:border-slate-700'}`}>
                                   {item.checked ? <Check size={16} strokeWidth={4} /> : <Clock size={16} />}
                                </div>
                                <span className={`text-[13px] font-bold leading-relaxed ${item.checked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 italic'}`}>
                                  {item.text}
                                </span>
                             </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center space-y-4">
                     <Brain size={64} className="mx-auto text-slate-100 dark:text-slate-800" />
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Progress records will appear here after teacher review.</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Announcements */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group border border-white/5">
             <Bell className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-125 transition-transform duration-1000" size={160} />
             <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-xs font-black uppercase text-blue-400 tracking-[0.3em]">Notice Board</h3>
                   <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                </div>
                
                <div className="space-y-5">
                   {notices.filter(n => n.target === 'ALL' || n.target === 'PARENT').slice(0, 2).length > 0 ? notices.filter(n => n.target === 'ALL' || n.target === 'PARENT').slice(0, 2).map(n => (
                     <div key={n.id} className="p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all cursor-pointer" onClick={() => toggleNotices(true)}>
                        <p className="text-[10px] font-black uppercase text-blue-300 mb-2">{n.type} Update</p>
                        <p className="text-sm font-black uppercase tracking-tight leading-tight">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 italic">"{n.content}"</p>
                     </div>
                   )) : (
                     <p className="text-sm font-bold text-slate-500 italic uppercase tracking-tighter">No new messages from school office.</p>
                   )}
                </div>

                <button 
                  onClick={() => toggleNotices(true)}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                >
                   View All Notices
                </button>
             </div>
          </div>

          {/* Past Milestone Reports */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
             <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-8 flex items-center gap-3">
                <History size={18} /> History Nodes
             </h3>
             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 sidebar-scrollbar">
                {studentMilestones.length === 0 ? (
                  <div className="text-center py-10 opacity-30">
                     <History size={32} className="mx-auto mb-2" />
                     <p className="text-[10px] font-black uppercase tracking-widest italic">No records found</p>
                  </div>
                ) : studentMilestones.map((rec, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedHistoryItem(rec)}
                    className={`w-full flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all group ${selectedHistoryItem?.id === rec.id || (!selectedHistoryItem && i === 0) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-50 dark:border-slate-800 hover:border-blue-200 bg-white dark:bg-slate-900'}`}
                  >
                    <div className="text-left">
                       <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2 group-hover:text-blue-600 transition-colors">{rec.ageCategory}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         {new Date(rec.timestamp).toLocaleDateString()}
                       </p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <footer className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] grid md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
             <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600"><MapPin size={20}/></div>
             <div>
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">School Campus</p>
                <p className="text-sm font-bold mt-1">27 Colnebrook Lane, Harare</p>
             </div>
          </div>
          <div className="flex items-start gap-4">
             <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600"><Phone size={20}/></div>
             <div>
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Support Line</p>
                <p className="text-sm font-bold mt-1">+263 775 926 454</p>
             </div>
          </div>
          <div className="flex items-start gap-4">
             <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600"><Mail size={20}/></div>
             <div>
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Official Email</p>
                <p className="text-sm font-bold mt-1">admin@motionmax.co.zw</p>
             </div>
          </div>
      </footer>
    </div>
  );
};
