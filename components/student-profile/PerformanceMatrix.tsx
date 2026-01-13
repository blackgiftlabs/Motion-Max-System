
import React, { useMemo } from 'react';
import { ChevronRight, FileSpreadsheet, Brain, Download, Loader2, FileText, Printer, Calendar } from 'lucide-react';
import { SessionLog, MilestoneRecord, Student } from '../../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  student: Student;
  logs: SessionLog[];
  milestones: MilestoneRecord[];
  filter: 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Yearly';
  setFilter: (f: 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Yearly') => void;
  onOpenDay: (date: string) => void;
}

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const PerformanceMatrix: React.FC<Props> = ({ student, logs, milestones, filter, setFilter, onOpenDay }) => {
  const [isExporting, setIsExporting] = React.useState<string | null>(null);

  const getWeekRange = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    const end = new Date(start);
    end.setDate(start.getDate() + 4);
    return `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`;
  };

  // Strictly Monday to Friday for the current week
  const mondayToFriday = useMemo(() => {
    const days = [];
    const mon = new Date();
    // Get to the nearest previous Monday
    const currentDay = mon.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    mon.setDate(mon.getDate() + diff);
    
    for (let i = 0; i < 5; i++) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  const groupedMonthly = useMemo(() => {
    const months: Record<string, { logs: SessionLog[]; checks: MilestoneRecord[] }> = {};
    logs.forEach(l => {
      const key = l.date.slice(0, 7);
      if (!months[key]) months[key] = { logs: [], checks: [] };
      months[key].logs.push(l);
    });
    milestones.forEach(m => {
      const key = m.timestamp.slice(0, 7);
      if (!months[key]) months[key] = { logs: [], checks: [] };
      months[key].checks.push(m);
    });
    return months;
  }, [logs, milestones]);

  const groupedYearly = useMemo(() => {
    const years: Record<string, { logs: SessionLog[]; checks: MilestoneRecord[] }> = {};
    logs.forEach(l => {
      const key = l.date.slice(0, 4);
      if (!years[key]) years[key] = { logs: [], checks: [] };
      years[key].logs.push(l);
    });
    milestones.forEach(m => {
      const key = m.timestamp.slice(0, 4);
      if (!years[key]) years[key] = { logs: [], checks: [] };
      years[key].checks.push(m);
    });
    return years;
  }, [logs, milestones]);

  const generateReport = async (reportId: string, title: string, dataLogs: SessionLog[], dataChecks: MilestoneRecord[]) => {
    setIsExporting(reportId);
    const doc = new jsPDF();
    
    try {
      doc.addImage(LogoImg, 'PNG', 15, 10, 25, 25);
    } catch (e) {
      doc.setFontSize(22);
      doc.setTextColor(21, 74, 112);
      doc.text("MOTION MAX", 15, 25);
    }

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("27 Colnebrook Lane, Harare", 195, 15, { align: 'right' });
    doc.text("admin@motionmax.co.zw", 195, 20, { align: 'right' });
    doc.text("+263 775 926 454", 195, 25, { align: 'right' });

    doc.setDrawColor(200);
    doc.line(15, 40, 195, 40);
    
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text(title.toUpperCase(), 15, 52);
    
    doc.setFontSize(11);
    doc.text(`Student: ${student.fullName}`, 15, 62);
    doc.text(`Student ID: ${student.id}`, 15, 68);
    doc.text(`Class Room: ${student.assignedClass}`, 15, 74);
    doc.text(`Printed On: ${new Date().toLocaleDateString()}`, 195, 62, { align: 'right' });

    const tableBody = dataLogs.map(l => [
      new Date(l.date).toLocaleDateString(),
      l.targetBehavior,
      l.method,
      `${l.independenceScore}% Success`
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['Date Recorded', 'Goal Worked On', 'Teaching Method', 'Result Score']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [21, 74, 112], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [245, 248, 250] }
    });

    if (dataChecks.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("GROWTH CHECKLIST SUMMARY", 15, 20);
      
      autoTable(doc, {
        startY: 30,
        head: [['Date Checked', 'Age Group Category', 'Overall Progress Score']],
        body: dataChecks.map(c => [
          new Date(c.timestamp).toLocaleDateString(),
          c.ageCategory,
          `${c.overallPercentage}% Mastery`
        ]),
        headStyles: { fillColor: [16, 185, 129] }
      });
    }

    const pageCount = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Official Motion Max Day Services Record // Generated: ${new Date().toLocaleString()}`, 105, 285, { align: 'center' });
      doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
    }

    doc.save(`${student.lastName}_${title.replace(' ', '_')}.pdf`);
    setIsExporting(null);
  };

  const btnClass = (active: boolean) => `px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-slate-900 text-white dark:bg-blue-600' : 'text-slate-500 hover:text-black'}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-900 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-none">
             <Calendar size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white leading-none">Activity Registry</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase mt-2 tracking-widest italic">Monday to Friday Node Tracker</p>
          </div>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-none border-2 border-slate-900 dark:border-slate-800 shadow-sm">
          {['Weekly', 'Monthly', 'Yearly'].map((f: any) => (
            <button key={f} onClick={() => setFilter(f)} className={btnClass(filter === f)}>{f}</button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {filter === 'Weekly' && (
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 rounded-none overflow-hidden shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-tight">Active School Week</h4>
                <p className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-widest">{getWeekRange(new Date())}</p>
              </div>
              <div className="text-right hidden sm:block">
                 <span className="text-[8px] font-black uppercase text-slate-400 block tracking-widest">Registry ID</span>
                 <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white uppercase">WK-{new Date().getFullYear()}-{Math.ceil(new Date().getDate()/7)}</span>
              </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left table-fixed sm:table-auto">
                <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase text-black dark:text-white border-b border-slate-900">
                  <tr>
                    <th className="px-6 py-5 w-1/3">Day / Identity</th>
                    <th className="px-6 py-5 hidden sm:table-cell text-center">Data Nodes</th>
                    <th className="px-6 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mondayToFriday.map(date => {
                    const dayLogs = logs.filter(l => l.date.split('T')[0] === date);
                    const dayMile = milestones.filter(m => m.timestamp.split('T')[0] === date);
                    const isToday = new Date().toISOString().split('T')[0] === date;
                    
                    return (
                      <tr key={date} className={`group transition-colors ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <td className="px-6 py-6 flex items-center gap-4">
                          <div className={`w-12 h-12 flex flex-col items-center justify-center border-2 rounded-none transition-colors ${isToday ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 group-hover:border-blue-400'}`}>
                             <span className="text-[8px] font-black uppercase leading-none mb-1">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                             <span className="text-sm font-black font-mono leading-none">{new Date(date).getDate()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase text-black dark:text-white truncate tracking-tight">{new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                            <p className="text-[9px] font-mono font-bold text-slate-400">{date}</p>
                          </div>
                        </td>
                        <td className="px-6 py-6 hidden sm:table-cell text-center">
                           <div className="flex items-center justify-center gap-2">
                              <span className={`px-2.5 py-1 text-[9px] font-black border-2 rounded-none ${dayLogs.length > 0 ? 'bg-blue-50 text-blue-700 border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                                {dayLogs.length} LOGS
                              </span>
                              <span className={`px-2.5 py-1 text-[9px] font-black border-2 rounded-none ${dayMile.length > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                                {dayMile.length} CHECKS
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                           <button 
                            onClick={() => onOpenDay(date)} 
                            className="px-5 py-2.5 bg-slate-900 dark:bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-none active:scale-95 transition-all shadow-md hover:bg-black dark:hover:bg-blue-700"
                           >
                              Open Day
                           </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-900 flex items-center justify-between">
               <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Real-time Node Monitoring</span>
               </div>
               <p className="text-[9px] font-mono text-slate-400 uppercase">Registry Status: 1.0.4-LOCKED</p>
            </div>
          </div>
        )}

        {filter === 'Monthly' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {Object.entries(groupedMonthly).map(([key, data]: [string, any]) => {
              const monthName = new Date(key + '-01').toLocaleString('default', { month: 'long' });
              const reportTitle = `Monthly Report ${monthName} ${key.slice(0, 4)}`;
              return (
                <div key={key} className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 p-8 rounded-none shadow-sm flex flex-col justify-between group hover:border-blue-500 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-black uppercase text-black dark:text-white leading-none">{monthName}</h4>
                        <p className="text-[10px] font-mono font-bold text-slate-400">{key.slice(0, 4)}</p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">Lesson Notes</span>
                          <span className="text-xs font-black text-blue-600">{data.logs.length} Records</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">Growth Checks</span>
                          <span className="text-xs font-black text-emerald-600">{data.checks.length} Records</span>
                        </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => generateReport(key, reportTitle, data.logs, data.checks)}
                    disabled={isExporting === key}
                    className="w-full mt-10 py-4 bg-slate-900 dark:bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-none shadow-lg hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {isExporting === key ? <Loader2 size={16} className="animate-spin" /> : <><Download size={16} /> Download Full Report</>}
                  </button>
                </div>
              );
            })}
            {Object.keys(groupedMonthly).length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 opacity-50">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No monthly records found in terminal</p>
              </div>
            )}
          </div>
        )}

        {filter === 'Yearly' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {Object.entries(groupedYearly).map(([year, data]: [string, any]) => {
              const reportTitle = `Annual Progress Report ${year}`;
              return (
                <div key={year} className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-800 p-10 rounded-none shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group">
                  <div className="text-center md:text-left">
                    <h4 className="text-6xl font-black uppercase text-black dark:text-white tracking-tighter">{year}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-[0.4em]">Annual Summary</p>
                  </div>
                  <div className="flex-1 text-center md:text-right space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white">{data.logs.length} Teacher Lessons</p>
                    <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white">{data.checks.length} Growth Checks</p>
                    <button 
                      onClick={() => generateReport(year, reportTitle, data.logs, data.checks)}
                      disabled={isExporting === year}
                      className="px-10 py-4 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest mt-4 shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {isExporting === year ? <Loader2 size={16} className="animate-spin" /> : <><FileText size={16} /> Get Annual Report</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
