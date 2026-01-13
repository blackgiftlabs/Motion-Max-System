import React, { useMemo, useState } from 'react';
import { 
  ChevronRight, FileText, Download, Loader2, Calendar, Eye, 
  CheckCircle2, X, Activity, Brain, Info, AlertTriangle
} from 'lucide-react';
import { SessionLog, MilestoneRecord, Student } from '../../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PROMPT_LEVELS } from '../../constants';

interface Props {
  student: Student;
  logs: SessionLog[];
  milestones: MilestoneRecord[];
  filter: 'Weekly' | 'Monthly' | 'Yearly';
  setFilter: (f: 'Weekly' | 'Monthly' | 'Yearly') => void;
  onOpenDay: (date: string) => void;
}

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PerformanceMatrix: React.FC<Props> = ({ student, logs, milestones, filter, setFilter }) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [viewingUnit, setViewingUnit] = useState<{ 
    title: string; 
    logs: SessionLog[]; 
    milestones: MilestoneRecord[];
    isGroup?: boolean;
  } | null>(null);

  // Data Grouping Logic
  const displayUnits = useMemo(() => {
    if (filter === 'Weekly') {
      const now = new Date();
      const currentDay = now.getDay();
      const diff = currentDay === 0 ? -6 : 1 - currentDay;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diff);
      
      const days: string[] = [];
      for (let i = 0; i < 5; i++) {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        days.push(d.toISOString().split('T')[0]);
      }
      return days.reverse().map(date => ({
        id: date,
        label: new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        date,
        logs: logs.filter(l => l.date.split('T')[0] === date),
        milestones: milestones.filter(m => m.timestamp.split('T')[0] === date),
        type: 'day' as const,
        disabled: false
      }));
    }

    if (filter === 'Monthly') {
      const currentYear = new Date().getFullYear();
      return MONTHS.map((monthName, index) => {
        const monthLogs = logs.filter(l => {
          const d = new Date(l.date);
          return d.getFullYear() === currentYear && d.getMonth() === index;
        });
        const monthMilestones = milestones.filter(m => {
          const d = new Date(m.timestamp);
          return d.getFullYear() === currentYear && d.getMonth() === index;
        });

        return {
          id: `${currentYear}-${index}`,
          label: monthName,
          year: currentYear,
          logs: monthLogs,
          milestones: monthMilestones,
          type: 'month' as const,
          disabled: monthLogs.length === 0 && monthMilestones.length === 0
        };
      });
    }

    // Yearly View: Find all years with data
    const allDates = [...logs.map(l => l.date), ...milestones.map(m => m.timestamp)];
    const uniqueYears = Array.from(new Set(allDates.map(d => new Date(d).getFullYear()))).sort((a, b) => b - a);
    
    if (uniqueYears.length === 0) uniqueYears.push(new Date().getFullYear());

    return uniqueYears.map(year => ({
      id: year.toString(),
      label: `Year ${year}`,
      year,
      logs: logs.filter(l => new Date(l.date).getFullYear() === year),
      milestones: milestones.filter(m => new Date(m.timestamp).getFullYear() === year),
      type: 'year' as const,
      disabled: false
    }));
  }, [filter, logs, milestones]);

  const generatePDF = async (title: string, dataLogs: SessionLog[], dataChecks: MilestoneRecord[], isGroup: boolean) => {
    setIsExporting(title);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // 1. Header & School Info
    try { doc.addImage(LogoImg, 'PNG', 10, 10, 15, 15); } catch (e) {}
    doc.setFontSize(18);
    doc.setTextColor(0, 45, 80);
    doc.setFont("helvetica", "bold");
    doc.text("MOTION MAX DAY SERVICES", 30, 18);
    
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("27 Colnebrook Lane, Harare, Zimbabwe | admin@motionmax.co.zw", 30, 23);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 0, 0);
    doc.text("PRIVATE AND CONFIDENTIAL", pageWidth - 10, 15, { align: 'right' });

    doc.setDrawColor(200);
    doc.line(10, 28, pageWidth - 10, 28);
    
    // 2. Student Info
    doc.setFillColor(245, 247, 249);
    doc.rect(10, 32, pageWidth - 20, 25, 'F');
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.setFont("helvetica", "bold");
    doc.text(`STUDENT REPORT: ${student.fullName.toUpperCase()}`, 15, 40);
    
    doc.setFontSize(9);
    doc.text(`Student ID: ${student.id}`, 15, 46);
    doc.text(`Class: ${student.assignedClass}`, 15, 51);
    doc.text(`Report Period: ${title}`, pageWidth - 15, 40, { align: 'right' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 15, 46, { align: 'right' });

    let currentY = 65;

    // 3. Learning Tasks (Full Tables)
    if (dataLogs.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 45, 80);
      doc.text("Learning Tasks Performance", 10, currentY);
      currentY += 5;

      dataLogs.forEach((log) => {
        if (currentY > 250) { doc.addPage(); currentY = 20; }
        
        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.text(`Task: ${log.targetBehavior} (${log.method})`, 10, currentY);
        doc.setFontSize(9);
        doc.text(`Score: ${log.independenceScore}%`, pageWidth - 10, currentY, { align: 'right' });
        currentY += 3;

        const body = log.steps.map((s, i) => [
          (i + 1).toString(),
          s.description,
          ...s.trials,
          s.trials.includes('+') ? 'Pass' : 'Need Help'
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['#', 'What they did', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Result']],
          body,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 1.5 },
          headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], fontStyle: 'bold' }
        });
        currentY = (doc as any).lastAutoTable.finalY + 10;
      });
    }

    // 4. Growth Checks (Pass/Fail Details)
    if (dataChecks.length > 0) {
      if (currentY > 220) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.setTextColor(0, 45, 80);
      doc.text("Growth Checks (Milestones)", 10, currentY);
      currentY += 8;

      dataChecks.forEach((check) => {
        doc.setFontSize(11);
        doc.setTextColor(30);
        doc.text(`Category: ${check.ageCategory} Assessment`, 10, currentY);
        doc.text(`Mastery: ${check.overallPercentage}%`, pageWidth - 10, currentY, { align: 'right' });
        currentY += 6;

        check.sections.forEach(section => {
          if (currentY > 260) { doc.addPage(); currentY = 20; }
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text(section.title.toUpperCase(), 10, currentY);
          currentY += 4;

          const items = section.items.map(item => [
            item.checked ? '[X]' : '[ ]',
            item.text,
            item.checked ? 'Pass' : 'Not Yet'
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [['Status', 'Skill Description', 'Outcome']],
            body: items,
            theme: 'plain',
            styles: { fontSize: 8, cellPadding: 1 },
            columnStyles: { 0: { cellWidth: 15 }, 2: { cellWidth: 25 } }
          });
          currentY = (doc as any).lastAutoTable.finalY + 5;
        });
        
        currentY += 5;
      });
    }

    // 5. Scoring Legend Footer
    if (currentY > 260) { doc.addPage(); currentY = 20; }
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("SCORING KEY:", 10, currentY);
    doc.text("+ : Correct Unprompted | - : Incorrect | FP: Full Physical | PP: Partial Physical | DV: Direct Visual | IDV: Indirect Verbal", 10, currentY + 4);

    doc.save(`${student.lastName}_Report_${title.replace(/ /g, '_')}.pdf`);
    setIsExporting(null);
  };

  const PromptLegend = () => (
    <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none">
      <h5 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
        <Info size={14} /> Scoring Key (Simple Guide)
      </h5>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-8">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center bg-emerald-500 text-white text-[10px] font-black rounded">+</span>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Correct Unprompted</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded">-</span>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Incorrect</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 text-[10px] font-black rounded border border-blue-200">FP</span>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Full Physical Prompt</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-700 text-[10px] font-black rounded border border-purple-200">PP</span>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Partial Physical Prompt</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center bg-orange-100 text-orange-700 text-[10px] font-black rounded border border-orange-200">DV</span>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Direct Visual</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center bg-amber-100 text-amber-700 text-[10px] font-black rounded border border-amber-200">IDV</span>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Indirect Verbal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center bg-cyan-100 text-cyan-700 text-[10px] font-black rounded border border-cyan-200">GP</span>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Gesture Prompt</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center bg-teal-100 text-teal-700 text-[10px] font-black rounded border border-teal-200">VP</span>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Visual Prompt</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-white rounded-none shadow-lg">
             <Activity size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight">Student History</h3>
            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest italic">Performance reports for {student.firstName}</p>
          </div>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 border-2 border-slate-900 rounded-none shadow-inner">
          {['Weekly', 'Monthly', 'Yearly'].map((f: any) => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-none ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {filter === 'Weekly' ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-none overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-900">
                <tr>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5 text-center">Lessons</th>
                  <th className="px-8 py-5 text-center">Growth Checks</th>
                  <th className="px-8 py-5 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {displayUnits.map(unit => (
                  <tr key={unit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 flex flex-col items-center justify-center border-2 border-slate-900 bg-white dark:bg-slate-800 font-black shadow-sm">
                            <span className="text-lg leading-none text-slate-900 dark:text-white">{new Date(unit.date!).getDate()}</span>
                            <span className="text-[8px] uppercase mt-1 text-slate-400">{new Date(unit.date!).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">{unit.label}</p>
                            <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase">{unit.date}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`px-4 py-1.5 text-[9px] font-black uppercase border-2 ${unit.logs.length > 0 ? 'bg-blue-600 text-white border-slate-900' : 'bg-slate-50 text-slate-300 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                         {unit.logs.length} Lessons
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`px-4 py-1.5 text-[9px] font-black uppercase border-2 ${unit.milestones.length > 0 ? 'bg-emerald-600 text-white border-slate-900' : 'bg-slate-50 text-slate-300 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
                         {unit.milestones.length} Growth Checks
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                         onClick={() => setViewingUnit({ title: unit.label, logs: unit.logs, milestones: unit.milestones })}
                         className="p-3 bg-white dark:bg-slate-800 border-2 border-slate-900 text-slate-400 hover:text-blue-600 transition-all shadow-sm active:scale-90"
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-700">
           {displayUnits.map(unit => (
             <button 
               key={unit.id}
               disabled={unit.disabled}
               onClick={() => setViewingUnit({ title: filter === 'Yearly' ? unit.label : `${unit.label} ${unit.year}`, logs: unit.logs, milestones: unit.milestones, isGroup: true })}
               className={`p-8 border-2 text-left transition-all relative overflow-hidden group ${
                 unit.disabled 
                  ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-40 grayscale cursor-not-allowed' 
                  : 'bg-white dark:bg-slate-900 border-slate-900 hover:border-blue-600 hover:shadow-2xl hover:-translate-y-1'
               }`}
             >
                <div className={`w-10 h-10 mb-6 flex items-center justify-center font-black text-xs border-2 ${unit.disabled ? 'border-slate-200 text-slate-300' : 'border-slate-900 bg-slate-900 text-white'}`}>
                   {filter === 'Yearly' ? 'YR' : unit.label.substring(0,3).toUpperCase()}
                </div>
                <h4 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">{unit.label}</h4>
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Lessons</span>
                      <span className="text-[10px] font-black text-slate-900 dark:text-white">{unit.logs.length}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Mastery</span>
                      <span className="text-[10px] font-black text-blue-600">{unit.logs.length > 0 ? Math.round(unit.logs.reduce((a,b)=>a+b.independenceScore,0)/unit.logs.length) : 0}%</span>
                   </div>
                </div>
                {!unit.disabled && <ChevronRight size={16} className="absolute bottom-8 right-8 text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
             </button>
           ))}
        </div>
      )}

      {/* DETAILED REPORT MODAL */}
      {viewingUnit && (
        <div className="fixed inset-0 z-[10000] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
           <header className="h-20 border-b-2 border-slate-900 bg-white dark:bg-slate-900 px-8 flex items-center justify-between sticky top-0 z-50">
              <div className="flex items-center gap-6">
                 <button onClick={() => setViewingUnit(null)} className="p-3 bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 rounded-none text-slate-900 dark:text-white active:scale-90 transition-all">
                    <X size={24} />
                 </button>
                 <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{viewingUnit.title} Performance</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Student Record: {student.id}</p>
                 </div>
              </div>
              <button 
                onClick={() => generatePDF(viewingUnit.title, viewingUnit.logs, viewingUnit.milestones, viewingUnit.isGroup || false)}
                disabled={isExporting === viewingUnit.title}
                className="px-10 py-3.5 bg-slate-900 text-white border-2 border-slate-900 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
              >
                 {isExporting === viewingUnit.title ? <Loader2 size={16} className="animate-spin" /> : 'Get PDF Report'}
              </button>
           </header>

           <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-8 md:p-12 custom-scrollbar">
              <div className="max-w-6xl mx-auto space-y-12">
                 {/* Learning Tasks Section */}
                 <section className="space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-blue-600 text-white"><Activity size={24} /></div>
                       <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Learning Tasks</h3>
                       <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    </div>

                    {viewingUnit.logs.length === 0 ? (
                      <div className="p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 opacity-50">
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">No learning tasks recorded for this period.</p>
                      </div>
                    ) : viewingUnit.logs.map((log, lIdx) => (
                      <div key={log.id} className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-none overflow-hidden shadow-md animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${lIdx * 100}ms` }}>
                         <header className="px-8 py-6 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Skill</p>
                               <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">{log.targetBehavior}</h4>
                            </div>
                            <div className="text-right">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                               <p className="text-3xl font-black font-mono text-blue-600">{log.independenceScore}%</p>
                            </div>
                         </header>
                         <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                               <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b-2 border-slate-100 dark:border-slate-800">
                                  <tr>
                                     <th className="px-8 py-4 w-16 text-center">No.</th>
                                     <th className="px-4 py-4">Task Description</th>
                                     {[...Array(10)].map((_, i) => <th key={i} className="px-1 py-4 text-center w-12 border-l border-slate-100 dark:border-slate-800">T{i+1}</th>)}
                                     <th className="px-8 py-4 text-center w-28 border-l border-slate-100 dark:border-slate-800">Final</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {log.steps.map((step, sIdx) => {
                                     const isPass = step.trials.includes('+');
                                     return (
                                       <tr key={sIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                          <td className="px-8 py-5 text-[10px] font-black text-slate-300 text-center">{(sIdx+1).toString().padStart(2, '0')}</td>
                                          <td className="px-4 py-5 text-sm font-bold text-slate-700 dark:text-slate-200">{step.description}</td>
                                          {step.trials.map((trial, tIdx) => (
                                            <td key={tIdx} className="px-1 py-5 text-center border-l border-slate-50 dark:border-slate-800">
                                               <span className={`inline-block w-8 py-1.5 rounded text-[10px] font-black transition-all ${
                                                 trial === '+' ? 'bg-emerald-500 text-white' : 
                                                 trial === '-' ? 'bg-rose-50 text-rose-300' : 
                                                 'bg-blue-600 text-white'
                                               }`}>
                                                  {trial === '-' ? '.' : trial}
                                               </span>
                                            </td>
                                          ))}
                                          <td className="px-8 py-5 text-center border-l border-slate-50 dark:border-slate-800">
                                             <span className={`px-3 py-1.5 border-2 text-[9px] font-black uppercase ${isPass ? 'bg-emerald-50 text-emerald-700 border-emerald-500' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                                {isPass ? 'Passed' : 'Need Help'}
                                             </span>
                                          </td>
                                       </tr>
                                     );
                                  })}
                               </tbody>
                            </table>
                         </div>
                         <PromptLegend />
                      </div>
                    ))}
                 </section>

                 {/* Growth Checks Section */}
                 <section className="space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-emerald-600 text-white"><Brain size={24} /></div>
                       <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Growth Checks</h3>
                       <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    </div>

                    {viewingUnit.milestones.length === 0 ? (
                      <div className="p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 opacity-50">
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">No growth checks found for this period.</p>
                      </div>
                    ) : viewingUnit.milestones.map((m, mIdx) => (
                      <div key={m.id} className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-none overflow-hidden shadow-md animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${mIdx * 100}ms` }}>
                         <header className="px-8 py-8 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between bg-emerald-50/20">
                            <div>
                               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Development Assessment</p>
                               <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{m.ageCategory}</h4>
                            </div>
                            <div className="flex items-center gap-8">
                               <div className="text-right">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                                  <p className="text-4xl font-black font-mono text-emerald-600 tracking-tighter">{m.overallPercentage}%</p>
                               </div>
                               <div className="w-16 h-16 border-2 border-slate-900 flex items-center justify-center"><Brain size={32} className="text-emerald-600" /></div>
                            </div>
                         </header>
                         
                         <div className="p-8 space-y-12">
                            {m.sections.map((section, sIdx) => (
                              <div key={sIdx} className="space-y-6">
                                 <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-950 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">{section.title}</h5>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {section.items.map((item, iIdx) => (
                                      <div key={iIdx} className={`flex items-start gap-4 p-5 border-2 transition-all ${item.checked ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-950/40' : 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 opacity-60'}`}>
                                         <div className={`mt-1 shrink-0 w-6 h-6 border-2 flex items-center justify-center ${item.checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200'}`}>
                                            {item.checked ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                                         </div>
                                         <div className="flex-1 min-w-0">
                                            <p className={`text-[13px] font-bold leading-relaxed ${item.checked ? 'text-emerald-900 dark:text-emerald-400' : 'text-slate-500'}`}>{item.text}</p>
                                            <span className="text-[8px] font-black uppercase tracking-widest mt-1 block">{item.checked ? 'Pass' : 'Not Yet'}</span>
                                         </div>
                                      </div>
                                    ))}
                                 </div>
                              </div>
                            ))}

                            {m.redFlags && m.redFlags.length > 0 && (
                              <div className="bg-rose-50 dark:bg-rose-950/20 p-8 border-2 border-dashed border-rose-200 dark:border-rose-800 rounded-none space-y-6">
                                 <div className="flex items-center gap-3">
                                    <AlertTriangle size={24} className="text-rose-600" />
                                    <h5 className="text-lg font-black uppercase tracking-tight text-rose-700 dark:text-rose-500">Noticeable Red Flags</h5>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {m.redFlags.map((flag, fIdx) => (
                                      <div key={fIdx} className={`flex items-start gap-4 p-5 bg-white dark:bg-slate-900 border-2 ${flag.checked ? 'border-rose-600 ring-4 ring-rose-600/10 shadow-xl' : 'border-slate-100 dark:border-slate-800 opacity-50'}`}>
                                         <div className={`mt-1 shrink-0 w-6 h-6 border-2 flex items-center justify-center ${flag.checked ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-slate-200'}`}>
                                            {flag.checked ? <X size={16} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-100" />}
                                         </div>
                                         <div>
                                            <p className={`text-[12px] font-black uppercase tracking-tight ${flag.checked ? 'text-rose-800 dark:text-rose-400' : 'text-slate-400'}`}>{flag.text}</p>
                                            <span className="text-[8px] font-bold uppercase mt-1 block">{flag.checked ? 'Alert: Seen' : 'Not Seen'}</span>
                                         </div>
                                      </div>
                                    ))}
                                 </div>
                              </div>
                            )}
                         </div>
                      </div>
                    ))}
                 </section>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};