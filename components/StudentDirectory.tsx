
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  Search, ChevronRight, X, LayoutGrid, List, 
  Trash2, Edit2, ArrowLeft, Loader2, Save, History
} from 'lucide-react';
import { Student } from '../types';
import { PersonalInfo } from './student-profile/PersonalInfo';
import { HealthRecord } from './student-profile/HealthRecord';
import { PerformanceMatrix } from './student-profile/PerformanceMatrix';
import { PaymentLedger } from './student-profile/PaymentLedger';

const STUDENT_COLORS = [
  { bg: 'bg-blue-600', row: 'bg-blue-50', text: 'text-white', border: 'border-blue-900', accent: 'border-blue-600', dark: 'dark:bg-blue-900/40' },
  { bg: 'bg-emerald-600', row: 'bg-emerald-50', text: 'text-white', border: 'border-emerald-900', accent: 'border-emerald-600', dark: 'dark:bg-emerald-900/40' },
  { bg: 'bg-rose-600', row: 'bg-rose-50', text: 'text-white', border: 'border-rose-900', accent: 'border-rose-600', dark: 'dark:bg-rose-900/40' },
  { bg: 'bg-amber-600', row: 'bg-amber-50', text: 'text-white', border: 'border-amber-900', accent: 'border-amber-600', dark: 'dark:bg-amber-900/40' },
  { bg: 'bg-purple-600', row: 'bg-purple-50', text: 'text-white', border: 'border-purple-900', accent: 'border-purple-600', dark: 'dark:bg-purple-900/40' },
  { bg: 'bg-cyan-600', row: 'bg-cyan-50', text: 'text-white', border: 'border-cyan-900', accent: 'border-cyan-600', dark: 'dark:bg-cyan-900/40' },
];

const getStudentColor = (id: string) => {
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % STUDENT_COLORS.length;
  return STUDENT_COLORS[index];
};

