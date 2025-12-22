
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  Plus, 
  History,
  CheckCircle2,
  Brain,
  FileText,
  Save,
  Loader2,
  PlusCircle,
  Trash2,
  Activity,
  Zap
} from 'lucide-react';
import { Student, TaskStep, PromptLevel } from '../types';
import { PROMPT_LEVELS } from '../constants';

export const LessonLogs: React.FC = () => {
  const { students, user, staff, selectedStudentIdForLog, setSelectedStudentIdForLog, addClinicalLog, clinicalLogs } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'selection' | 'form' | 'history'>('selection');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [targetBehavior, setTargetBehavior] = useState('');
  const [method, setMethod] = useState<'Forward Chaining' | 'Backward Chaining' | 'Total Task'>('Total Task');
  const [steps, setSteps] = useState<TaskStep[]>([{ id: '1', description: '', promptLevel: '-' }]);

  const selectedStudent = useMemo(() => 
    students.find(s => s.id === selectedStudentIdForLog),
    [students, selectedStudentIdForLog]
  );

  const filteredStudents = useMemo(() => {
    const currentStaff = staff.find(st => st.id === user?.id);
    return students.filter(s => {
      const isAssigned = currentStaff?.assignedClasses?.includes(s.assignedClass) && s.assignedStaffId === user?.id;
      if (!isAssigned && user?.role !== 'SUPER_ADMIN') return false;
      return s.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [students, user, staff, searchTerm]);

  const studentHistory = useMemo(() => {
    if (!selectedStudentIdForLog) return [];
    return clinicalLogs
      .filter(l => l.studentId === selectedStudentIdForLog)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [clinicalLogs, selectedStudentIdForLog]);

  const handleAddStep = () => {
    setSteps([...steps, { id: Date.now().toString(), description: '', promptLevel: '-' }]);
  };

  const handleRemoveStep = (id: string) => {
    if (steps.length > 1) setSteps(steps.filter(s => s.id !== id));
  };

  const updateStep = (id: string, updates: Partial<TaskStep>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleSave = async () => {
    if (!selectedStudentIdForLog || !targetBehavior) return;
    setIsSubmitting(true);
    
    // Calculate independence score: % of steps with '+' prompt level
    const independentSteps = steps.filter(s => s.promptLevel === '+').length;
    const independenceScore = Math.round((independentSteps / steps.length) * 100);

    try {
      await addClinicalLog({
        studentId: selectedStudentIdForLog,
        date: new Date().toISOString(),
        targetBehavior,
        method,
        steps,
        independenceScore,
        staffId: user?.id || 'unknown'
      });
      setActiveView('history');
      setTargetBehavior('');
      setSteps([{ id: '1', description: '', promptLevel: '-' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activeView === 'selection' || !selectedStudentIdForLog) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
              <FileText size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Session Entry</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase leading-none">Lesson Notes</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium italic">Record daily task chaining and behavioral session logs.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sticky top-0 z-30 shadow-sm">
          <div className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search your students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 outline-none" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full py-20 text-center font-bold text-slate-300 uppercase italic text-xs tracking-widest bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
              No students matched your registry.
            </div>
          ) : filteredStudents.map(student => (
            <button 
              key={student.id} 
              onClick={() => { setSelectedStudentIdForLog(student.id); setActiveView('form'); }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] text-left hover:border-emerald-500 hover:shadow-xl transition-all group active:scale-95"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center font-black text-lg uppercase shadow-sm group-hover:scale-110 transition-transform">
                  {student.fullName[0]}
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400">{student.id}</span>
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight truncate group-hover:text-emerald-600">{student.fullName}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{student.assignedClass}</p>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1">Log Session <ChevronRight size={14} /></span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setActiveView('selection'); setSelectedStudentIdForLog(null); }}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-black transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{selectedStudent?.fullName}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Daily Session Logging Terminal</p>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
           <button 
            onClick={() => setActiveView('form')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'form' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
           >
             <Plus size={14} /> New Entry
           </button>
           <button 
            onClick={() => setActiveView('history')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'history' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
           >
             <History size={14} /> History
           </button>
        </div>
      </header>

      {activeView === 'form' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Skill / Behavior</label>
                       <input 
                        value={targetBehavior}
                        onChange={e => setTargetBehavior(e.target.value)}
                        placeholder="e.g. Toothbrushing Sequence"
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teaching Methodology</label>
                       <select 
                        value={method}
                        onChange={e => setMethod(e.target.value as any)}
                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none cursor-pointer"
                       >
                          <option value="Total Task">Total Task</option>
                          <option value="Forward Chaining">Forward Chaining</option>
                          <option value="Backward Chaining">Backward Chaining</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Activity Sequence Steps</h3>
                       <button onClick={handleAddStep} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-black text-[10px] uppercase tracking-widest">
                          <PlusCircle size={14} /> Add Step
                       </button>
                    </div>
                    
                    <div className="space-y-3">
                       {steps.map((step, idx) => (
                         <div key={step.id} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 group animate-in slide-in-from-left duration-300">
                            <div className="flex-1 flex gap-3">
                               <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                                  {(idx + 1).toString().padStart(2, '0')}
                               </div>
                               <input 
                                value={step.description}
                                onChange={e => updateStep(step.id, { description: e.target.value })}
                                placeholder="Task description..."
                                className="w-full bg-transparent border-none outline-none font-bold text-sm dark:text-white"
                               />
                            </div>
                            <div className="flex items-center gap-2">
                               <select 
                                value={step.promptLevel}
                                onChange={e => updateStep(step.id, { promptLevel: e.target.value as PromptLevel })}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border shadow-sm outline-none cursor-pointer ${
                                  PROMPT_LEVELS.find(pl => pl.key === step.promptLevel)?.color || 'bg-white border-slate-200'
                                }`}
                               >
                                  {PROMPT_LEVELS.map(pl => (
                                    <option key={pl.key} value={pl.key}>{pl.key} - {pl.label}</option>
                                  ))}
                               </select>
                               <button onClick={() => handleRemoveStep(step.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 size={16} />
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Zap size={160} />
                 </div>
                 <div className="relative z-10 space-y-8">
                    <div>
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-200 mb-2">Real-time Analysis</h3>
                       <div className="flex items-end gap-3">
                          <p className="text-6xl font-black font-mono leading-none tracking-tighter">
                             {Math.round((steps.filter(s => s.promptLevel === '+').length / steps.length) * 100)}%
                          </p>
                          <span className="text-xs font-black uppercase tracking-widest mb-1">Independence</span>
                       </div>
                    </div>
                    <button 
                      onClick={handleSave}
                      disabled={isSubmitting || !targetBehavior}
                      className="w-full py-5 bg-white text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                       {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Finalize Session Log</>}
                    </button>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Recent Daily Logs</h4>
                 <div className="space-y-4">
                    {studentHistory.slice(0, 3).map(log => (
                      <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white truncate">{log.targetBehavior}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{new Date(log.date).toLocaleDateString()}</p>
                         </div>
                         <span className="text-sm font-black text-emerald-600 font-mono">+{log.independenceScore}%</span>
                      </div>
                    ))}
                    <button onClick={() => setActiveView('history')} className="w-full text-center text-[9px] font-black uppercase text-emerald-600 hover:underline pt-4 border-t border-slate-100 dark:border-slate-800">View Archive</button>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
           <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <tr>
                    <th className="px-8 py-5">Timestamp</th>
                    <th className="px-8 py-5">Behavior / Program</th>
                    <th className="px-8 py-5">Method</th>
                    <th className="px-8 py-5 text-center">Score Node</th>
                    <th className="px-8 py-5 text-right">Details</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                 {studentHistory.length === 0 ? (
                   <tr><td colSpan={5} className="py-24 text-center text-xs font-bold text-slate-300 uppercase italic tracking-widest">No lesson notes recorded.</td></tr>
                 ) : studentHistory.map(log => (
                   <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-emerald-900/5 transition-colors group">
                      <td className="px-8 py-6 text-xs font-bold dark:text-slate-200">{new Date(log.date).toLocaleDateString()}</td>
                      <td className="px-8 py-6 font-black uppercase text-xs tracking-tight">{log.targetBehavior}</td>
                      <td className="px-8 py-6">
                         <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500">{log.method}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <div className="inline-flex items-center gap-2 px-4 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full border border-emerald-100 dark:border-emerald-800">
                            <Activity size={12} />
                            <span className="font-black font-mono">{log.independenceScore}%</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <ChevronRight size={18} className="ml-auto text-slate-300 group-hover:text-emerald-500" />
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};
