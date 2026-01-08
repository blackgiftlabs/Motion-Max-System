
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Search, 
  ChevronRight, 
  HeartPulse, 
  Calendar, 
  Activity,
  X,
  ArrowLeft,
  Clock,
  Brain,
  FileText,
  Download,
  Loader2,
  Lock,
  User,
  CheckCircle2
} from 'lucide-react';
import { Student, SessionLog } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

type TimeFilter = 'Week' | 'Month' | 'Year' | 'All';

export const AdminClinicalLogs: React.FC = () => {
  const { students, clinicalLogs, user, parents } = useStore();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('All');
  const [activeLog, setActiveLog] = useState<SessionLog | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const isRestrictedRole = user?.role === 'STUDENT' || user?.role === 'PARENT';

  useEffect(() => {
    if (isRestrictedRole && students.length > 0) {
      if (user?.role === 'STUDENT') {
        const student = students.find(s => s.firebaseUid === user.id);
        if (student) setSelectedStudent(student);
      } else if (user?.role === 'PARENT') {
        const parent = parents.find(p => p.firebaseUid === user.id);
        if (parent) {
          const student = students.find(s => s.id === parent.studentId);
          if (student) setSelectedStudent(student);
        }
      }
    }
  }, [user, students, parents, isRestrictedRole]);

  useEffect(() => {
    setActiveLog(null);
  }, [selectedStudent]);

  const filteredStudents = students.filter(s => {
    return s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           s.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const studentLogs = useMemo(() => {
    if (!selectedStudent) return [];
    let logs = clinicalLogs.filter(log => log.studentId === selectedStudent.id);
    
    const now = new Date();
    if (timeFilter === 'Week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      logs = logs.filter(l => new Date(l.date) >= weekAgo);
    } else if (timeFilter === 'Month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      logs = logs.filter(l => new Date(l.date) >= monthAgo);
    } else if (timeFilter === 'Year') {
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      logs = logs.filter(l => new Date(l.date) >= yearAgo);
    }
    
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedStudent, clinicalLogs, timeFilter]);

  const handleExportPDF = async () => {
    if (!selectedStudent || !activeLog) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      try {
        const img = document.createElement('img');
        img.src = LogoImg;
        await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
        if (img.complete && img.naturalWidth > 0) {
          doc.addImage(img, 'PNG', 15, 15, 25, 25);
        }
      } catch (e) {}

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(0, 45, 80);
      doc.text('MOTION MAX PROGRESS RECORD', pageWidth - 15, 22, { align: 'right' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text('Official Progress Documentation', pageWidth - 15, 28, { align: 'right' });

      doc.setDrawColor(230);
      doc.line(15, 45, pageWidth - 15, 45);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('LESSON PROGRESS REPORT', 15, 58);

      doc.setFontSize(10);
      doc.text(`Student: ${selectedStudent.fullName}`, 15, 76);
      doc.text(`Registry ID: ${selectedStudent.id}`, 15, 81);
      doc.text(`Date Recorded: ${new Date(activeLog.date).toLocaleDateString()}`, 110, 76);
      doc.text(`Independence: ${activeLog.independenceScore}%`, 110, 81);

      const tableData = activeLog.steps.map((step, idx) => [
        (idx + 1).toString(),
        step.description,
        step.promptLevel === '+' ? 'Correct' : `Needed Help (${step.promptLevel})`
      ]);

      autoTable(doc, {
        startY: 95,
        head: [['Step', 'What they did', 'Outcome']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 45, 80], textColor: [255, 255, 255] }
      });

      doc.save(`Progress_${selectedStudent.id}_${activeLog.date.split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!selectedStudent && !isRestrictedRole) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
        <header>
          <h1 className="text-3xl font-black uppercase tracking-tight dark:text-white leading-none">Past Reports</h1>
          <p className="text-xs text-slate-500 font-medium mt-2 italic">View and download historical lesson logs.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-sm">
           <div className="relative group w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold outline-none" 
              />
           </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map(student => {
            const logsCount = clinicalLogs.filter(l => l.studentId === student.id).length;
            return (
              <div 
                key={student.id} 
                onClick={() => setSelectedStudent(student)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-blue-500 transition-all cursor-pointer overflow-hidden group active:scale-95"
              >
                 <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-blue-900/20 text-[#002D50] dark:text-blue-400 flex items-center justify-center font-black text-lg uppercase">
                      {student.fullName[0]}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">{student.id}</span>
                 </div>
                 <h3 className="font-black text-sm dark:text-white uppercase tracking-tight mb-3 truncate group-hover:text-blue-600 transition-colors">{student.fullName}</h3>
                 
                 <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{logsCount} Reports</span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500 max-w-[1200px] mx-auto pb-10 px-1">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          {!isRestrictedRole && (
            <button 
              onClick={() => setSelectedStudent(null)}
              className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-blue-600 transition-all active:scale-90"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#002D50] text-white flex items-center justify-center text-xl font-black uppercase shadow-lg ring-4 ring-blue-500/10">
              {selectedStudent?.firstName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight dark:text-white leading-none">{selectedStudent?.fullName}</h1>
              <p className="text-[10px] font-mono text-slate-400 mt-2 tracking-widest uppercase">ID: {selectedStudent?.id}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          {(['Week', 'Month', 'Year', 'All'] as TimeFilter[]).map(f => (
            <button 
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeFilter === f ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-4">
         <div className="flex items-center gap-2 px-2">
            <Calendar size={16} className="text-blue-500" />
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400">Recorded Sessions</h3>
         </div>
         <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar snap-x">
            {studentLogs.length === 0 ? (
               <div className="w-full py-20 bg-slate-50 dark:bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 italic">Registry Node Empty</p>
               </div>
            ) : studentLogs.map(log => (
               <button 
                key={log.id} 
                onClick={() => setActiveLog(log)}
                className={`flex-shrink-0 w-64 snap-center p-6 rounded-[2.5rem] border transition-all text-left relative overflow-hidden group ${activeLog?.id === log.id ? 'bg-[#002D50] border-[#002D50] text-white shadow-xl translate-y-[-4px]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500'}`}
               >
                  <p className={`text-[9px] font-black uppercase mb-3 tracking-widest ${activeLog?.id === log.id ? 'text-blue-300' : 'text-slate-400'}`}>Summary Log</p>
                  <p className="font-black text-lg uppercase tracking-tight leading-none mb-2">
                    {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className={`text-[10px] font-bold line-clamp-1 ${activeLog?.id === log.id ? 'text-blue-100' : 'text-slate-500'}`}>{log.targetBehavior}</p>
                  <div className="mt-8 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className={`text-[8px] font-black uppercase ${activeLog?.id === log.id ? 'text-blue-200' : 'text-slate-400'}`}>Score</span>
                        <span className="text-2xl font-black font-mono">{log.independenceScore}%</span>
                     </div>
                     <div className={`p-2 rounded-xl ${activeLog?.id === log.id ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800'}`}>
                        <ChevronRight size={18} />
                     </div>
                  </div>
               </button>
            ))}
         </div>
      </div>

      {activeLog ? (
         <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in duration-500">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/50">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg">
                     <Brain size={32} />
                  </div>
                  <div>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 block">Focus Activity</span>
                     <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white leading-tight">{activeLog.targetBehavior}</h3>
                  </div>
               </div>
               <div className="px-8 py-5 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner flex items-center gap-6">
                   <div className="text-right">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Final Mastery</p>
                     <p className="text-4xl font-black text-blue-600 font-mono">{activeLog.independenceScore}%</p>
                   </div>
                   <Activity size={28} className="text-blue-500 opacity-40" />
               </div>
            </div>

            {/* FULL RESPONSIVE LIST - No horizontal scrolling on mobile */}
            <div className="p-4 md:p-8 space-y-4">
               <div className="hidden md:grid grid-cols-12 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400">
                  <div className="col-span-1 text-center">No.</div>
                  <div className="col-span-8">Learning Task Description</div>
                  <div className="col-span-3 text-center">Result Node</div>
               </div>
               
               <div className="space-y-4 md:space-y-0 md:divide-y md:divide-slate-100 md:dark:divide-slate-800">
                  {activeLog.steps.map((step, idx) => (
                    <div key={step.id} className="p-6 md:p-0 md:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 md:bg-transparent dark:bg-slate-950/40 md:dark:bg-transparent rounded-3xl md:rounded-none group transition-all">
                       <div className="col-span-1 hidden md:flex justify-center font-mono font-bold text-slate-400 text-sm">{(idx + 1).toString().padStart(2, '0')}</div>
                       <div className="col-span-1 md:col-span-8">
                          <div className="flex items-center gap-2 mb-2 md:hidden">
                             <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">Task {(idx + 1)}</span>
                          </div>
                          <p className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">{step.description}</p>
                       </div>
                       <div className="col-span-3 flex justify-start md:justify-center">
                          <div className={`w-full md:w-auto px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 border-2 shadow-sm transition-all ${step.promptLevel === '+' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'}`}>
                             {step.promptLevel === '+' ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                             {step.promptLevel === '+' ? 'Achieved' : `Support (${step.promptLevel})`}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="p-10 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4 text-slate-400">
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <FileText size={20} className="text-blue-500" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest">Verified Student Database Entry</p>
               </div>
               <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="w-full md:w-auto px-10 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
               >
                  {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Download Record PDF
               </button>
            </div>
         </div>
      ) : (
         <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
            <User size={48} className="text-slate-200 mb-6" />
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 max-w-xs mx-auto italic leading-relaxed">"Please pick a progress card from the registry to view clinical details."</h4>
         </div>
      )}
    </div>
  );
};