export const StudentDirectory: React.FC = () => {
  const { students, staff, updateStudent, deleteStudent, settings, user, clinicalLogs, milestoneRecords, parents } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'personal' | 'health' | 'records' | 'payments'>('personal');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [detailRecordDay, setDetailRecordDay] = useState<string | null>(null); 
  const [activeDetailTab, setActiveDetailTab] = useState<'Lesson Notes' | 'Growth Checks'>('Lesson Notes');
  const [timeFilter, setTimeFilter] = useState<'Weekly' | 'Bi-weekly' | 'Monthly' | 'Yearly'>('Weekly');
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isParent = user?.role === 'PARENT';
  const isSpecialist = user?.role === 'SPECIALIST';
  const borderClass = "border-slate-300 dark:border-slate-800";

  const myStudents = useMemo(() => {
    if (isParent) {
      const parentProfile = parents.find(p => p.firebaseUid === user?.id);
      return parentProfile ? students.filter(s => s.id === parentProfile.studentId) : [];
    }
    return students;
  }, [students, user, isParent, parents]);

  const filteredStudents = (myStudents || []).filter(s => {
    if (isSpecialist && s.assignedStaffId !== user?.id) return false;
    return s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const studentPerformance = useMemo(() => {
    if (!selectedStudent) return { analysis: [], milestones: [] };
    return {
      analysis: clinicalLogs.filter(l => l.studentId === selectedStudent.id),
      milestones: milestoneRecords.filter(m => m.studentId === selectedStudent.id)
    };
  }, [selectedStudent, clinicalLogs, milestoneRecords]);

  const handleSaveEdit = async () => {
    if (!selectedStudent || !selectedStudent.firebaseUid) return;
    try {
      await updateStudent(selectedStudent.firebaseUid, editForm);
      setSelectedStudent({ ...selectedStudent, ...editForm } as Student);
      setIsEditing(false);
    } catch(e) {}
  };

  const handleDelete = async () => {
    if (!selectedStudent || !selectedStudent.firebaseUid) return;
    if (confirm(`Are you sure you want to PERMANENTLY remove ${selectedStudent.fullName}? this cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await deleteStudent(selectedStudent.firebaseUid);
        setSelectedStudent(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase text-slate-950 dark:text-white leading-none tracking-tight">Registry Node</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase mt-3 tracking-widest italic">Viewing active student directory</p>
        </div>
      </header>

      {!isParent && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search registry..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 rounded-none text-sm font-bold border border-slate-900 outline-none focus:border-blue-600 transition-all shadow-sm" />
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-none flex gap-1 border border-slate-900 h-fit">
            <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-none transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><List size={22} /></button>
            <button onClick={() => setViewMode('cards')} className={`p-2.5 rounded-none transition-all ${viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><LayoutGrid size={22} /></button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-900 rounded-none overflow-hidden shadow-sm">
        {viewMode === 'table' && !isParent ? (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left table-auto">
              <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest border-b border-slate-900">
                <tr><th className="px-10 py-6">Identity</th><th className="px-4 py-6 text-center">Reference</th><th className="px-4 py-6 hidden md:table-cell">Class</th><th className="px-10 py-6 text-right">Node</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredStudents.map(student => {
                  const color = getStudentColor(student.id);
                  return (
                    <tr key={student.id} className={`${color.row} ${color.dark} hover:brightness-95 cursor-pointer transition-all border-l-[12px] ${color.accent}`} onClick={() => { setSelectedStudent(student); setEditForm(student); setIsEditing(false); }}>
                      <td className="px-10 py-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-slate-900 overflow-hidden flex items-center justify-center font-black text-xs uppercase text-slate-900 rounded-none">
                          {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover" /> : student.fullName[0]}
                        </div>
                        <span className="font-black text-sm uppercase text-slate-900 dark:text-white truncate">{student.fullName}</span>
                      </td>
                      <td className="px-4 py-6 text-center font-mono text-[10px] text-slate-900 dark:text-slate-100 font-black uppercase">{student.id}</td>
                      <td className="px-4 py-6 text-[10px] font-black uppercase text-slate-900 dark:text-slate-100 hidden md:table-cell">{student.assignedClass}</td>
                      <td className="px-10 py-6 text-right"><ChevronRight size={18} className="inline text-slate-900 dark:text-white" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredStudents.map(student => {
              const color = getStudentColor(student.id);
              return (
                <div key={student.id} className={`${color.bg} border-2 border-slate-900 hover:scale-105 rounded-none p-8 transition-all cursor-pointer group shadow-xl active:translate-y-1 relative overflow-hidden`} onClick={() => { setSelectedStudent(student); setEditForm(student); setIsEditing(false); }}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -translate-y-12 translate-x-12 rotate-45 group-hover:bg-white/20 transition-all"></div>
                  <div className="w-20 h-20 bg-white border border-slate-900 mb-6 flex items-center justify-center font-black text-4xl text-slate-900 uppercase rounded-none shadow-lg overflow-hidden group-hover:rotate-3 transition-transform">
                    {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover" /> : student.fullName[0]}
                  </div>
                  <h3 className="font-black text-xl uppercase text-white leading-none mb-2 tracking-tighter">{student.fullName}</h3>
                  <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">{student.assignedClass}</p>
                  <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-white/50 font-bold uppercase">REF: {student.id}</span>
                    <ChevronRight size={20} className="text-white group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-[1000] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
          <header className="p-8 border-b border-slate-900 flex items-center justify-between bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-20">
            <div className="flex items-center gap-6">
              <button onClick={() => setSelectedStudent(null)} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-900 text-slate-400 hover:text-black dark:hover:text-white transition-all active:scale-95">
                <ArrowLeft size={28} />
              </button>
              <div className="w-16 h-16 bg-white flex items-center justify-center font-black text-2xl text-slate-900 border border-slate-900 shadow-xl overflow-hidden">
                {selectedStudent.imageUrl ? <img src={selectedStudent.imageUrl} className="w-full h-full object-cover" /> : selectedStudent.fullName[0]}
              </div>
              <div className="hidden sm:block">
                <h2 className="text-2xl font-black uppercase text-slate-950 dark:text-white leading-none tracking-tight">Student Node</h2>
                <p className="text-[10px] font-mono font-bold text-blue-600 mt-2 uppercase tracking-[0.2em]">ID: {selectedStudent.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isParent && isAdmin && (
                <>
                  <button onClick={handleDelete} disabled={isDeleting} className="px-6 py-4 bg-rose-600 text-white rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 border border-slate-900 shadow-lg">
                    {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <><Trash2 size={18}/> Remove Node</>}
                  </button>
                  <button onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)} className={`px-8 py-4 rounded-none border border-slate-900 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg ${isEditing ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-black'}`}>
                    {isEditing ? <><Save size={18} className="inline mr-2"/> Commit Changes</> : <><Edit2 size={18} className="inline mr-2"/> Edit Profile</>}
                  </button>
                </>
              )}
              <button onClick={() => setSelectedStudent(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"><X size={24}/></button>
            </div>
          </header>

          <div className="flex bg-slate-50 dark:bg-slate-900 border-b border-slate-900 p-1 gap-1 px-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'personal', label: 'Identity' },
              { id: 'health', label: 'Health' },
              { id: 'records', label: 'Progress' },
              { id: 'payments', label: 'Billing' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveProfileTab(tab.id as any)} className={`px-10 py-4 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 whitespace-nowrap ${activeProfileTab === tab.id ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-blue-600 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-800'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-12 max-w-6xl mx-auto w-full custom-scrollbar">
            {activeProfileTab === 'personal' && <PersonalInfo student={selectedStudent} isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} staff={staff} settings={settings} isAdmin={isAdmin} />}
            {activeProfileTab === 'health' && <HealthRecord student={selectedStudent} isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} onViewPdf={() => {}} onUploadPdf={() => {}} />}
            {activeProfileTab === 'records' && <PerformanceMatrix student={selectedStudent} logs={studentPerformance.analysis} milestones={studentPerformance.milestones} filter={timeFilter} setFilter={setTimeFilter} onOpenDay={setDetailRecordDay} />}
            {activeProfileTab === 'payments' && <PaymentLedger totalPaid={selectedStudent.totalPaid || 0} balance={Math.max(0, settings.feesAmount - (selectedStudent.totalPaid || 0))} payments={[]} borderClass="border-slate-900" />}
          </div>

          {detailRecordDay && (
            <div className="fixed inset-0 z-[1100] flex justify-end">
               <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setDetailRecordDay(null)} />
               <aside className="relative w-full md:w-[60%] lg:w-[45%] bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 rounded-none border-l-2 border-slate-900">
                  <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 z-20">
                     <div>
                        <h3 className="text-xl font-black uppercase tracking-tight dark:text-white leading-none">Record Log</h3>
                        <p className="text-[10px] font-black text-blue-600 uppercase mt-2 tracking-widest">{new Date(detailRecordDay).toDateString()}</p>
                     </div>
                     <button onClick={() => setDetailRecordDay(null)} className="p-3 text-slate-400 hover:text-rose-600 transition-colors"><X size={28}/></button>
                  </header>

                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 border-b border-slate-900 px-8">
                     {['Lesson Notes', 'Growth Checks'].map(t => (
                       <button key={t} onClick={() => setActiveDetailTab(t as any)} className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest transition-all ${activeDetailTab === t ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                         {t}
                       </button>
                     ))}
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 sidebar-scrollbar">
                     {activeDetailTab === 'Lesson Notes' && (
                       <div className="space-y-6">
                          {studentPerformance.analysis.filter(l => l.date.split('T')[0] === detailRecordDay).map(log => (
                            <div key={log.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-900 p-8 rounded-none shadow-sm space-y-6">
                               <div className="flex items-center justify-between">
                                  <h4 className="text-base font-black uppercase dark:text-white">{log.targetBehavior}</h4>
                                  <div className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black font-mono">+{log.independenceScore}%</div>
                               </div>
                               <div className="space-y-1">
                                  {log.steps.map((step, idx) => (
                                    <div key={step.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                       <span className="text-xs font-bold dark:text-white uppercase tracking-tight">{(idx + 1).toString().padStart(2,'0')}. {step.description}</span>
                                       <div className="flex gap-1">
                                          {(step.trials || []).map((t, tidx) => t !== '-' && (
                                            <span key={tidx} className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-900 text-[8px] font-black uppercase">{t}</span>
                                          ))}
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          ))}
                       </div>
                     )}
                  </div>
               </aside>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
