import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Search, ChevronRight, X, LayoutGrid, List, 
  Trash2, Edit2, ArrowLeft, Loader2, Save, Activity, HeartPulse, CreditCard, Plus, Filter, Check, UserCircle, AlertTriangle
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
  const { students, staff, updateStudent, deleteStudent, settings, user, clinicalLogs, milestoneRecords, parents } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'personal' | 'health' | 'records' | 'payments'>('personal');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [detailRecordDay, setDetailRecordDay] = useState<string | null>(null); 
  const [timeFilter, setTimeFilter] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Weekly');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('All Classes');
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isParent = user?.role === 'PARENT';
  const isSpecialist = user?.role === 'SPECIALIST';
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'personal', label: 'Student Info', icon: <UserCircle size={16} /> },
    { id: 'health', label: 'Medical History', icon: <HeartPulse size={16} /> },
    { id: 'records', label: 'Learning Progress', icon: <Activity size={16} /> },
    { id: 'payments', label: 'Billing & Fees', icon: <CreditCard size={16} /> }
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
      setSelectedStudent(null);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTabClick = (tabId: string, index: number) => {
    setActiveProfileTab(tabId as any);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: index * scrollContainerRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto px-4 md:px-0">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 border-b border-slate-200 pb-6 md:pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-slate-950 dark:text-white leading-none tracking-tight">Students List</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest italic">Viewing all enrolled students</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsAddingStudent(true)} className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-none text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
            <Plus size={18} /> Add Student
          </button>
        )}
      </header>

      {!isParent && (
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 bg-white dark:bg-slate-900 rounded-none text-sm font-bold border border-slate-900 outline-none focus:border-blue-600 transition-all shadow-sm" />
          </div>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowClassDropdown(!showClassDropdown)} className="flex items-center justify-between gap-6 px-6 py-3 md:py-4 bg-white dark:bg-slate-900 border border-slate-900 rounded-none text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors w-full md:w-56">
              <div className="flex items-center gap-3"><Filter size={16} className="text-slate-400" /><span className="truncate">{selectedClass}</span></div>
              <ChevronRight size={16} className={`text-slate-400 transition-transform duration-300 ${showClassDropdown ? 'rotate-90' : 'rotate-0'}`} />
            </button>
            {showClassDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-900 shadow-2xl z-[100] p-1 animate-in fade-in zoom-in-95 duration-200 origin-top">
                <div className="max-h-64 overflow-y-auto py-1">
                  <button onClick={() => { setSelectedClass('All Classes'); setShowClassDropdown(false); }} className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase transition-colors hover:bg-blue-600 hover:text-white ${selectedClass === 'All Classes' ? 'text-blue-600' : 'text-slate-700'}`}>All Classes {selectedClass === 'All Classes' && <Check size={14} />}</button>
                  {settings.classes.map(cls => (
                    <button key={cls} onClick={() => { setSelectedClass(cls); setShowClassDropdown(false); }} className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase transition-colors hover:bg-blue-600 hover:text-white ${selectedClass === cls ? 'text-blue-600' : 'text-slate-700'}`}>{cls} {selectedClass === cls && <Check size={14} />}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-none flex gap-1 border border-slate-900 h-fit w-fit self-center">
            <button onClick={() => setViewMode('table')} className={`p-2 md:p-2.5 rounded-none transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><List size={20} /></button>
            <button onClick={() => setViewMode('cards')} className={`p-2 md:p-2.5 rounded-none transition-all ${viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><LayoutGrid size={20} /></button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-900 rounded-none overflow-hidden shadow-sm">
        {viewMode === 'table' && !isParent ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto min-w-[600px]">
              <thead className="bg-slate-900 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b border-slate-900">
                <tr><th className="px-6 md:px-10 py-5 md:py-6">Student Name</th><th className="px-4 py-6 text-center">ID Number</th><th className="px-4 py-6 hidden md:table-cell">Class</th><th className="px-6 md:px-10 py-6 text-right">Profile</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={4} className="px-10 py-20 text-center text-xs font-black uppercase text-slate-300 italic tracking-widest">No students found</td></tr>
                ) : filteredStudents.map(student => {
                  const color = getStudentColor(student.id);
                  return (
                    <tr key={student.id} className={`${color.row} ${color.dark} hover:brightness-95 cursor-pointer transition-all border-l-[6px] md:border-l-[12px] ${color.accent}`} onClick={() => { setSelectedStudent(student); setEditForm(student); setIsEditing(false); }}>
                      <td className="px-6 md:px-10 py-4 md:py-6 flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white border border-slate-900 overflow-hidden flex items-center justify-center font-black text-[10px] md:text-xs uppercase text-slate-900 rounded-none flex-shrink-0 shadow-sm">
                          {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover" alt="" /> : student.fullName[0]}
                        </div>
                        <span className="font-black text-xs md:text-sm uppercase text-slate-900 dark:text-white truncate">{student.fullName}</span>
                      </td>
                      <td className="px-4 py-6 text-center font-mono text-[9px] md:text-[10px] text-slate-900 dark:text-slate-100 font-black uppercase">{student.id}</td>
                      <td className="px-4 py-6 text-[9px] md:text-[10px] font-black uppercase text-slate-900 dark:text-slate-100 hidden md:table-cell">{student.assignedClass}</td>
                      <td className="px-6 md:px-10 py-6 text-right"><ChevronRight size={18} className="inline text-slate-900 dark:text-white" /></td>
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
                <div key={student.id} className={`${color.bg} border-2 border-slate-900 hover:scale-[1.02] md:hover:scale-105 rounded-none p-6 md:p-8 transition-all cursor-pointer group shadow-lg active:translate-y-0.5 relative overflow-hidden`} onClick={() => { setSelectedStudent(student); setEditForm(student); setIsEditing(false); }}>
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white border border-slate-900 mb-4 md:mb-6 flex items-center justify-center font-black text-3xl md:text-4xl text-slate-900 uppercase rounded-none shadow-lg overflow-hidden">
                    {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover" alt="" /> : student.fullName[0]}
                  </div>
                  <h3 className="font-black text-lg md:text-xl uppercase text-white leading-none mb-1 md:mb-2 tracking-tighter truncate">{student.fullName}</h3>
                  <p className="text-[9px] md:text-[10px] font-black text-white/70 uppercase tracking-widest">{student.assignedClass}</p>
                  <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/20 flex items-center justify-between">
                    <span className="text-[8px] md:text-[9px] font-mono text-white/50 font-bold uppercase">ID: {student.id}</span>
                    <ChevronRight size={18} className="text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-[10000] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden shadow-2xl">
          <header className="p-4 md:p-6 lg:px-10 border-b border-slate-900 flex items-center justify-between bg-white dark:bg-slate-900 z-50">
            <div className="flex items-center gap-4 min-w-0">
              <button onClick={() => setSelectedStudent(null)} className="p-2 md:p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-900 text-slate-500 hover:text-black dark:hover:text-white transition-all active:scale-90 flex items-center gap-2">
                <ArrowLeft size={18} /><span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Exit Profile</span>
              </button>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white flex items-center justify-center font-black text-lg text-slate-900 border border-slate-900 shadow-md overflow-hidden shrink-0">
                {selectedStudent.imageUrl ? <img src={selectedStudent.imageUrl} className="w-full h-full object-cover" alt="" /> : selectedStudent.fullName[0]}
              </div>
              <div className="min-w-0">
                <h2 className="text-base md:text-lg font-black uppercase text-slate-950 dark:text-white leading-none truncate">{selectedStudent.fullName}</h2>
                <p className="text-[8px] font-mono font-bold text-blue-600 mt-1 uppercase tracking-widest">ID: {selectedStudent.id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isParent && isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteModal(true)} disabled={isDeleting} className="p-2 md:px-4 md:py-2.5 bg-rose-600 text-white rounded-none text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 border border-slate-900">
                    <Trash2 size={14} /><span className="hidden lg:inline">Delete Record</span>
                  </button>
                  <button onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)} className={`px-4 py-2.5 rounded-none border border-slate-900 transition-all text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2 ${isEditing ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-black'}`}>
                    {isEditing ? <Save size={14}/> : <Edit2 size={14}/>}
                    <span>{isEditing ? 'Save Changes' : 'Edit Info'}</span>
                  </button>
                </div>
              )}
              <button onClick={() => setSelectedStudent(null)} className="p-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors"><X size={24} /></button>
            </div>
          </header>

          <div className="flex bg-slate-50 dark:bg-slate-900 border-b border-slate-900 p-1 md:px-10 overflow-x-auto no-scrollbar z-40 sticky top-0">
            {tabs.map((tab, idx) => (
              <button key={tab.id} onClick={() => handleTabClick(tab.id, idx)} className={`flex-1 md:flex-none px-6 md:px-8 py-3.5 md:py-4 rounded-none flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all border-b-4 whitespace-nowrap ${activeProfileTab === tab.id ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-blue-500 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                {tab.icon}<span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white dark:bg-slate-950 overflow-y-auto">
            <div className="max-w-5xl mx-auto w-full p-4 md:p-10 lg:p-16 pb-20 animate-in fade-in duration-300">
              {activeProfileTab === 'personal' && <PersonalInfo student={selectedStudent} isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} staff={staff} settings={settings} isAdmin={isAdmin} />}
              {activeProfileTab === 'health' && <HealthRecord student={selectedStudent} isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} onViewPdf={() => {}} onUploadPdf={() => {}} />}
              {activeProfileTab === 'records' && <PerformanceMatrix student={selectedStudent} logs={studentPerformance.analysis} milestones={studentPerformance.milestones} filter={timeFilter} setFilter={setTimeFilter} onOpenDay={setDetailRecordDay} />}
              {activeProfileTab === 'payments' && <PaymentLedger totalPaid={selectedStudent.totalPaid || 0} balance={Math.max(0, settings.feesAmount - (selectedStudent.totalPaid || 0))} payments={[]} borderClass="border-slate-900" />}
            </div>
          </div>
        </div>
      )}

      <RegisterStudentModal isOpen={isAddingStudent} onClose={() => setIsAddingStudent(false)} />
    </div>
  );
};