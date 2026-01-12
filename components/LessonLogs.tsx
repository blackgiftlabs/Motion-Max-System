
import React, { useState, useMemo, useEffect } from 'react';
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
  Zap,
  LayoutGrid,
  FileSpreadsheet,
  MessageSquarePlus,
  Clock,
  X,
  Calendar
} from 'lucide-react';
import { Student, TaskStep, PromptLevel, ProgramRequest } from '../types';
import { PROMPT_LEVELS } from '../constants';

export const LessonLogs: React.FC = () => {
  const { students, user, staff, selectedStudentIdForLog, setSelectedStudentIdForLog, addClinicalLog, clinicalLogs, milestoneRecords, settings } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeView, setActiveView] = useState<'selection' | 'workspace' | 'history'>(
    selectedStudentIdForLog ? 'workspace' : 'selection'
  );

  useEffect(() => {
    if (selectedStudentIdForLog) {
      setActiveView('workspace');
    }
  }, [selectedStudentIdForLog]);

  const [workspaceMode, setWorkspaceMode] = useState<'datasheet' | 'program'>('datasheet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [targetBehavior, setTargetBehavior] = useState('');
  const [method, setMethod] = useState<'Forward Chaining' | 'Backward Chaining' | 'Total Task'>('Total Task');
  
  // Workspace Form State - Pre-load from settings
  const [steps, setSteps] = useState<TaskStep[]>([]);

  useEffect(() => {
    if (settings?.defaultTaskSteps && settings.defaultTaskSteps.length > 0) {
      const initialSteps = settings.defaultTaskSteps.map((desc, i) => ({
        id: `default-${i}-${Date.now()}`,
        description: desc,
        trials: Array(10).fill('-') as PromptLevel[]
      }));
      setSteps(initialSteps);
    } else {
      setSteps([
        { id: '1', description: 'Step 1', trials: Array(10).fill('-') },
        { id: '2', description: 'Step 2', trials: Array(10).fill('-') }
      ]);
    }
  }, [settings?.defaultTaskSteps]);

  const [programRequests, setProgramRequests] = useState<ProgramRequest[]>([
    { id: 'p1', activity: '', echoicTempted: 0, noVerbalTempted: 0, noEchoicNoTempting: 0 }
  ]);
  const [goalPerHour, setGoalPerHour] = useState<string>('');
  const [actualHour, setActualHour] = useState<string>('');

  const selectedStudent = useMemo(() => 
    students.find(s => s.id === selectedStudentIdForLog),
    [students, selectedStudentIdForLog]
  );

  const studentMastery = useMemo(() => {
    if (!selectedStudentIdForLog) return 0;
    const latest = milestoneRecords
      .filter(r => r.studentId === selectedStudentIdForLog)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    return latest?.overallPercentage || 0;
  }, [milestoneRecords, selectedStudentIdForLog]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const isAssigned = (user?.role === 'SUPER_ADMIN') || s.assignedStaffId === user?.id;
      if (!isAssigned) return false;
      return s.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [students, user, searchTerm]);

  const handleAddStep = () => {
    setSteps([...steps, { id: Date.now().toString(), description: '', trials: Array(10).fill('-') }]);
  };

  const handleRemoveStep = (id: string) => {
    if (confirm("Delete this step from today's lesson?")) {
      setSteps(steps.filter(s => s.id !== id));
    }
  };

  const handleAddProgramRequest = () => {
    setProgramRequests([...programRequests, { id: Date.now().toString(), activity: '', echoicTempted: 0, noVerbalTempted: 0, noEchoicNoTempting: 0 }]);
  };

  const handleSave = async () => {
    if (!selectedStudentIdForLog || !targetBehavior) return;
    setIsSubmitting(true);
    
    const allTrials = steps.flatMap(s => s.trials);
    const independentCount = allTrials.filter(t => t === '+').length;
    const independenceScore = Math.round((independentCount / (allTrials.length || 1)) * 100);

    try {
      await addClinicalLog({
        studentId: selectedStudentIdForLog,
        date: new Date().toISOString(),
        targetBehavior,
        method,
        steps,
        programRequests,
        independenceScore,
        staffId: user?.id || 'unknown',
        goalPerHour: parseFloat(goalPerHour) || 0,
        actualHour: parseFloat(actualHour) || 0
      });
      setActiveView('history');
    } finally {
      setIsSubmitting(false);
    }
  };

  const borderStyle = "border-[#183D4A] dark:border-[#9DB6BF]";
  const inputStyle = `w-full p-4 border-2 ${borderStyle} text-black dark:text-white bg-white dark:bg-slate-900 rounded-none outline-none font-bold placeholder:opacity-50 transition-all`;

  if (activeView === 'selection' || !selectedStudentIdForLog) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-none text-emerald-600">
              <FileSpreadsheet size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Task Recording</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase leading-none">Lesson Notes</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium italic">Pick a student to start recording their lesson.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-4 sticky top-0 z-30 shadow-sm">
          <div className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 rounded-none text-xs font-bold border border-slate-200 dark:border-slate-800 outline-none" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map(student => (
            <button 
              key={student.id} 
              onClick={() => { setSelectedStudentIdForLog(student.id); setActiveView('workspace'); }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-none text-left hover:border-emerald-500 hover:shadow-xl transition-all group active:scale-95 flex flex-col justify-between min-h-[180px]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-none bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center font-black text-lg uppercase shadow-sm group-hover:scale-110 transition-transform">
                  {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover" /> : student.fullName[0]}
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block">{student.id}</span>
                  <span className="text-[10px] font-black text-blue-600 uppercase mt-1 block">{student.assignedClass}</span>
                </div>
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight truncate group-hover:text-emerald-600">{student.fullName}</h3>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Write Notes</span>
                  <ChevronRight size={14} className="text-emerald-600" />
                </div>
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
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-slate-400 hover:text-black transition-all shadow-sm active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-emerald-600 text-white flex items-center justify-center font-black text-xl rounded-none">
               {selectedStudent?.fullName[0]}
             </div>
             <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{selectedStudent?.fullName}</h1>
                <div className="flex items-center gap-3 mt-2">
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">New Lesson</p>
                   <span className="text-[8px] text-slate-200">|</span>
                   <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest">Mastery: {studentMastery}%</p>
                </div>
             </div>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-none border border-slate-200 dark:border-slate-800 shadow-inner">
           <button 
            onClick={() => setActiveView('workspace')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'workspace' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
           >
             <Plus size={14} /> New Lesson
           </button>
           <button 
            onClick={() => setActiveView('history')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'history' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
           >
             <History size={14} /> Past Lessons
           </button>
        </div>
      </header>

      {activeView === 'workspace' && (
        <div className="space-y-8 pb-24">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setWorkspaceMode('datasheet')}
                className={`p-10 border-2 transition-all flex flex-col items-center text-center gap-6 relative overflow-hidden rounded-none ${workspaceMode === 'datasheet' ? 'bg-white dark:bg-slate-900 border-emerald-600 shadow-2xl' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
              >
                 <FileSpreadsheet size={48} className={workspaceMode === 'datasheet' ? 'text-emerald-600' : 'text-slate-400'} />
                 <div>
                    <h4 className="font-black uppercase text-base mb-2 dark:text-white">Activity Record</h4>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Track steps and trials</p>
                 </div>
                 {workspaceMode === 'datasheet' && <div className="absolute top-4 right-4 text-emerald-600"><CheckCircle2 size={24}/></div>}
              </button>

              <button 
                onClick={() => setWorkspaceMode('program')}
                className={`p-10 border-2 transition-all flex flex-col items-center text-center gap-6 relative overflow-hidden rounded-none ${workspaceMode === 'program' ? 'bg-white dark:bg-slate-900 border-blue-600 shadow-2xl' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
              >
                 <MessageSquarePlus size={48} className={workspaceMode === 'program' ? 'text-blue-600' : 'text-slate-400'} />
                 <div>
                    <h4 className="font-black uppercase text-base mb-2 dark:text-white">Speech Goals</h4>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Track talking and sounds</p>
                 </div>
                 {workspaceMode === 'program' && <div className="absolute top-4 right-4 text-blue-600"><CheckCircle2 size={24}/></div>}
              </button>
           </div>

           {workspaceMode === 'datasheet' ? (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-left duration-500">
                <div className="lg:col-span-12 space-y-6">
                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-10 shadow-sm space-y-10">
                      <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                         <div className="space-y-4 w-full md:w-auto">
                            <label className="text-[10px] font-black uppercase text-slate-400">Lesson Name</label>
                            <input 
                              value={targetBehavior}
                              onChange={e => setTargetBehavior(e.target.value)}
                              placeholder="e.g. Brushing Teeth"
                              className={inputStyle}
                            />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400">Learning Method</label>
                            <select 
                             value={method}
                             onChange={e => setMethod(e.target.value as any)}
                             className={inputStyle.replace('p-4', 'p-4 py-[1.125rem]')}
                            >
                               <option value="Total Task">Total Task</option>
                               <option value="Forward Chaining">Forward Chaining</option>
                               <option value="Backward Chaining">Backward Chaining</option>
                            </select>
                         </div>
                      </header>

                      <div className="overflow-x-auto">
                         <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                               <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  <th className="px-6 py-4 w-48">Describe the Step</th>
                                  {[...Array(10)].map((_, i) => <th key={i} className="px-2 py-4 text-center">Trial {i+1}</th>)}
                                  <th className="px-4 py-4 text-right">Remove</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                               {steps.map((step, sIdx) => (
                                 <tr key={step.id} className="group">
                                    <td className="px-6 py-4">
                                       <input 
                                         value={step.description}
                                         onChange={e => {
                                           const next = [...steps];
                                           next[sIdx].description = e.target.value;
                                           setSteps(next);
                                         }}
                                         placeholder="Write step..."
                                         className="w-full bg-transparent font-bold text-sm outline-none focus:text-emerald-600 dark:text-white"
                                       />
                                    </td>
                                    {step.trials.map((trial, tIdx) => (
                                      <td key={tIdx} className="px-1 py-4">
                                         <select 
                                           value={trial}
                                           onChange={e => {
                                             const next = [...steps];
                                             next[sIdx].trials[tIdx] = e.target.value as PromptLevel;
                                             setSteps(next);
                                           }}
                                           className={`w-full h-10 rounded-none border-2 text-[10px] font-black appearance-none text-center cursor-pointer transition-all ${
                                             trial !== '-' ? `border-[#183D4A] dark:border-[#9DB6BF]` : 'border-slate-100 dark:border-slate-800'
                                           } ${PROMPT_LEVELS.find(pl => pl.key === trial)?.color || 'bg-white dark:bg-slate-800 text-slate-300'}`}
                                         >
                                            <option value="-">-</option>
                                            {PROMPT_LEVELS.map(pl => <option key={pl.key} value={pl.key}>{pl.key}</option>)}
                                         </select>
                                      </td>
                                    ))}
                                    <td className="px-4 py-4 text-right">
                                       <button onClick={() => handleRemoveStep(step.id)} className="text-slate-200 hover:text-rose-500 p-2 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                                    </td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                      <button onClick={handleAddStep} className="flex items-center gap-3 text-emerald-600 font-black uppercase text-[10px] tracking-widest hover:text-emerald-700 transition-colors">
                         <PlusCircle size={18} /> Add New Step
                      </button>
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-10 animate-in slide-in-from-right duration-500 shadow-sm space-y-10">
                <header className="border-b border-slate-100 dark:border-slate-800 pb-8 space-y-2">
                   <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Speech Goal Form</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Track sounds, words, and repeats</p>
                </header>

                <div className="overflow-x-auto">
                   <table className="w-full border-collapse">
                      <thead>
                         <tr className="bg-slate-50 dark:bg-slate-950 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">
                            <th className="px-6 py-4 text-left w-64">What are they saying?</th>
                            <th className="px-4 py-4">Echoic/Verbal (Helped)</th>
                            <th className="px-4 py-4">No Verbal (Just Tried)</th>
                            <th className="px-4 py-4">No Echoic (Independent)</th>
                            <th className="px-4 py-4 text-right w-16">Remove</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {programRequests.map((req, rIdx) => (
                           <tr key={req.id}>
                              <td className="px-6 py-5">
                                 <input 
                                   value={req.activity}
                                   onChange={e => {
                                      const next = [...programRequests];
                                      next[rIdx].activity = e.target.value;
                                      setProgramRequests(next);
                                   }}
                                   placeholder="Activity details..."
                                   className="w-full bg-transparent font-bold text-sm outline-none focus:text-blue-600 dark:text-white"
                                 />
                              </td>
                              <td className="px-4 py-5">
                                 <input type="number" value={req.echoicTempted || ''} onChange={e => { const next = [...programRequests]; next[rIdx].echoicTempted = parseInt(e.target.value) || 0; setProgramRequests(next); }} className={`${inputStyle} w-24 mx-auto text-center font-black rounded-none shadow-inner`} />
                              </td>
                              <td className="px-4 py-5">
                                 <input type="number" value={req.noVerbalTempted || ''} onChange={e => { const next = [...programRequests]; next[rIdx].noVerbalTempted = parseInt(e.target.value) || 0; setProgramRequests(next); }} className={`${inputStyle} w-24 mx-auto text-center font-black rounded-none shadow-inner`} />
                              </td>
                              <td className="px-4 py-5">
                                 <input type="number" value={req.noEchoicNoTempting || ''} onChange={e => { const next = [...programRequests]; next[rIdx].noEchoicNoTempting = parseInt(e.target.value) || 0; setProgramRequests(next); }} className={`${inputStyle} w-24 mx-auto text-center font-black rounded-none shadow-inner`} />
                              </td>
                              <td className="px-4 py-5 text-right">
                                 <button onClick={() => setProgramRequests(programRequests.filter(p => p.id !== req.id))} className="text-slate-200 hover:text-rose-500 transition-all"><X size={18}/></button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                <div className="flex flex-col md:flex-row items-end justify-between gap-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                   <button onClick={handleAddProgramRequest} className="flex items-center gap-3 text-blue-600 font-black uppercase text-[10px] tracking-widest hover:text-blue-700 transition-colors">
                      <Plus size={18} /> Add Word Target
                   </button>
                   
                   <div className="flex gap-6 w-full md:w-auto">
                      <div className="space-y-4">
                         <label className="text-[9px] font-black uppercase text-slate-400">Total Lesson Goal</label>
                         <input value={goalPerHour} onChange={e => setGoalPerHour(e.target.value)} type="number" className={`${inputStyle} w-32 font-black font-mono text-center`} />
                      </div>
                      <div className="space-y-4">
                         <label className="text-[9px] font-black uppercase text-slate-400">Actual Results</label>
                         <input value={actualHour} onChange={e => setActualHour(e.target.value)} type="number" className={`${inputStyle} w-32 font-black font-mono text-center`} />
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* Action Bar */}
           <div className="fixed bottom-0 left-0 md:left-64 right-0 p-6 bg-slate-900 text-white flex items-center justify-between z-[400] shadow-2xl animate-in slide-in-from-bottom duration-500">
              <div className="flex items-center gap-10">
                 <div className="hidden sm:block">
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Success Level</p>
                    <div className="flex items-center gap-4">
                       <p className="text-4xl font-black font-mono leading-none tracking-tighter text-emerald-500">
                          {Math.round((steps.flatMap(s => s.trials).filter(t => t === '+').length / (steps.flatMap(s => s.trials).length || 1)) * 100)}%
                       </p>
                       <Zap size={24} className="text-amber-400 fill-amber-400" />
                    </div>
                 </div>
                 <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                 <div className="hidden lg:block">
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Overall Profile</p>
                    <p className="text-sm font-black text-blue-400 uppercase tracking-tight">{studentMastery}% Progress</p>
                 </div>
              </div>
              
              <div className="flex gap-4">
                 <button onClick={() => setSelectedStudentIdForLog(null)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Discard</button>
                 <button 
                  onClick={handleSave}
                  disabled={isSubmitting || !targetBehavior}
                  className="px-12 py-4 bg-emerald-600 text-white font-black uppercase tracking-[0.4em] text-[10px] shadow-xl hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-4"
                 >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <>Save Lesson Notes <CheckCircle2 size={18}/></>}
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeView === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500 pb-20">
           <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Lesson History</h3>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[8px] font-mono text-slate-400">DATABASE_SYNCED</span>
              </div>
           </div>
           <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <tr>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Lesson / Goal</th>
                    <th className="px-8 py-5">Method</th>
                    <th className="px-8 py-5 text-center">Result</th>
                    <th className="px-8 py-5 text-right">View</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                 {(clinicalLogs || []).filter(l => l.studentId === selectedStudentIdForLog).length === 0 ? (
                   <tr><td colSpan={5} className="py-24 text-center text-xs font-bold text-slate-300 uppercase italic tracking-widest">No past lessons found.</td></tr>
                 ) : clinicalLogs.filter(l => l.studentId === selectedStudentIdForLog).map(log => (
                   <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-emerald-900/5 transition-colors group cursor-default">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-3">
                            <Calendar size={14} className="text-slate-300" />
                            <p className="text-xs font-bold dark:text-white">{new Date(log.date).toLocaleDateString()}</p>
                         </div>
                      </td>
                      <td className="px-8 py-6 font-black uppercase text-xs tracking-tight dark:text-white">{log.targetBehavior}</td>
                      <td className="px-8 py-6">
                         <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-none text-[9px] font-black uppercase tracking-widest text-slate-500">{log.method}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <div className="inline-flex items-center gap-2 px-4 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-none border border-emerald-100 dark:border-emerald-800">
                            <Activity size={12} />
                            <span className="font-black font-mono text-lg">+{log.independenceScore}%</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <ChevronRight size={18} className="ml-auto text-slate-200 group-hover:text-emerald-500 transition-all" />
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
