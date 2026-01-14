
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  ChevronRight, 
  X, 
  Search, 
  ArrowLeft, 
  Plus, 
  History as HistoryIcon,
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
import { getHarareISOString } from '../utils/dateUtils';

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

  useEffect(() => {
    if (selectedStudentIdForLog && !isRestrictedRole) {
      setActiveTab('new');
    }
  }, [selectedStudentIdForLog]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (isSpecialist && s.assignedStaffId !== user?.id) return false;
      return s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [students, isSpecialist, user, searchTerm]);

  const selectedStudent = students.find(s => s.id === selectedStudentIdForLog);
  const activeTemplate = milestoneTemplates.find(t => t.id === activeTemplateId);
  const studentAgeMonths = selectedStudent ? calculateAgeMonths(selectedStudent.dob) : 0;

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
        overallPercentage: Math.round((checkedCount / (totalItems || 1)) * 100),
        timestamp: getHarareISOString() // Standardized Harare Time
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
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-none text-blue-600">
              <ClipboardList size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Progress Check</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase leading-none">Growth Checklist</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium italic">Check how your students are growing.</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full py-20 text-center font-bold text-slate-300 uppercase italic text-xs tracking-widest bg-slate-50 dark:bg-slate-900 rounded-none border border-dashed border-slate-200 dark:border-slate-800">
              No students found.
            </div>
          ) : filteredStudents.map(student => (
            <button 
              key={student.id} 
              onClick={() => setSelectedStudentIdForLog(student.id)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-none text-left hover:border-blue-500 hover:shadow-xl transition-all group active:scale-95"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-none bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-lg uppercase text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                  {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover" /> : student.fullName[0]}
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
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-slate-400 hover:text-black transition-all shadow-sm active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-12 h-12 rounded-none bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 shadow-sm">
             {selectedStudent.imageUrl ? <img src={selectedStudent.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-blue-600">{selectedStudent.fullName[0]}</div>}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight">{selectedStudent.fullName}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <Clock size={12} className="text-blue-500" />
              {calculateAgeMonths(selectedStudent.dob)} Months Old • {selectedStudent.assignedClass}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-none border border-slate-200 dark:border-slate-800 shadow-inner">
           {!isRestrictedRole && (
             <button 
              onClick={() => { setActiveTab('new'); setActiveTemplateId(null); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
             >
               <Plus size={14} /> New Check
             </button>
           )}
           <button 
            onClick={() => { setActiveTab('history'); setActiveTemplateId(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
           >
             <HistoryIcon size={14} /> Past Checks
           </button>
        </div>
      </header>

      {activeTab === 'history' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black uppercase text-[10px] tracking-widest">
                   <tr>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5">Age Group</th>
                      <th className="px-8 py-5">Teacher</th>
                      <th className="px-8 py-5 text-center">Score</th>
                      <th className="px-8 py-5 text-right">Open</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                   {history.length === 0 ? (
                     <tr><td colSpan={5} className="px-8 py-20 text-center text-xs font-bold text-slate-400 uppercase italic tracking-widest">No history yet.</td></tr>
                   ) : history.map(record => (
                     <tr 
                      key={record.id} 
                      className="hover:bg-slate-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group"
                      onClick={() => setViewingRecord(record)}
                     >
                        <td className="px-8 py-6 font-mono font-bold text-xs dark:text-white">
                          {new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Harare' }).format(new Date(record.timestamp))}
                        </td>
                        <td className="px-8 py-6 uppercase font-black text-[11px] text-slate-600 dark:text-slate-300">{record.ageCategory}</td>
                        <td className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase">{staff.find(s => s.id === record.staffId)?.fullName || 'Teacher'}</td>
                        <td className="px-8 py-6 text-center">
                           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-none border border-blue-100 dark:border-blue-800">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right duration-500 pb-20">
           <div className="lg:col-span-8 space-y-8">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-xl overflow-hidden relative">
                 <div className="p-8 md:p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-blue-600 text-white rounded-none flex items-center justify-center shadow-lg shadow-blue-500/20">
                          <ClipboardList size={24} />
                       </div>
                       <div>
                          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2 block">Checklist</h3>
                          <h4 className="text-2xl font-black uppercase tracking-tight dark:text-white leading-none">{activeTemplate?.label}</h4>
                       </div>
                    </div>
                    <div className="flex items-center gap-6 bg-white dark:bg-slate-950 px-6 py-3 rounded-none border border-[#183D4A] dark:border-[#9DB6BF] shadow-inner">
                       <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Growth Score</p>
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
                                     <th className="px-4 py-3">Description</th>
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
                                          <td className={`px-4 py-5 text-sm font-bold leading-relaxed ${isChecked ? 'text-emerald-700 dark:text-emerald-400' : 'text-black dark:text-white'}`}>
                                             {item}
                                          </td>
                                          <td className="px-10 py-5 text-right">
                                             <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-none text-[9px] font-black uppercase border-2 transition-all ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-[#183D4A] dark:border-[#9DB6BF] text-black dark:text-white'}`}>
                                                {isChecked ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-none border border-slate-300" />}
                                                {isChecked ? 'Passed' : 'Pending'}
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
                               <AlertTriangle size={24} /> Warning Signs
                            </h5>
                            <span className="text-[9px] font-black uppercase bg-rose-600 text-white px-4 py-1 rounded-none shadow-lg">Watch closely</span>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeTemplate?.redFlags.map((flag, idx) => {
                               const id = `flag-${idx}`;
                               const isChecked = checkedFlags.has(id);
                               return (
                                 <button 
                                  key={id}
                                  onClick={() => toggleFlag(id)}
                                  className={`flex items-start gap-4 p-5 rounded-none border-2 transition-all text-left ${isChecked ? 'bg-white dark:bg-slate-800 border-rose-500 shadow-xl scale-105 z-10' : 'bg-white/40 dark:bg-slate-900 border-dashed border-[#183D4A] dark:border-[#9DB6BF] opacity-60 hover:opacity-100'}`}
                                 >
                                    <div className={`mt-1 w-6 h-6 rounded-none border-2 flex items-center justify-center flex-shrink-0 transition-all ${isChecked ? 'bg-rose-600 border-rose-600 text-white shadow-inner' : 'bg-white dark:bg-slate-800 border-rose-200'}`}>
                                       {isChecked && <X size={14} strokeWidth={4} />}
                                    </div>
                                    <span className={`text-[13px] font-bold leading-relaxed ${isChecked ? 'text-rose-700 dark:text-rose-400' : 'text-black dark:text-white'}`}>{flag}</span>
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
              <div className="bg-slate-900 rounded-none p-8 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                 <Brain className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform duration-1000" size={160} />
                 <div className="relative z-10 space-y-8">
                    <div>
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Report Tools</h3>
                       <p className="text-sm text-slate-400 font-medium italic leading-relaxed">Saving this will update the reports for parents.</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-[#9DB6BF] rounded-none space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-500">Tasks Done</span>
                          <span className="text-sm font-black text-blue-400">{checkedItems.size} Done</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-500">Warnings</span>
                          <span className="text-sm font-black text-rose-400">{checkedFlags.size} Signs</span>
                       </div>
                    </div>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full py-5 bg-blue-600 text-white rounded-none text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                    >
                       {isSaving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Progress</>}
                    </button>
                    <button 
                      onClick={() => setActiveTemplateId(null)}
                      className="w-full py-4 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex items-center gap-3 px-2">
              <Layers size={18} className="text-blue-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Select Age Group</h3>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedTemplates.map(template => {
                const isRecommended = studentAgeMonths >= template.minAge && studentAgeMonths <= template.maxAge;
                const isOverAge = studentAgeMonths > template.maxAge;
                
                return (
                  <button 
                    key={template.id}
                    onClick={() => { setActiveTemplateId(template.id); setCheckedItems(new Set()); setCheckedFlags(new Set()); }}
                    className={`bg-white dark:bg-slate-900 border-2 rounded-none text-left transition-all group relative overflow-hidden flex flex-col h-full
                      ${isOverAge ? 'opacity-40 grayscale-[0.8] border-slate-100 dark:border-slate-800' : 'border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:shadow-2xl'}
                      ${isRecommended ? 'border-emerald-500/30' : ''}
                    `}
                  >
                    {isRecommended && (
                      <div className="absolute top-0 right-0 px-5 py-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-none shadow-xl animate-pulse flex items-center gap-1.5">
                        <Zap size={10} fill="currentColor" /> Best Fit
                      </div>
                    )}
                    
                    <div className="p-8 flex-1">
                      <div className={`w-16 h-16 rounded-none flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform ${isRecommended ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'}`}>
                         <Layers size={32} />
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tight dark:text-white group-hover:text-blue-600 transition-colors leading-none mb-3">{template.label}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {template.sections.length} Parts • {template.sections.reduce((a,b)=>a+b.items.length, 0)} Steps
                      </p>
                    </div>

                    <div className="p-8 pt-0">
                      <div className={`pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between ${isOverAge ? 'opacity-40' : ''}`}>
                         <span className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1 group-hover:gap-3 transition-all">Start Check <ChevronRight size={14} /></span>
                      </div>
                    </div>
                  </button>
                );
              })}
           </div>
        </div>
      )}
    </div>
  );
};
