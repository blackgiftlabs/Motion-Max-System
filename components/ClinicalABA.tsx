
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  ChevronRight, 
  X, 
  Search, 
  ArrowLeft, 
  Plus, 
  History,
  CheckCircle2,
  XCircle,
  Activity,
  AlertTriangle,
  AlertCircle,
  Brain,
  Layers,
  Save,
  Loader2,
  Play,
  ClipboardList,
  Target,
  Clock,
  Zap,
  Info
} from 'lucide-react';
import { MilestoneRecord } from '../types';

const calculateAgeMonths = (dob: string) => {
  if (!dob) return 0;
  const d = new Date(dob);
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
};

export const ClinicalABA: React.FC = () => {
  const { students, staff, user, selectedStudentIdForLog, setSelectedStudentIdForLog, saveMilestoneRecord, milestoneRecords, milestoneTemplates } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('history'); 
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [checkedFlags, setCheckedFlags] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const [viewingRecord, setViewingRecord] = useState<MilestoneRecord | null>(null);

  const isSpecialist = user?.role === 'SPECIALIST';
  const isRestrictedRole = user?.role === 'PARENT' || user?.role === 'STUDENT';

  useEffect(() => {
    if (isRestrictedRole) {
      setActiveTab('history');
    }
  }, [isRestrictedRole]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (isSpecialist && s.assignedStaffId !== user?.id) return false;
      return s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [students, isSpecialist, user, searchTerm]);

  const selectedStudent = students.find(s => s.id === selectedStudentIdForLog);
  const activeTemplate = milestoneTemplates.find(t => t.id === activeTemplateId);
  const studentAgeMonths = selectedStudent ? calculateAgeMonths(selectedStudent.dob) : 0;

  // 1. Order of cards: months from less going up
  const sortedTemplates = useMemo(() => {
    return [...milestoneTemplates].sort((a, b) => a.minAge - b.minAge);
  }, [milestoneTemplates]);

  const history = useMemo(() => {
    return (milestoneRecords || [])
      .filter(r => r.studentId === selectedStudentIdForLog)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [milestoneRecords, selectedStudentIdForLog]);

  const handleSave = async () => {
    if (isRestrictedRole || !selectedStudent || !activeTemplate) return;
    setIsSaving(true);
    try {
      const sections = activeTemplate.sections.map((s, sIdx) => ({
        title: s.title,
        items: s.items.map((text, iIdx) => ({
          id: `${sIdx}-${iIdx}`,
          text,
          checked: checkedItems.has(`${sIdx}-${iIdx}`)
        }))
      }));

      const redFlags = activeTemplate.redFlags.map((text, idx) => ({
        id: `flag-${idx}`,
        text,
        checked: checkedFlags.has(`flag-${idx}`)
      }));

      const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
      const checkedCount = checkedItems.size;

      await saveMilestoneRecord({
        studentId: selectedStudent.id,
        ageCategory: activeTemplate.label,
        sections,
        redFlags,
        overallPercentage: Math.round((checkedCount / (totalItems || 1)) * 100)
      });
      
      setActiveTemplateId(null);
      setCheckedItems(new Set());
      setCheckedFlags(new Set());
      setActiveTab('history');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleItem = (id: string) => {
    const next = new Set(checkedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedItems(next);
  };

  const toggleFlag = (id: string) => {
    const next = new Set(checkedFlags);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedFlags(next);
  };

  const calculateProgress = () => {
    if (!activeTemplate) return 0;
    const totalItems = activeTemplate.sections.reduce((acc, s) => acc + s.items.length, 0);
    return Math.round((checkedItems.size / (totalItems || 1)) * 100);
  };

  if (!selectedStudent) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
              <ClipboardList size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Track Progress</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase leading-none">Student Growth</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium italic">Monitor the learning steps and age-based goals for each student.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sticky top-0 z-30 shadow-sm">
          <div className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 outline-none" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full py-20 text-center font-bold text-slate-300 uppercase italic text-xs tracking-widest bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
              No students matched your search.
            </div>
          ) : filteredStudents.map(student => (
            <button 
              key={student.id} 
              onClick={() => setSelectedStudentIdForLog(student.id)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] text-left hover:border-blue-500 hover:shadow-xl transition-all group active:scale-95"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-black text-lg uppercase shadow-sm group-hover:scale-110 transition-transform">
                  {student.fullName[0]}
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400">{student.id}</span>
              </div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight truncate group-hover:text-blue-600">{student.fullName}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{student.assignedClass}</p>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">Open Profile <ChevronRight size={14} /></span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setSelectedStudentIdForLog(null); setActiveTemplateId(null); setActiveTab('history'); }}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-black transition-all shadow-sm active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight">{selectedStudent.fullName}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <Clock size={12} className="text-blue-500" />
              {calculateAgeMonths(selectedStudent.dob)} Months Old • {selectedStudent.assignedClass}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
           {!isRestrictedRole && (
             <button 
              onClick={() => { setActiveTab('new'); setActiveTemplateId(null); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
             >
               <Plus size={14} /> New Check
             </button>
           )}
           <button 
            onClick={() => { setActiveTab('history'); setActiveTemplateId(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
           >
             <History size={14} /> History
           </button>
        </div>
      </header>

      {activeTab === 'history' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black uppercase text-[10px] tracking-widest">
                   <tr>
                      <th className="px-8 py-5">Date Recorded</th>
                      <th className="px-8 py-5">Age Group</th>
                      <th className="px-8 py-5">Teacher</th>
                      <th className="px-8 py-5 text-center">Score</th>
                      <th className="px-8 py-5 text-right">Details</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {history.length === 0 ? (
                     <tr><td colSpan={5} className="px-8 py-20 text-center text-xs font-bold text-slate-400 uppercase italic tracking-widest">No history recorded yet.</td></tr>
                   ) : history.map(record => (
                     <tr 
                      key={record.id} 
                      className="hover:bg-slate-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group"
                      onClick={() => setViewingRecord(record)}
                     >
                        <td className="px-8 py-6 font-mono font-bold text-xs dark:text-white">{new Date(record.timestamp).toLocaleDateString()}</td>
                        <td className="px-8 py-6 uppercase font-black text-[11px] text-slate-600 dark:text-slate-300">{record.ageCategory}</td>
                        <td className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase">{staff.find(s => s.id === record.staffId)?.fullName || 'Teacher'}</td>
                        <td className="px-8 py-6 text-center">
                           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full border border-blue-100 dark:border-blue-800">
                              <Target size={14} />
                              <span className="font-black font-mono text-lg">{record.overallPercentage}%</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right"><ChevronRight size={18} className="ml-auto text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" /></td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>
      ) : activeTemplateId ? (
        // FORMAL TABLE DESIGN FOR RECORDING
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right duration-500 pb-20">
           <div className="lg:col-span-8 space-y-8">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-xl overflow-hidden relative">
                 <div className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/20">
                          <ClipboardList size={24} />
                       </div>
                       <div>
                          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2 block">Learning Checklist</h3>
                          <h4 className="text-2xl font-black uppercase tracking-tight dark:text-white leading-none">{activeTemplate?.label}</h4>
                       </div>
                    </div>
                    <div className="flex items-center gap-6 bg-white dark:bg-slate-950 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                       <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Mastery</p>
                          <p className="text-3xl font-black font-mono text-blue-600">{calculateProgress()}%</p>
                       </div>
                       <Activity size={24} className="text-blue-500" />
                    </div>
                 </div>

                 <div className="p-0 space-y-0">
                    {activeTemplate?.sections.map((section, sIdx) => (
                      <div key={section.title} className="group">
                         <div className="bg-slate-100 dark:bg-slate-800/80 px-10 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                            <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">{section.title}</h5>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{section.items.length} Goals</span>
                         </div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                               <thead>
                                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                     <th className="px-10 py-3 w-16">No.</th>
                                     <th className="px-4 py-3">Milestone Goal Description</th>
                                     <th className="px-10 py-3 text-right">Status</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {section.items.map((item, iIdx) => {
                                     const id = `${sIdx}-${iIdx}`;
                                     const isChecked = checkedItems.has(id);
                                     return (
                                       <tr 
                                        key={id} 
                                        onClick={() => toggleItem(id)}
                                        className={`group/row cursor-pointer transition-colors ${isChecked ? 'bg-emerald-50/30 dark:bg-emerald-900/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                                       >
                                          <td className="px-10 py-5 font-mono text-[10px] font-bold text-slate-400">{(iIdx + 1).toString().padStart(2, '0')}</td>
                                          <td className={`px-4 py-5 text-sm font-bold leading-relaxed ${isChecked ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                             {item}
                                          </td>
                                          <td className="px-10 py-5 text-right">
                                             <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                                {isChecked ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                                                {isChecked ? 'Achieved' : 'Mark Done'}
                                             </div>
                                          </td>
                                       </tr>
                                     );
                                  })}
                               </tbody>
                            </table>
                         </div>
                      </div>
                    ))}

                    {activeTemplate?.redFlags && activeTemplate.redFlags.length > 0 && (
                      <div className="bg-rose-50 dark:bg-rose-900/10 p-10 space-y-8">
                         <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-800 pb-6">
                            <h5 className="text-xl font-black uppercase tracking-tight text-rose-600 flex items-center gap-3">
                               <AlertTriangle size={24} /> Important Observations
                            </h5>
                            <span className="text-[9px] font-black uppercase bg-rose-600 text-white px-4 py-1 rounded-full shadow-lg">Safety Check</span>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeTemplate?.redFlags.map((flag, idx) => {
                               const id = `flag-${idx}`;
                               const isChecked = checkedFlags.has(id);
                               return (
                                 <button 
                                  key={id}
                                  onClick={() => toggleFlag(id)}
                                  className={`flex items-start gap-4 p-5 rounded-[2rem] border-2 transition-all text-left ${isChecked ? 'bg-white border-rose-500 shadow-xl scale-105 z-10' : 'bg-white/40 dark:bg-slate-900 border-dashed border-rose-200 dark:border-rose-800 opacity-60 hover:opacity-100'}`}
                                 >
                                    <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${isChecked ? 'bg-rose-600 border-rose-600 text-white shadow-inner' : 'bg-white dark:bg-slate-800 border-rose-200'}`}>
                                       {isChecked && <X size={14} strokeWidth={4} />}
                                    </div>
                                    <span className={`text-[13px] font-bold leading-relaxed ${isChecked ? 'text-rose-700 dark:text-rose-400' : 'text-rose-400'}`}>{flag}</span>
                                 </button>
                               );
                            })}
                         </div>
                      </div>
                    )}
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                 <Brain className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform duration-1000" size={160} />
                 <div className="relative z-10 space-y-8">
                    <div>
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Registry Control</h3>
                       <p className="text-sm text-slate-400 font-medium italic leading-relaxed">"Saving this report will update the student's progress and notify their parents."</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-500">Goals Checked</span>
                          <span className="text-sm font-black text-blue-400">{checkedItems.size} Tasks</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-500">Concerns Logged</span>
                          <span className="text-sm font-black text-rose-400">{checkedFlags.size} Flags</span>
                       </div>
                    </div>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                    >
                       {isSaving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Progress Update</>}
                    </button>
                    <button 
                      onClick={() => setActiveTemplateId(null)}
                      className="w-full py-4 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                      Cancel Entry
                    </button>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex items-center gap-3 px-2">
              <Layers size={18} className="text-blue-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Choose Growth Area</h3>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedTemplates.map(template => {
                // 2. Logic: Recommended if in range, Over-age if student is older
                const isRecommended = studentAgeMonths >= template.minAge && studentAgeMonths <= template.maxAge;
                const isOverAge = studentAgeMonths > template.maxAge;
                
                return (
                  <button 
                    key={template.id}
                    onClick={() => { setActiveTemplateId(template.id); setCheckedItems(new Set()); setCheckedFlags(new Set()); }}
                    className={`bg-white dark:bg-slate-900 border-2 rounded-[2.5rem] text-left transition-all group relative overflow-hidden flex flex-col h-full
                      ${isOverAge ? 'opacity-40 grayscale-[0.8] border-slate-100 dark:border-slate-800' : 'border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:shadow-2xl'}
                      ${isRecommended ? 'border-emerald-500/30' : ''}
                    `}
                  >
                    {isRecommended && (
                      <div className="absolute top-0 right-0 px-5 py-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-3xl shadow-xl animate-pulse flex items-center gap-1.5">
                        <Zap size={10} fill="currentColor" /> Recommended
                      </div>
                    )}
                    {isOverAge && (
                      <div className="absolute top-0 right-0 px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-bl-3xl border-l border-b border-slate-200 dark:border-slate-700">
                        Over-age for this
                      </div>
                    )}
                    
                    <div className="p-8 flex-1">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform ${isRecommended ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'}`}>
                         <Layers size={32} />
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tight dark:text-white group-hover:text-blue-600 transition-colors leading-none mb-3">{template.label}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {template.sections.length} Skill Groups • {template.sections.reduce((a,b)=>a+b.items.length, 0)} Steps
                      </p>
                    </div>

                    <div className="p-8 pt-0">
                      <div className={`pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between ${isOverAge ? 'opacity-40' : ''}`}>
                         <span className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1 group-hover:gap-3 transition-all">Start Checklist <ChevronRight size={14} /></span>
                         <span className="text-[9px] font-bold text-slate-300 font-mono">NODE_{template.minAge}M</span>
                      </div>
                    </div>
                  </button>
                );
              })}
           </div>

           <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-3xl p-6 flex items-start gap-4">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg"><Info size={20} /></div>
              <div>
                 <p className="text-[11px] font-black uppercase text-blue-900 dark:text-blue-200 tracking-tight">System Tip</p>
                 <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mt-1 leading-relaxed italic">
                    "The recommended checklist is chosen based on the student's current age. Past milestones can be updated but are shown in gray to help you focus on current goals."
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* VIEWING MODAL (SLIDE-OVER) - Formal Design */}
      {viewingRecord && (
        <div className="fixed inset-0 z-[600] flex justify-end">
           <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setViewingRecord(null)} />
           <aside className="relative w-full md:w-[700px] lg:w-[850px] bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 border-l border-slate-200 dark:border-slate-800">
              <header className="p-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h2 className="text-2xl font-black uppercase text-slate-950 dark:text-white tracking-tight leading-none">Growth Report</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{viewingRecord.ageCategory} // {new Date(viewingRecord.timestamp).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => setViewingRecord(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors active:scale-90"><X size={28} /></button>
                 </div>
                 
                 <div className="flex items-center justify-between p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800 shadow-inner">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 dark:border-blue-700">
                        <Target size={24} />
                      </div>
                      <span className="text-xs font-black uppercase text-blue-600 tracking-widest">Final Milestone Score</span>
                    </div>
                    <p className="text-4xl font-black text-blue-600 font-mono">{viewingRecord.overallPercentage}%</p>
                 </div>
              </header>

              <div className="flex-1 overflow-y-auto p-0 sidebar-scrollbar">
                 <div className="space-y-0">
                    {viewingRecord.sections.map((section, sIdx) => (
                      <div key={sIdx}>
                         <div className="px-8 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{section.title}</h4>
                         </div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                               <thead className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400/60">
                                  <tr>
                                     <th className="px-8 py-3 w-16">Item</th>
                                     <th className="px-4 py-3">Goal Name</th>
                                     <th className="px-8 py-3 text-right">Status</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                                  {section.items.map((item, iIdx) => (
                                    <tr key={iIdx} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/5 transition-colors">
                                       <td className="px-8 py-5 font-mono text-[10px] font-bold text-slate-300">{(iIdx + 1).toString().padStart(2, '0')}</td>
                                       <td className={`px-4 py-5 text-sm font-bold ${item.checked ? 'text-slate-950 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 italic'}`}>{item.text}</td>
                                       <td className="px-8 py-5 text-right">
                                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border shadow-sm ${item.checked ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                                             {item.checked ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                             {item.checked ? 'Achieved' : 'Working'}
                                          </div>
                                       </td>
                                    </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                      </div>
                    ))}
                 </div>

                 {viewingRecord.redFlags.filter(f => f.checked).length > 0 && (
                   <div className="mt-12 p-8 pt-0 space-y-6">
                      <h4 className="text-[11px] font-black uppercase text-rose-500 ml-4 tracking-[0.2em] flex items-center gap-2">
                        <AlertTriangle size={16}/> Teacher Observations
                      </h4>
                      <div className="space-y-3">
                         {viewingRecord.redFlags.filter(f => f.checked).map((flag, idx) => (
                           <div key={idx} className="p-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-[1.5rem] flex items-center gap-4 text-rose-700 dark:text-rose-400 shadow-sm animate-in slide-in-from-bottom-2">
                              {/* Fix: Import AlertCircle from lucide-react */}
                              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm"><AlertCircle size={20} className="shrink-0" /></div>
                              <p className="text-sm font-bold leading-relaxed">{flag.text}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
              
              <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                 <button onClick={() => setViewingRecord(null)} className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all">Close Report</button>
              </footer>
           </aside>
        </div>
      )}
    </div>
  );
};
