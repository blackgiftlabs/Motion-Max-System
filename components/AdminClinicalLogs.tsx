
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
  CheckCircle2
} from 'lucide-react';
import { Student, SessionLog } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const studentLogs = useMemo(() => {
    if (!selectedStudent) return [];
    let logs = clinicalLogs.filter(log => log.studentId === selectedStudent.id);
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedStudent, clinicalLogs]);

  const handleExportPDF = async () => {
    if (!selectedStudent || !activeLog) return;
    setIsExporting(true);
    const doc = new jsPDF();
    doc.text('PROGRESS REPORT', 15, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Step', 'Description', 'Outcome']],
      body: activeLog.steps.map((s, i) => [(i+1).toString(), s.description, s.promptLevel === '+' ? 'Achieved' : 'Support']),
    });
    doc.save(`Report_${selectedStudent.id}.pdf`);
    setIsExporting(false);
  };

  if (!selectedStudent) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-400">Loading Records...</div>;

  return (
    <div className="space-y-1 animate-in fade-in duration-500 pb-10 selection:bg-blue-100">
      
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-none flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-600 text-white">
            <HeartPulse size={20} />
          </div>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-none overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200">
                {selectedStudent.imageUrl ? <img src={selectedStudent.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-blue-600">{selectedStudent.fullName[0]}</div>}
             </div>
             <div>
               <h1 className="text-lg font-black uppercase text-slate-900 dark:text-white leading-none tracking-tight">Report History</h1>
               <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">{selectedStudent.fullName} // Records</p>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1">
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-4 space-y-1 h-fit">
           <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4 flex items-center gap-2 px-2">
              <Calendar size={12} /> List of Reports
           </h3>
           <div className="space-y-1 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {studentLogs.length === 0 ? (
                <p className="text-[9px] font-bold text-slate-300 text-center py-10 uppercase italic">Empty archive</p>
              ) : studentLogs.map(log => (
                <button 
                  key={log.id} 
                  onClick={() => setActiveLog(log)}
                  className={`w-full flex items-center justify-between p-4 border transition-all text-left group ${activeLog?.id === log.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-blue-600'}`}
                >
                  <div>
                    <p className="text-[10px] font-black uppercase leading-none mb-1">{new Date(log.date).toLocaleDateString()}</p>
                    <p className={`text-[8px] font-bold uppercase truncate w-32 ${activeLog?.id === log.id ? 'text-slate-400' : 'text-slate-500'}`}>{log.targetBehavior}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black font-mono">+{log.independenceScore}%</span>
                    <ChevronRight size={12} className={activeLog?.id === log.id ? 'text-blue-400' : 'text-slate-200'} />
                  </div>
                </button>
              ))}
           </div>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden min-h-[500px]">
           {activeLog ? (
             <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50">
                   <div>
                      <span className="text-[8px] font-black uppercase text-blue-600 tracking-widest">Target Skill</span>
                      <h4 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight leading-none mt-1">{activeLog.targetBehavior}</h4>
                   </div>
                   <button onClick={handleExportPDF} disabled={isExporting} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-blue-600 transition-all">
                      {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                   </button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
                   {activeLog.steps.map((step, idx) => (
                     <div key={step.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 group hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                           <span className="font-mono text-[10px] font-bold text-slate-300">{(idx + 1).toString().padStart(2, '0')}</span>
                           <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{step.description}</p>
                        </div>
                        <span className={`px-2 py-0.5 border text-[8px] font-black uppercase ${step.promptLevel === '+' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                           {step.promptLevel === '+' ? 'Achieved' : 'Help Given'}
                        </span>
                     </div>
                   ))}
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-20">
                <Brain size={64} className="mb-4 text-slate-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Select a report from the list</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
