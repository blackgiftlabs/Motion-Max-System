
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Search, ChevronRight, X, LayoutGrid, List, 
  Trash2, Edit2, ArrowLeft, Activity, HeartPulse, CreditCard, Plus, Filter, Check, UserCircle, AlertTriangle, Loader2
} from 'lucide-react';
import { Student } from '../types';
import { PersonalInfo } from './student-profile/PersonalInfo';
import { HealthRecord } from './student-profile/HealthRecord';
import { PerformanceMatrix } from './student-profile/PerformanceMatrix';
import { PaymentLedger } from './student-profile/PaymentLedger';
import { RegisterStudentModal } from './admin/RegisterStudentModal';

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
  const { students, staff, updateStudent, deleteStudent, settings, user, clinicalLogs, milestoneRecords, parents, notify } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'personal' | 'health' | 'records' | 'payments'>('personal');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('All Classes');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isParent = user?.role === 'PARENT';
  const isSpecialist = user?.role === 'SPECIALIST';
  
  const tabs = [
    { id: 'personal', label: 'Info', icon: <UserCircle size={18} /> },
    { id: 'health', label: 'Health', icon: <HeartPulse size={18} /> },
    { id: 'records', label: 'History', icon: <Activity size={18} /> },
    { id: 'payments', label: 'Fees', icon: <CreditCard size={18} /> }
  ];

  const myStudents = useMemo(() => {
    if (isParent) {
      const parentProfile = parents.find(p => p.firebaseUid === user?.id);
      return parentProfile ? students.filter(s => s.id === parentProfile.studentId) : [];
    }
    return students;
  }, [students, user, isParent, parents]);

  const filteredStudents = (myStudents || []).filter(s => {
    if (isSpecialist && s.assignedStaffId !== user?.id) return false;
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All Classes' || s.assignedClass === selectedClass;
    return matchesSearch && matchesClass;
  });

  const studentPerformance = useMemo(() => {
    if (!selectedStudent) return { analysis: [], milestones: [] };
    return {
      analysis: clinicalLogs.filter(l => l.studentId === selectedStudent.id),
      milestones: milestoneRecords.filter(m => m.studentId === selectedStudent.id)
    };
  }, [selectedStudent, clinicalLogs, milestoneRecords]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowClassDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setIsDeleting(true);
    try {
      await deleteStudent(selectedStudent.firebaseUid);
      notify('success', 'Student record permanently removed from registry.');
      setSelectedStudent(null);
      setShowDeleteModal(false);
    } catch (e) {
      notify('error', 'Failed to remove student record.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto px-2 md:px-0 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 border-b-2 border-slate-900 pb-6 md:pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-slate-950 dark:text-white leading-none tracking-tight">Students</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-widest italic">Official Enrollment Directory</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsAddingStudent(true)} className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-none text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md active:scale-95">
            <Plus size={18} /> Add Student
          </button>
        )}
      </header>

      {!isParent && (
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 md:py-4 bg-white dark:bg-slate-900 rounded-none text-sm font-bold border-2 border-slate-900 outline-none focus:border-blue-600 transition-all" />
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-none flex gap-1 border-2 border-slate-900 h-fit w-fit self-end">
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-none transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><List size={20} /></button>
            <button onClick={() => setViewMode('cards')} className={`p-2 rounded-none transition-all ${viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><LayoutGrid size={20} /></button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 rounded-none overflow-hidden shadow-sm">
        {viewMode === 'table' && !isParent ? (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left table-auto min-w-[600px]">
              <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-900">
                <tr><th className="px-6 py-5">Name</th><th className="px-4 py-5 text-center">ID</th><th className="px-4 py-5">Class</th><th className="px-6 py-5 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-900">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={4} className="px-10 py-20 text-center text-[10px] font-black uppercase text-slate-300 italic tracking-widest">No students found</td></tr>
                ) : filteredStudents.map(student => {
                  const color = getStudentColor(student.id);
                  return (
                    <tr key={student.id} className={`${color.row} ${color.dark} hover:brightness-95 cursor-pointer transition-all border-l-8 ${color.accent}`} onClick={() => { setSelectedStudent(student); setEditForm(student); setIsEditing(false); }}>
                      <td className="px-6 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border-2 border-slate-900 flex items-center justify-center font-black text-xs uppercase text-slate-900 rounded-none overflow-hidden">
                          {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover" alt="" /> : student.fullName[0]}
                        </div>
                        <span className="font-black text-sm uppercase text-slate-900 dark:text-white truncate">{student.fullName}</span>
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-[10px] text-slate-900 dark:text-slate-100 font-black uppercase">{student.id}</td>
                      <td className="px-4 py-4 text-[10px] font-black uppercase text-slate-900 dark:text-slate-100">{student.assignedClass}</td>
                      <td className="px-6 py-4 text-right"><ChevronRight size={18} className="inline text-slate-900 dark:text-white" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredStudents.map(student => {
              const color = getStudentColor(student.id);
              return (
                <div key={student.id} className={`${color.bg} border-2 border-slate-900 rounded-none p-8 transition-all cursor-pointer group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1`} onClick={() => { setSelectedStudent(student); setEditForm(student); setIsEditing(false); }}>
                  <div className="w-16 h-16 bg-white border-2 border-slate-900 mb-6 flex items-center justify-center font-black text-3xl text-slate-900 uppercase rounded-none overflow-hidden">
                    {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover" alt="" /> : student.fullName[0]}
                  </div>
                  <h3 className="font-black text-xl uppercase text-white leading-none mb-2 tracking-tighter truncate">{student.fullName}</h3>
                  <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">{student.assignedClass}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-[10000] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
          <header className="p-4 md:p-6 border-b-2 border-slate-900 flex items-center justify-between bg-white dark:bg-slate-900 z-50">
            <div className="flex items-center gap-4 min-w-0">
              <button onClick={() => setSelectedStudent(null)} className="p-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 text-slate-500 hover:text-black dark:hover:text-white transition-all active:scale-90 flex items-center gap-2">
                <ArrowLeft size={18} /><span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Back</span>
              </button>
              <div className="min-w-0">
                <h2 className="text-sm md:text-base font-black uppercase text-slate-950 dark:text-white leading-none truncate">{selectedStudent.fullName}</h2>
                <p className="text-[8px] font-mono font-bold text-blue-600 mt-1 uppercase tracking-widest">ID: {selectedStudent.id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isParent && isAdmin && (
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2.5 bg-rose-50 border-2 border-slate-900 text-rose-600 hover:bg-rose-600 hover:text-white transition-all rounded-none"
                    title="Delete Student"
                   >
                     <Trash2 size={16} />
                   </button>
                   <button onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)} className={`px-4 py-2.5 rounded-none border-2 border-slate-900 transition-all text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2 ${isEditing ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                     {isEditing ? <Check size={14}/> : <Edit2 size={14}/>}
                     <span>{isEditing ? 'Save' : 'Edit'}</span>
                   </button>
                </div>
              )}
              <button onClick={() => setSelectedStudent(null)} className="p-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors"><X size={24} /></button>
            </div>
          </header>

          <div className="flex bg-slate-100 dark:bg-slate-900 border-b-2 border-slate-900 p-0 overflow-x-hidden z-40 sticky top-0">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveProfileTab(tab.id as any)} className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all border-b-4 ${activeProfileTab === tab.id ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-blue-500 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                {tab.icon}
                <span className="text-[7px] font-black uppercase tracking-widest leading-none">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white dark:bg-slate-950 overflow-y-auto">
            <div className="max-w-5xl mx-auto w-full p-6 md:p-10 pb-20 animate-in fade-in duration-300">
              {activeProfileTab === 'personal' && <PersonalInfo student={selectedStudent} isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} staff={staff} settings={settings} isAdmin={isAdmin} />}
              {activeProfileTab === 'health' && <HealthRecord student={selectedStudent} isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} onViewPdf={() => {}} onUploadPdf={() => {}} />}
              {activeProfileTab === 'records' && <PerformanceMatrix student={selectedStudent} logs={studentPerformance.analysis} milestones={studentPerformance.milestones} filter="Weekly" setFilter={() => {}} onOpenDay={() => {}} />}
              {activeProfileTab === 'payments' && <PaymentLedger totalPaid={selectedStudent.totalPaid || 0} balance={Math.max(0, settings.feesAmount - (selectedStudent.totalPaid || 0))} payments={[]} borderClass="border-slate-900" />}
            </div>
          </div>
        </div>
      )}

      <RegisterStudentModal isOpen={isAddingStudent} onClose={() => setIsAddingStudent(false)} />

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-900 w-full max-w-md border-4 border-slate-900 rounded-none overflow-hidden animate-in zoom-in-95 duration-300 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
              <div className="p-10 text-center space-y-8">
                 <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 text-rose-600 mx-auto flex items-center justify-center border-4 border-rose-100 dark:border-rose-800 rounded-none shadow-inner animate-pulse">
                    <AlertTriangle size={56} />
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-3xl font-black uppercase tracking-tight dark:text-white leading-none">Security Override</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
                      You are about to permanently purge <b className="text-slate-900 dark:text-white uppercase">"{selectedStudent?.fullName}"</b> from the official school registry. This action cannot be reversed.
                    </p>
                 </div>
                 <div className="flex flex-col gap-3 pt-6">
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full py-5 bg-rose-600 text-white font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:bg-black transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 className="animate-spin" size={20}/> : <><Trash2 size={20}/> Confirm Permanent Deletion</>}
                    </button>
                    <button 
                      onClick={() => setShowDeleteModal(false)}
                      className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] border-2 border-slate-900 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      Abort Mission
                    </button>
                 </div>
              </div>
              <div className="bg-slate-900 p-4 text-center">
                 <p className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Motion Max Terminal // Purge Protocol Alpha</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
