
import React, { useMemo, useState } from 'react';
import { 
  ChevronRight, Download, Loader2, Calendar, 
  X, Activity, Brain, Info, AlertTriangle, 
  Filter, CalendarDays, CheckCircle2, Search,
  MessageSquare, Mic2, ExternalLink, ClipboardList, Archive
} from 'lucide-react';
import { SessionLog, MilestoneRecord, Student } from '../../types';
import { generateStudentReport, generateFullStudentHistoryReport } from '../../utils/reportGenerator';
import { formatHarareDate, getHarareDayNum, getHarareDayName } from '../../utils/dateUtils';

interface Props {
  student: Student;
  logs: SessionLog[];
  milestones: MilestoneRecord[];
  // Original props kept for compatibility, but internal logic updated
  filter: 'Weekly' | 'Monthly' | 'Yearly';
  setFilter: (f: 'Weekly' | 'Monthly' | 'Yearly') => void;
  onOpenDay: (date: string) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Utility: Get week number of the year (Harare perspective)
const getWeekNumber = (d: Date) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
};

const getDateOfISOWeek = (w: number, y: number) => {
  const simple = new Date(y, 0, 1 + (w - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
};

export const PerformanceMatrix: React.FC<Props> = ({ student, logs, milestones }) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isArchiveExporting, setIsArchiveExporting] = useState(false);
  const [viewingUnit, setViewingUnit] = useState<{ 
    title: string; 
    logs: SessionLog[]; 
    milestones: MilestoneRecord[];
  } | null>(null);

  const studentLogs = useMemo(() => logs.filter(l => l.studentId === student.id), [logs, student.id]);
  const studentMilestones = useMemo(() => milestones.filter(m => m.studentId === student.id), [milestones, student.id]);

  const weekList = Array.from({ length: 52 }, (_, i) => i + 1);

  const displayDays = useMemo(() => {
    const todayDs = formatHarareDate(new Date().toISOString());
    const results: any[] = [];

    if (viewMode === 'week') {
      const startOfWeek = getDateOfISOWeek(selectedWeek, new Date().getFullYear());
      for (let i = 0; i < 5; i++) { // Mon to Fri
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const ds = formatHarareDate(d.toISOString());
        results.push({
          date: ds,
          label: getHarareDayName(d.toISOString()),
          dayNum: getHarareDayNum(d.toISOString()),
          isToday: ds === todayDs,
          logs: studentLogs.filter(l => formatHarareDate(l.date) === ds),
          milestones: studentMilestones.filter(m => formatHarareDate(m.timestamp) === ds)
        });
      }
    } else {
      const year = new Date().getFullYear();
      const firstDay = new Date(year, selectedMonth, 1);
      const lastDay = new Date(year, selectedMonth + 1, 0);

      let current = new Date(firstDay);
      while (current.getDay() !== 1) {
        current.setDate(current.getDate() - 1);
      }

      while (current <= lastDay) {
        const weekLabel = `${MONTHS[selectedMonth]} Week ${getWeekNumber(current) - getWeekNumber(firstDay) + 1}`;
        const weekDays = [];
        for (let i = 0; i < 5; i++) {
          const d = new Date(current);
          d.setDate(current.getDate() + i);
          const ds = formatHarareDate(d.toISOString());
          if (d.getMonth() === selectedMonth) {
            weekDays.push({
              date: ds,
              label: getHarareDayName(d.toISOString()),
              dayNum: getHarareDayNum(d.toISOString()),
              isToday: ds === todayDs,
              logs: studentLogs.filter(l => formatHarareDate(l.date) === ds),
              milestones: studentMilestones.filter(m => formatHarareDate(m.timestamp) === ds)
            });
          }
        }
        if (weekDays.length > 0) {
          results.push({ type: 'header', label: weekLabel });
          results.push(...weekDays);
        }
        current.setDate(current.getDate() + 7);
      }
    }
    return results;
  }, [viewMode, selectedWeek, selectedMonth, studentLogs, studentMilestones]);

  const handleGeneratePDF = async (title: string, dataLogs: SessionLog[], dataChecks: MilestoneRecord[]) => {
    setIsExporting(title);
    await generateStudentReport(student, dataLogs, dataChecks, title);
    setIsExporting(null);
  };

  const handleDownloadFullArchive = async () => {
    setIsArchiveExporting(true);
    try {
      await generateFullStudentHistoryReport(student, studentLogs, studentMilestones);
    } finally {
      setIsArchiveExporting(false);
    }
  };

  const jumpToSession = (log: SessionLog) => {
    const logDate = new Date(log.date);
    const weekNum = getWeekNumber(logDate);
    setSelectedWeek(weekNum);
    setViewMode('week');
    
    const ds = formatHarareDate(log.date);
    
    setViewingUnit({
      title: `${getHarareDayName(log.date)}, ${ds}`,
      logs: studentLogs.filter(l => formatHarareDate(l.date) === ds),
      milestones: studentMilestones.filter(m => formatHarareDate(m.timestamp) === ds)
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row gap-4 bg-slate-100 dark:bg-slate-900 p-4 border-2 border-slate-950 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex-1 flex bg-white dark:bg-slate-800 p-1 border-2 border-slate-950">
          <button 
            onClick={() => setViewMode('week')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-slate-950 text-white' : 'text-slate-400'}`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setViewMode('month')}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-slate-950 text-white' : 'text-slate-400'}`}
          >
            Monthly
          </button>
        </div>

        {viewMode === 'week' ? (
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-500">Week:</span>
            <select 
              value={selectedWeek} 
              onChange={e => setSelectedWeek(parseInt(e.target.value))}
              className="flex-1 py-2 px-4 bg-white dark:bg-slate-950 border-2 border-slate-950 font-black text-xs outline-none"
            >
              {weekList.map(w => <option key={w} value={w}>Week {w}</option>)}
            </select>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-500">Month:</span>
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
              className="flex-1 py-2 px-4 bg-white dark:bg-slate-950 border-2 border-slate-950 font-black text-xs outline-none"
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        )}

        <button 
          onClick={handleDownloadFullArchive}
          disabled={isArchiveExporting}
          className="px-6 py-2 bg-emerald-600 text-white border-2 border-slate-950 font-black uppercase text-[10px] tracking-widest shadow-md active:scale-95 flex items-center gap-3 disabled:opacity-50"
        >
          {isArchiveExporting ? <Loader2 size={14} className="animate-spin" /> : <><Archive size={14} /> Full History Report</>}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 border-2 border-slate-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="bg-slate-950 p-6 flex items-center justify-between">
           <div>
              <h2 className="text-white text-xl font-black uppercase tracking-tighter leading-none">
                {viewMode === 'week' ? `Schedule Node :: Week ${selectedWeek}` : `Archive Node :: ${MONTHS[selectedMonth]}`}
              </h2>
              <p className="text-blue-400 text-[9px] font-black uppercase mt-2 tracking-widest italic">Official Attendance & Session Registry</p>
           </div>
           <CalendarDays className="text-white/20" size={32} />
        </div>

        <div className="divide-y-2 divide-slate-100 dark:divide-slate-900">
           {displayDays.length === 0 ? (
             <div className="py-20 text-center opacity-40">
                <p className="text-[10px] font-black uppercase tracking-widest italic">Registry search returned no results</p>
             </div>
           ) : displayDays.map((item, idx) => {
             if (item.type === 'header') {
               return (
                 <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 border-y-2 border-slate-950">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{item.label}</span>
                 </div>
               );
             }
             const hasData = item.logs.length > 0 || item.milestones.length > 0;
             return (
               <div key={item.date} className={`flex items-center justify-between p-6 transition-all hover:bg-slate-50 dark:hover:bg-slate-900/40 ${item.isToday ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-8 border-blue-600' : ''}`}>
                  <div className="flex items-center gap-6 min-w-0">
                     <div className={`w-14 h-14 border-2 border-slate-950 flex flex-col items-center justify-center rounded-none font-black shrink-0 ${item.isToday ? 'bg-slate-950 text-white' : 'bg-white text-slate-300'}`}>
                        <span className="text-lg leading-none">{item.dayNum}</span>
                        <span className="text-[7px] uppercase mt-1 tracking-tighter">{item.label.substring(0,3)}</span>
                     </div>
                     <div className="min-w-0">
                        <div className="flex items-center gap-3">
                           <p className={`text-sm font-black uppercase tracking-tight truncate ${item.isToday ? 'text-blue-600' : 'text-slate-950 dark:text-white'}`}>
                             {item.label}
                           </p>
                           {item.isToday && <span className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest">Today</span>}
                        </div>
                        <p className="text-[9px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.date}</p>
                     </div>
                  </div>

                  <div className="flex gap-6 shrink-0 items-center">
                     <div className={`flex flex-col items-center text-center ${item.logs.length > 0 ? 'opacity-100' : 'opacity-20'}`}>
                        <span className="text-sm font-black font-mono leading-none">{item.logs.length}</span>
                        <span className="text-[7px] font-black uppercase text-slate-400 mt-1 tracking-widest">Sessions</span>
                     </div>
                     <div className={`flex flex-col items-center text-center ${item.milestones.length > 0 ? 'opacity-100' : 'opacity-20'}`}>
                        <span className="text-sm font-black font-mono leading-none">{item.milestones.length}</span>
                        <span className="text-[7px] font-black uppercase text-slate-400 mt-1 tracking-widest">Checklists</span>
                     </div>
                     <button 
                       disabled={!hasData}
                       onClick={() => setViewingUnit({ title: `${item.label}, ${item.date}`, logs: item.logs, milestones: item.milestones })}
                       className={`p-3 border-2 border-slate-950 rounded-none transition-all active:scale-90 ${hasData ? 'bg-white text-slate-950 hover:bg-slate-950 hover:text-white shadow-md' : 'bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed'}`}
                     >
                        <ChevronRight size={18}/>
                     </button>
                  </div>
               </div>
             );
           })}
        </div>
      </div>

      {viewingUnit && (
        <div className="fixed inset-0 z-[10000] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
           <header className="h-20 border-b-4 border-slate-950 bg-white dark:bg-slate-900 px-8 flex items-center justify-between sticky top-0 z-50">
              <div className="flex items-center gap-4">
                 <button onClick={() => setViewingUnit(null)} className="p-3 border-2 border-slate-950 rounded-none text-slate-950 dark:text-white bg-slate-50 active:scale-90"><X size={24} /></button>
                 <div>
                   <p className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-600">Entry Deep Dive</p>
                   <h2 className="text-base md:text-xl font-black uppercase tracking-tighter text-slate-950 dark:text-white truncate max-w-[250px]">{viewingUnit.title}</h2>
                 </div>
              </div>
              <button 
                onClick={() => handleGeneratePDF(viewingUnit.title, viewingUnit.logs, viewingUnit.milestones)}
                disabled={!!isExporting}
                className="px-8 py-3 bg-slate-950 text-white border-2 border-slate-950 font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3"
              >
                 {isExporting ? <Loader2 className="animate-spin" size={16} /> : <><Download size={16} /> PDF Export</>}
              </button>
           </header>

           <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 p-6 md:p-12 custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-8 pb-20">
                 {/* Render Milestone Assessments First */}
                 {viewingUnit.milestones.map((m) => (
                   <div key={m.id} className="bg-white dark:bg-slate-900 border-2 border-slate-950 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none space-y-8 animate-in fade-in zoom-in-95 duration-300">
                      <header className="flex justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-6">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-600 text-white rounded-none shadow-lg"><ClipboardList size={24} /></div>
                            <div>
                               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">Milestone Assessment</p>
                               <h4 className="text-xl font-black text-slate-950 dark:text-white uppercase leading-none">{m.ageCategory}</h4>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Growth Score</p>
                            <p className="text-4xl font-black font-mono text-emerald-600 leading-none">{m.overallPercentage}%</p>
                         </div>
                      </header>

                      <div className="space-y-8">
                         {m.sections.map((section, sIdx) => (
                           <div key={sIdx} className="space-y-3">
                              <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">{section.title}</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                 {section.items.map((item, iIdx) => (
                                   <div key={iIdx} className={`flex items-center justify-between p-4 text-[11px] font-bold border-2 transition-all ${item.checked ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-950/50 border-transparent'}`}>
                                      <span className={item.checked ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}>{item.text}</span>
                                      {item.checked ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> : <X size={14} className="text-slate-200 shrink-0" />}
                                   </div>
                                 ))}
                              </div>
                           </div>
                         ))}

                         {m.redFlags && m.redFlags.length > 0 && (
                            <div className="p-6 bg-rose-50 dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-900/30">
                               <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-4 flex items-center gap-2">
                                  <AlertTriangle size={14}/> Critical Observations
                               </h5>
                               <div className="space-y-2">
                                  {m.redFlags.map((flag, fIdx) => (
                                    <div key={fIdx} className={`flex items-center justify-between p-3 ${flag.checked ? 'bg-white dark:bg-slate-900 border border-rose-200 text-rose-700' : 'opacity-30 grayscale'}`}>
                                       <span className="text-[11px] font-bold">{flag.text}</span>
                                       {flag.checked && <AlertTriangle size={14} className="text-rose-600 shrink-0" />}
                                    </div>
                                  ))}
                               </div>
                            </div>
                         )}
                      </div>
                   </div>
                 ))}

                 {/* Render Lesson Logs */}
                 {viewingUnit.logs.map((log) => (
                   <div key={log.id} className="bg-white dark:bg-slate-900 border-2 border-slate-950 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none space-y-8 animate-in fade-in zoom-in-95 duration-300">
                      <header className="flex justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-6">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-600 text-white rounded-none shadow-lg"><Activity size={24} /></div>
                            <div>
                               <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">Teaching Session</p>
                               <h4 className="text-xl font-black text-slate-950 dark:text-white uppercase leading-none">{log.targetBehavior}</h4>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Independence</p>
                            <p className="text-4xl font-black font-mono text-blue-600 leading-none">{log.independenceScore}%</p>
                         </div>
                      </header>

                      <div className="space-y-3">
                         {log.steps.map((step, sIdx) => (
                           <div key={sIdx} className="flex items-center justify-between text-xs font-bold p-4 bg-slate-50 dark:bg-slate-950/50 border-2 border-transparent hover:border-slate-100 transition-all">
                              <div className="flex items-center gap-4">
                                 <span className="w-6 h-6 rounded-full bg-slate-950 text-white flex items-center justify-center text-[9px] font-black">{sIdx+1}</span>
                                 <span className="text-slate-700 dark:text-slate-300">{step.description}</span>
                              </div>
                              <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 ${step.trials.includes('+') ? 'bg-emerald-50 text-emerald-600 border-emerald-500' : 'bg-rose-50 text-rose-400 border-rose-200'}`}>
                                 {step.trials.includes('+') ? 'PASSED' : 'HELPED'}
                              </span>
                           </div>
                         ))}
                      </div>

                      {log.comment && (
                        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border-l-8 border-blue-600 mt-4 relative group">
                           <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                 <MessageSquare size={14} className="text-blue-600" />
                                 <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Teaching Observation</span>
                              </div>
                              <button onClick={() => jumpToSession(log)} className="hidden group-hover:flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded-none transition-all shadow-md">
                                 <ExternalLink size={10} /> View Source
                              </button>
                           </div>
                           <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">"{log.comment}"</p>
                        </div>
                      )}

                      {log.speechComment && (
                        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border-l-8 border-emerald-600 mt-4">
                           <div className="flex items-center gap-2 mb-2">
                              <Mic2 size={14} className="text-emerald-600" />
                              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Speech Observation</span>
                           </div>
                           <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">"{log.speechComment}"</p>
                        </div>
                      )}
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
