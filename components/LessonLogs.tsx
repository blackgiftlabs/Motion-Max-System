
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
  Calendar,
  BookOpen,
  Mic2
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
    setSteps(steps.filter(s => s.id !== id));
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

  if (activeView === 'selection' || !selectedStudentIdForLog) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header className="border-b border-ghBorder pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-md">
              <BookOpen size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Classroom Ledger</span>
          </div>
          <h1 className="text-3xl font-black text-ghText dark:text-white uppercase tracking-tight">Record Daily Lessons</h1>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 font-medium italic">Select a student profile to start their session notes.</p>
        </header>

        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-4 sticky top-0 z-30 shadow-sm rounded-xl">
          <div className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900 dark:text-slate-100" />
            <input 
              type="text" 
              placeholder="Type student name to search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 rounded-lg text-sm font-bold border border-slate-300 dark:border-slate-700 outline-none focus:border-googleBlue transition-all" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredStudents.map(student => (
            <button 
              key={student.id} 
              onClick={() => { setSelectedStudentIdForLog(student.id); setActiveView('workspace'); }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl p-6 text-left hover:border-emerald-500 hover:shadow-xl transition-all group active:scale-95 flex flex-col justify-between min-h-[200px] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900 group-hover:bg-emerald-500 transition-colors"></div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-slate-50 border-2 border-slate-900 overflow-hidden flex items-center justify-center font-black text-xl text-slate-900 shadow-inner group-hover:scale-110 transition-transform">
                  {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover" alt="" /> : student.fullName[0]}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-black text-slate-900 dark:text-white uppercase block tracking-tighter">{student.id}</span>
                  <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[8px] font-black uppercase mt-1 inline-block border border-slate-900">{student.assignedClass}</span>
                </div>
              </div>
              <div>
                <h3 className="font-black text-base text-ghText dark:text-white uppercase leading-tight truncate">{student.fullName}</h3>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Open Workspace</span>
                  <ChevronRight size={16} className="text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-slate-900 pb-8">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => { setActiveView('selection'); setSelectedStudentIdForLog(null); }}
            className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-xl text-slate-900 dark:text-white hover:bg-slate-50 transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-5">
             <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-black text-2xl rounded-2xl shadow-xl border-4 border-white">
               {selectedStudent?.fullName[0]}
             </div>
             <div>
                <h1 className="text-3xl font-black text-ghText dark:text-white uppercase tracking-tight leading-none">{selectedStudent?.fullName}</h1>
                <div className="flex items-center gap-3 mt-3">
                   <p className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg border-2 border-slate-900">Live Lesson Session</p>
                   <span className="text-slate-900 dark:text-white font-black">|</span>
                   <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">Mastery Level: {studentMastery}%</p>
                </div>
             </div>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border-2 border-slate-900 shadow-inner">
           <button 
            onClick={() => setActiveView('workspace')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'workspace' ? 'bg-slate-900 text-white shadow-sm border border-slate-900' : 'text-slate-500 hover:text-ghText'}`}
           >
             <Plus size={14} /> New Lesson
           </button>
           <button 
            onClick={() => setActiveView('history')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'history' ? 'bg-slate-900 text-white shadow-sm border border-slate-900' : 'text-slate-500 hover:text-ghText'}`}
           >
             <History size={14} /> Past Records
           </button>
        </div>
      </header>

      {activeView === 'workspace' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           {/* Section Selector */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setWorkspaceMode('datasheet')}
                className={`group p-8 border-2 transition-all flex items-center justify-between relative overflow-hidden rounded-2xl ${workspaceMode === 'datasheet' ? 'bg-emerald-50 border-emerald-600 shadow-lg dark:bg-emerald-900/20' : 'bg-white dark:bg-slate-900 border-slate-900 grayscale hover:grayscale-0'}`}
              >
                 <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-xl border-2 border-slate-900 ${workspaceMode === 'datasheet' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <FileSpreadsheet size={32} />
                    </div>
                    <div className="text-left">
                       <h4 className="font-black uppercase text-base dark:text-white text-slate-900">Activity Checklist</h4>
                       <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mt-1">Daily task analysis grid</p>
                    </div>
                 </div>
                 {workspaceMode === 'datasheet' && <CheckCircle2 size={24} className="text-emerald-600" />}
              </button>

              <button 
                onClick={() => setWorkspaceMode('program')}
                className={`group p-8 border-2 transition-all flex items-center justify-between relative overflow-hidden rounded-2xl ${workspaceMode === 'program' ? 'bg-blue-50 border-blue-600 shadow-lg dark:bg-blue-900/20' : 'bg-white dark:bg-slate-900 border-slate-900 grayscale hover:grayscale-0'}`}
              >
                 <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-xl border-2 border-slate-900 ${workspaceMode === 'program' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Mic2 size={32} />
                    </div>
                    <div className="text-left">
                       <h4 className="font-black uppercase text-base dark:text-white text-slate-900">Speech & Sounds</h4>
                       <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mt-1">Track communication goals</p>
                    </div>
                 </div>
                 {workspaceMode === 'program' && <CheckCircle2 size={24} className="text-blue-600" />}
              </button>
           </div>

           {workspaceMode === 'datasheet' ? (
             <div className="space-y-8">
                {/* Lesson Details Container */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl p-8 shadow-sm">
                   <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-[0.2em] mb-8 border-b-2 border-slate-100 dark:border-slate-800 pb-4">Lesson Details</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-900 dark:text-white ml-1">What is the student learning?</label>
                         <input 
                           value={targetBehavior}
                           onChange={e => setTargetBehavior(e.target.value)}
                           placeholder="e.g. Tying Shoelaces"
                           className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-900 rounded-xl font-bold outline-none focus:border-googleBlue transition-all shadow-inner text-slate-900 dark:text-white"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-900 dark:text-white ml-1">Teaching Style</label>
                         <select 
                          value={method}
                          onChange={e => setMethod(e.target.value as any)}
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-900 rounded-xl font-bold outline-none focus:border-googleBlue transition-all cursor-pointer shadow-inner text-slate-900 dark:text-white"
                         >
                            <option value="Total Task">Complete Task Marking</option>
                            <option value="Forward Chaining">Step-by-Step (Forward)</option>
                            <option value="Backward Chaining">Step-by-Step (Backward)</option>
                         </select>
                      </div>
                   </div>
                </div>

                {/* Marking Grid Container */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl overflow-hidden shadow-sm">
                   <header className="px-8 py-5 border-b-2 border-slate-900 bg-slate-100 dark:bg-slate-950/50 flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-[0.2em]">Marking Grid (Trials 1-10)</h3>
                      <button onClick={handleAddStep} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase hover:bg-emerald-600 transition-all shadow-md active:scale-95">
                         <Plus size={14} /> Add New Task Step
                      </button>
                   </header>
                   <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[1100px]">
                         <thead className="bg-slate-50 dark:bg-slate-950 text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white border-b-2 border-slate-900">
                            <tr>
                               <th className="px-8 py-4 w-64">Task Step Description</th>
                               {[...Array(10)].map((_, i) => <th key={i} className="px-1 py-4 text-center w-16 border-l-2 border-slate-900">T{i+1}</th>)}
                               <th className="px-8 py-4 text-right w-20 border-l-2 border-slate-900">Action</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {steps.length === 0 ? (
                              <tr>
                                <td colSpan={12} className="py-20 text-center">
                                   <Zap size={32} className="mx-auto text-slate-200 mb-4" />
                                   <p className="text-[10px] font-black uppercase text-slate-400">No steps added yet</p>
                                </td>
                              </tr>
                            ) : steps.map((step, sIdx) => (
                              <tr key={step.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                 <td className="px-8 py-5">
                                    <input 
                                      value={step.description}
                                      onChange={e => {
                                        const next = [...steps];
                                        next[sIdx].description = e.target.value;
                                        setSteps(next);
                                      }}
                                      placeholder="Describe this step..."
                                      className="w-full bg-transparent font-bold text-sm outline-none focus:text-googleBlue dark:text-white text-slate-900"
                                    />
                                 </td>
                                 {step.trials.map((trial, tIdx) => (
                                   <td key={tIdx} className="px-1 py-4 border-l-2 border-slate-100 dark:border-slate-800">
                                      <select 
                                        value={trial}
                                        onChange={e => {
                                          const next = [...steps];
                                          next[sIdx].trials[tIdx] = e.target.value as PromptLevel;
                                          setSteps(next);
                                        }}
                                        className={`w-full h-10 rounded-lg border-2 text-[10px] font-black appearance-none text-center cursor-pointer transition-all ${
                                          trial !== '-' ? `border-slate-900` : 'border-slate-300 dark:border-slate-700'
                                        } ${PROMPT_LEVELS.find(pl => pl.key === trial)?.color || 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'}`}
                                      >
                                         <option value="-">-</option>
                                         {PROMPT_LEVELS.map(pl => <option key={pl.key} value={pl.key} title={pl.label}>{pl.key}</option>)}
                                      </select>
                                   </td>
                                 ))}
                                 <td className="px-8 py-5 text-right border-l-2 border-slate-100 dark:border-slate-800">
                                    <button onClick={() => handleRemoveStep(step.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                      <Trash2 size={16}/>
                                    </button>
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl p-8 shadow-sm space-y-10">
                <header className="border-b-2 border-slate-100 dark:border-slate-800 pb-6">
                   <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-[0.2em]">Speech Monitoring</h3>
                </header>

                <div className="overflow-x-auto">
                   <table className="w-full border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white border-b-2 border-slate-900">
                         <tr>
                            <th className="px-8 py-5 text-left">Speech Activity / Words</th>
                            <th className="px-4 py-5 text-center">Helped (Echoic)</th>
                            <th className="px-4 py-5 text-center">Tried (Non-Verbal)</th>
                            <th className="px-4 py-5 text-center">Independent</th>
                            <th className="px-8 py-5 text-right w-16">Remove</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                         {programRequests.map((req, rIdx) => (
                           <tr key={req.id}>
                              <td className="px-8 py-6">
                                 <input 
                                   value={req.activity}
                                   onChange={e => {
                                      const next = [...programRequests];
                                      next[rIdx].activity = e.target.value;
                                      setProgramRequests(next);
                                   }}
                                   placeholder="e.g. Saying 'Water'"
                                   className="w-full bg-transparent font-bold text-sm outline-none focus:text-blue-600 dark:text-white text-slate-900"
                                 />
                              </td>
                              <td className="px-4 py-6">
                                 <input type="number" value={req.echoicTempted || ''} onChange={e => { const next = [...programRequests]; next[rIdx].echoicTempted = parseInt(e.target.value) || 0; setProgramRequests(next); }} className="w-24 mx-auto text-center font-black font-mono bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 p-3 rounded-lg outline-none text-slate-900 dark:text-white" />
                              </td>
                              <td className="px-4 py-6">
                                 <input type="number" value={req.noVerbalTempted || ''} onChange={e => { const next = [...programRequests]; next[rIdx].noVerbalTempted = parseInt(e.target.value) || 0; setProgramRequests(next); }} className="w-24 mx-auto text-center font-black font-mono bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 p-3 rounded-lg outline-none text-slate-900 dark:text-white" />
                              </td>
                              <td className="px-4 py-6">
                                 <input type="number" value={req.noEchoicNoTempting || ''} onChange={e => { const next = [...programRequests]; next[rIdx].noEchoicNoTempting = parseInt(e.target.value) || 0; setProgramRequests(next); }} className="w-24 mx-auto text-center font-black font-mono bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 p-3 rounded-lg outline-none text-slate-900 dark:text-white" />
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <button onClick={() => setProgramRequests(programRequests.filter(p => p.id !== req.id))} className="text-slate-300 hover:text-rose-500 p-2"><X size={18}/></button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                <div className="flex flex-col md:flex-row items-end justify-between gap-10 pt-8 border-t-2 border-slate-100 dark:border-slate-800">
                   <button onClick={handleAddProgramRequest} className="flex items-center gap-3 text-blue-600 font-black uppercase text-[10px] tracking-widest hover:text-blue-700 transition-colors">
                      <PlusCircle size={20} /> Add Sound Goal
                   </button>
                   
                   <div className="flex gap-6">
                      <div className="space-y-3">
                         <label className="text-[9px] font-black uppercase text-slate-900 dark:text-white block ml-1">Session Target</label>
                         <input value={goalPerHour} onChange={e => setGoalPerHour(e.target.value)} type="number" placeholder="0" className="w-32 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl p-4 font-black font-mono text-center outline-none focus:border-googleBlue text-slate-900 dark:text-white" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[9px] font-black uppercase text-slate-900 dark:text-white block ml-1">Actual Score</label>
                         <input value={actualHour} onChange={e => setActualHour(e.target.value)} type="number" placeholder="0" className="w-32 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-xl p-4 font-black font-mono text-center outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* Floating Action Bar */}
           <div className="fixed bottom-0 left-0 md:left-64 right-0 p-6 bg-slate-900 text-white flex items-center justify-between z-[400] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom duration-500 border-t-2 border-white/10">
              <div className="flex items-center gap-12">
                 <div className="hidden sm:block">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Session Independence</p>
                    <div className="flex items-center gap-4">
                       <p className="text-4xl font-black font-mono leading-none tracking-tighter text-emerald-400">
                          {Math.round((steps.flatMap(s => s.trials).filter(t => t === '+').length / (steps.flatMap(s => s.trials).length || 1)) * 100)}%
                       </p>
                       <div className="px-3 py-1 bg-white/10 rounded-lg border border-white/20 text-[9px] font-black uppercase">Calculated Live</div>
                    </div>
                 </div>
                 <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                 <div className="hidden lg:block text-slate-300 font-black italic text-[11px] max-w-[250px] uppercase">
                    "Remember to save before leaving. Notes are synced to parent dashboards immediately."
                 </div>
              </div>
              
              <div className="flex gap-4">
                 <button onClick={() => setSelectedStudentIdForLog(null)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Discard</button>
                 <button 
                  onClick={handleSave}
                  disabled={isSubmitting || !targetBehavior}
                  className="px-14 py-4 bg-emerald-600 text-white font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-4 rounded-none border-b-4 border-emerald-800"
                 >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>Complete Session <CheckCircle2 size={18}/></>}
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeView === 'history' && (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500">
           <header className="p-8 border-b-2 border-slate-900 bg-slate-100 dark:bg-slate-950/50 flex items-center justify-between">
              <div>
                 <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-[0.2em]">Record History</h3>
                 <p className="text-[10px] text-slate-900 dark:text-white mt-1 uppercase font-black">Past sessions for {selectedStudent?.firstName}</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[8px] font-mono text-slate-900 dark:text-white font-black uppercase tracking-widest">Live Audit Active</span>
              </div>
           </header>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    <tr>
                       <th className="px-8 py-5">Date Recorded</th>
                       <th className="px-8 py-5">Activity Node</th>
                       <th className="px-8 py-5">Style</th>
                       <th className="px-8 py-5 text-center">Result</th>
                       <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {(clinicalLogs || []).filter(l => l.studentId === selectedStudentIdForLog).length === 0 ? (
                      <tr><td colSpan={5} className="py-32 text-center text-xs font-black text-slate-300 uppercase italic tracking-[0.4em]">Archive is empty</td></tr>
                    ) : clinicalLogs.filter(l => l.studentId === selectedStudentIdForLog).map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="p-2 bg-slate-900 text-white rounded-lg"><Calendar size={14} /></div>
                               <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{new Date(log.date).toLocaleDateString()}</p>
                            </div>
                         </td>
                         <td className="px-8 py-6 font-black uppercase text-xs tracking-tight text-slate-900 dark:text-white">{log.targetBehavior}</td>
                         <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-white dark:bg-slate-800 border-2 border-slate-900 rounded-lg text-[9px] font-black uppercase text-slate-900 dark:text-white">{log.method}</span>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <div className="inline-flex items-center gap-3 px-5 py-2 bg-emerald-600 text-white rounded-full border-2 border-slate-900 shadow-sm">
                               <Activity size={14} />
                               <span className="font-black font-mono text-xl leading-none">+{log.independenceScore}%</span>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <ChevronRight size={18} className="ml-auto text-slate-900 dark:text-white group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};
