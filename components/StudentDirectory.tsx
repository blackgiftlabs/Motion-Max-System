
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  Search, 
  UserPlus, 
  ChevronRight, 
  X, 
  LayoutGrid, 
  List, 
  Save, 
  Trash2, 
  Edit2,
  Loader2,
  CheckCircle2,
  User as UserIcon,
  ShieldCheck,
  Hash,
  Database,
  HeartPulse,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { Student } from '../types';

const ProfileRow = ({ 
  label, 
  value, 
  field, 
  isEditing, 
  editForm, 
  setEditForm,
  options 
}: { 
  label: string, 
  value: string, 
  field?: keyof Student, 
  isEditing: boolean, 
  editForm: Partial<Student>, 
  setEditForm: (val: Partial<Student>) => void,
  options?: { value: string, label: string }[] | string[]
}) => (
  <tr className="border-b border-slate-100 dark:border-slate-800/50 group/row">
    <td className="py-4 px-2 w-1/3 text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 group-hover/row:text-blue-600 transition-colors">{label}</td>
    <td className="py-4 px-2">
      {isEditing && field ? (
        options ? (
          <select 
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-none text-sm font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
            value={(editForm as any)[field] || ''}
            onChange={e => setEditForm({...editForm, [field]: e.target.value})}
          >
            <option value="">Select Option</option>
            {options.map(opt => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const lbl = typeof opt === 'string' ? opt : opt.label;
              return <option key={val} value={val}>{lbl}</option>;
            })}
          </select>
        ) : (
          <input 
            type="text"
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-none text-sm font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
            value={(editForm as any)[field] || ''}
            onChange={e => setEditForm({...editForm, [field]: e.target.value})}
          />
        )
      ) : (
        <span className={`text-sm font-bold text-slate-700 dark:text-slate-200 ${field === 'id' ? 'font-mono text-blue-600 dark:text-blue-400' : ''}`}>
          {value || 'Not Set'}
        </span>
      )}
    </td>
  </tr>
);

export const StudentDirectory: React.FC = () => {
  const { students, staff, addStudent, updateStudent, deleteStudent, settings, user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'personal' | 'health' | 'payments'>('personal');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [selectedClassForAdd, setSelectedClassForAdd] = useState('');

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isSpecialist = user?.role === 'SPECIALIST';

  const filteredStudents = (students || []).filter(s => {
    if (isSpecialist) {
      const currentStaff = staff.find(st => st.id === user?.id);
      const inAssignedClass = currentStaff?.assignedClasses?.includes(s.assignedClass);
      const isAssignedTeacher = s.assignedStaffId === user?.id;
      if (!inAssignedClass || !isAssignedTeacher) return false;
    }
    const fullName = s.fullName.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || s.id.toLowerCase().includes(search);
  });

  const specialists = useMemo(() => staff.filter(s => s.role === 'SPECIALIST'), [staff]);
  const specialistOptions = useMemo(() => specialists.map(s => ({ value: s.id, label: s.fullName })), [specialists]);

  const handleSaveEdit = async () => {
    if (!selectedStudent || !selectedStudent.firebaseUid) return;
    setIsSubmitting(true);
    try {
      const updatedData = { ...editForm };
      if (editForm.firstName || editForm.lastName) {
        updatedData.fullName = `${editForm.firstName || selectedStudent.firstName} ${editForm.lastName || selectedStudent.lastName}`;
      }
      await updateStudent(selectedStudent.firebaseUid, updatedData);
      setSelectedStudent({ ...selectedStudent, ...updatedData } as Student);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent || !selectedStudent.firebaseUid) return;
    await deleteStudent(selectedStudent.firebaseUid);
    setSelectedStudent(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-none text-blue-600">
              <Database size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Student List</span>
          </div>
          <h1 className="text-4xl font-black uppercase text-slate-950 dark:text-white leading-none tracking-tight">
            {isSpecialist ? 'My Assigned Students' : 'Student Directory'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-3 italic">
            {isSpecialist ? 'Managing students assigned to your class and terminal.' : 'Complete database of all enrolled students.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button onClick={() => { setIsAddModalOpen(true); setSelectedClassForAdd(''); }} className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 text-white rounded-none text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-black transition-all active:scale-95">
              <UserPlus size={18} /> Add New Student
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name or student ID..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 rounded-none text-sm font-bold border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" 
          />
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-none flex gap-1 border border-slate-200 dark:border-slate-700 h-fit">
          <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-none transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={22} /></button>
          <button onClick={() => setViewMode('cards')} className={`p-2.5 rounded-none transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={22} /></button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-none overflow-hidden shadow-sm">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-950 dark:text-slate-400 border-b-2 border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-10 py-6 tracking-widest">Full Name</th>
                  <th className="px-8 py-6 tracking-widest text-center">Student ID</th>
                  <th className="px-8 py-6 tracking-widest">Class</th>
                  <th className="px-10 py-6 text-right tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-24 text-center font-bold text-slate-300 uppercase italic text-xs tracking-[0.2em]">Student not found.</td>
                  </tr>
                ) : filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/10 cursor-pointer group transition-colors" onClick={() => { setSelectedStudent(student); setIsEditing(false); setEditForm(student); }}>
                    <td className="px-10 py-6 font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{student.fullName}</td>
                    <td className="px-8 py-6 text-center">
                      <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-none border border-slate-100 dark:border-slate-700">{student.id}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 rounded-none bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase border border-blue-100 dark:border-blue-800 shadow-sm">{student.assignedClass}</span>
                    </td>
                    <td className="px-10 py-6 text-right"><ChevronRight size={20} className="ml-auto text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredStudents.map(student => (
              <div key={student.id} className="bg-white dark:bg-slate-900 border-2 border-slate-200 hover:border-blue-500 dark:border-slate-800 rounded-none p-8 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden" onClick={() => { setSelectedStudent(student); setIsEditing(false); setEditForm(student); }}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                   <Hash size={40} className="text-blue-600" />
                </div>
                <div className="w-16 h-16 rounded-none bg-blue-600 text-white flex items-center justify-center font-black text-2xl mb-6 uppercase shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">{student.fullName[0]}</div>
                <h3 className="font-black text-lg uppercase text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight mb-2">{student.fullName}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.assignedClass}</p>
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                   <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">ID: {student.id}</span>
                   <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-[500] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
          <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md z-20 shadow-sm">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-slate-400 hover:text-black transition-all active:scale-90"
              >
                <ArrowLeft size={28} />
              </button>
              <div className="w-16 h-16 rounded-none bg-blue-600 text-white flex items-center justify-center font-black text-2xl uppercase shadow-xl shadow-blue-500/20">{selectedStudent.fullName[0]}</div>
              <div>
                 <h2 className="text-xl font-black uppercase text-slate-950 dark:text-white leading-none tracking-tight">Student Profile</h2>
                 <div className="flex items-center gap-4 mt-2">
                   <p className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-[0.2em]">ID: {selectedStudent.id}</p>
                   <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                   <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-rose-600">
                      <DollarSign size={12} />
                      Balance: ${Math.max(0, settings.feesAmount - (selectedStudent.totalPaid || 0))}
                   </div>
                 </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-4 bg-rose-50 text-rose-500 rounded-none hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100 dark:border-rose-900/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Trash2 size={18}/> Delete
                  </button>
                  <button onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)} className={`px-8 py-4 rounded-none transition-all shadow-md text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isEditing ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 text-white hover:bg-black'}`}>
                    {isEditing ? <><Save size={18}/> Save Profile</> : <><Edit2 size={18}/> Edit Profile</>}
                  </button>
                </>
              )}
            </div>
          </header>

          <div className="flex bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-2 gap-1.5 px-8">
             {['personal', 'health', 'payments'].map((tab: any) => (
               <button 
                key={tab} 
                onClick={() => setActiveProfileTab(tab)}
                className={`px-8 py-3.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 ${activeProfileTab === tab ? 'bg-white dark:bg-slate-800 text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-200'}`}
               >
                 {tab}
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-12 max-w-6xl mx-auto w-full sidebar-scrollbar">
             {activeProfileTab === 'personal' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                       <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Identification</h3>
                       <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                    </div>
                    <table className="w-full">
                       <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                          <ProfileRow label="First Name" value={selectedStudent.firstName} field="firstName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Surname" value={selectedStudent.lastName} field="lastName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Date of Birth" value={selectedStudent.dob} field="dob" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Gender" value={selectedStudent.gender} field="gender" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={['Male', 'Female']} />
                          <ProfileRow label="Class Room" value={selectedStudent.assignedClass} field="assignedClass" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={settings?.classes || []} />
                          {isAdmin && <ProfileRow label="Teacher" value={staff.find(s => s.id === selectedStudent.assignedStaffId)?.fullName || 'Not Assigned'} field="assignedStaffId" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={specialistOptions} />}
                          <ProfileRow label="Enrollment" value={selectedStudent.enrollmentDate} field="enrollmentDate" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                       </tbody>
                    </table>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                       <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Guardian Details</h3>
                       <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                    </div>
                    <table className="w-full">
                       <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                          <ProfileRow label="Full Name" value={selectedStudent.parentName} field="parentName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Email Address" value={selectedStudent.parentEmail} field="parentEmail" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Phone Number" value={selectedStudent.parentPhone} field="parentPhone" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Residential Address" value={selectedStudent.homeAddress} field="homeAddress" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                       </tbody>
                    </table>
                  </div>
               </div>
             )}

             {activeProfileTab === 'health' && (
               <div className="space-y-8 max-w-4xl">
                  <div className="flex items-center gap-3">
                     <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-rose-600">Medical Data Repository</h3>
                     <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="p-8 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-none">
                       <label className="text-[10px] font-black uppercase text-slate-500 mb-4 block">Clinical Diagnosis</label>
                       {isEditing ? (
                         <textarea 
                          value={editForm.diagnosis || ''} 
                          onChange={e => setEditForm({...editForm, diagnosis: e.target.value})}
                          className="w-full p-4 bg-white dark:bg-slate-950 border-2 border-slate-100 rounded-none font-bold text-sm"
                         />
                       ) : <p className="text-lg font-black uppercase">{selectedStudent.diagnosis || 'None Logged'}</p>}
                    </div>
                    <div className="p-8 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-none">
                       <label className="text-[10px] font-black uppercase text-slate-500 mb-4 block">Target Behavioral Observations</label>
                       {isEditing ? (
                         <textarea 
                          value={editForm.targetBehaviors || ''} 
                          onChange={e => setEditForm({...editForm, targetBehaviors: e.target.value})}
                          className="w-full p-4 bg-white dark:bg-slate-950 border-2 border-slate-100 rounded-none font-bold text-sm"
                         />
                       ) : <p className="text-sm font-medium leading-relaxed italic">"{selectedStudent.targetBehaviors || 'No behaviors recorded.'}"</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-8 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-none">
                          <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Uniform Sizes</label>
                          <ProfileRow label="" value={selectedStudent.uniformSizes} field="uniformSizes" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                       </div>
                       <div className="p-8 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-none">
                          <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Medical Notes</label>
                          <ProfileRow label="" value={selectedStudent.medicalRecords} field="medicalRecords" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                       </div>
                    </div>
                  </div>
               </div>
             )}

             {activeProfileTab === 'payments' && (
               <div className="space-y-12 max-w-4xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-10 bg-emerald-50 dark:bg-emerald-900/10 border-4 border-emerald-100 dark:border-emerald-800 rounded-none shadow-sm text-center">
                        <p className="text-[10px] font-black uppercase text-emerald-600 mb-4 tracking-widest">Total Fees Paid</p>
                        <p className="text-5xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tighter">${selectedStudent.totalPaid || 0}</p>
                     </div>
                     <div className="p-10 bg-rose-50 dark:bg-rose-900/10 border-4 border-rose-100 dark:border-rose-800 rounded-none text-center shadow-sm">
                        <p className="text-[10px] font-black uppercase text-rose-600 mb-4 tracking-widest">Outstanding Balance</p>
                        <p className="text-5xl font-black text-rose-700 dark:text-rose-400 font-mono tracking-tighter">${Math.max(0, settings.feesAmount - (selectedStudent.totalPaid || 0))}</p>
                     </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-10 rounded-none">
                     <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Official Ledger Status</h4>
                        <span className={`px-4 py-1.5 rounded-none text-[9px] font-black uppercase border-2 ${selectedStudent.totalPaid === settings.feesAmount ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-rose-500 border-rose-500 text-white'}`}>
                           {selectedStudent.totalPaid === settings.feesAmount ? 'Account Synchronized' : 'Balance Alert'}
                        </span>
                     </div>
                     <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-none overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${selectedStudent.totalPaid === settings.feesAmount ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                          style={{ width: `${Math.min(100, ((selectedStudent.totalPaid || 0) / settings.feesAmount) * 100)}%` }}
                        />
                     </div>
                  </div>
               </div>
             )}
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[600] bg-white/98 dark:bg-slate-950/98 flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 backdrop-blur-md">
               <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-none border-4 border-rose-100 flex items-center justify-center mb-8 shadow-2xl"><Trash2 size={48}/></div>
               <h3 className="text-4xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Erase Student Node?</h3>
               <p className="text-base text-slate-500 dark:text-slate-400 font-medium mt-4 max-w-md mx-auto leading-relaxed">This action will permanently delete <b>{selectedStudent.fullName}</b> and all associated clinical, behavioral, and financial history. This operation is irreversible.</p>
               <div className="flex gap-6 mt-12 w-full max-w-md">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 rounded-none font-black uppercase text-xs transition-all hover:bg-slate-200 active:scale-95">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 py-5 bg-rose-600 text-white rounded-none font-black uppercase text-xs shadow-xl shadow-rose-600/20 hover:bg-rose-700 active:scale-95 transition-all">Confirm Deletion</button>
               </div>
            </div>
          )}
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-[90vw] lg:max-w-7xl bg-white dark:bg-slate-900 shadow-2xl rounded-none overflow-hidden animate-in zoom-in-95 max-h-[95vh] overflow-y-auto sidebar-scrollbar border border-slate-200 dark:border-slate-800">
             <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10 shadow-sm">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-none text-blue-600">
                      <UserPlus size={24} />
                   </div>
                   <h3 className="text-xl font-black uppercase text-slate-950 dark:text-white tracking-tight">Add New Student</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={28}/></button>
             </div>
             
             <form onSubmit={async (e) => {
               e.preventDefault();
               if (!selectedClassForAdd) {
                 alert("PLEASE SELECT A CLASS");
                 return;
               }
               setIsSubmitting(true);
               try {
                 const formData = new FormData(e.currentTarget);
                 const data = Object.fromEntries(formData.entries()) as any;
                 await addStudent({ 
                   ...data, 
                   assignedClass: selectedClassForAdd,
                   enrollmentDate: new Date().toISOString().split('T')[0] 
                 });
                 setIsAddModalOpen(false);
               } finally { setIsSubmitting(false); }
             }} className="p-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-12">
                    <div className="space-y-12">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-none border border-blue-100 dark:border-blue-800">01 Identity</span>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">First Name</label>
                                    <input required name="firstName" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="First name..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Surname</label>
                                    <input required name="lastName" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="Surname..." />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Date of Birth</label>
                                    <input required type="date" name="dob" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Gender</label>
                                    <select name="gender" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white appearance-none cursor-pointer shadow-inner">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-none border border-blue-100 dark:border-blue-800">02 Assignment</span>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400">Class Assignment</label>
                                    {selectedClassForAdd && <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-none border border-blue-100 dark:border-blue-800">{selectedClassForAdd}</span>}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-6 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-none shadow-inner">
                                    {(settings?.classes || []).map(cls => (
                                        <button
                                            key={cls}
                                            type="button"
                                            onClick={() => setSelectedClassForAdd(cls)}
                                            className={`px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-tight transition-all border-2 flex items-center justify-center gap-2 ${selectedClassForAdd === cls ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-blue-200'}`}
                                        >
                                            {selectedClassForAdd === cls && <CheckCircle2 size={14}/>}
                                            {cls}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Assigned Teacher</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                                    <select name="assignedStaffId" className="w-full pl-16 pr-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white appearance-none cursor-pointer shadow-inner">
                                        <option value="">Select teacher...</option>
                                        {specialists.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-12">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-none border border-blue-100 dark:border-blue-800">03 Parent Info</span>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Guardian Full Name</label>
                                <input required name="parentName" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="Guardian name..." />
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Email Address</label>
                                    <input required type="email" name="parentEmail" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="guardian@email.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Phone</label>
                                    <input required type="tel" name="parentPhone" placeholder="+263..." className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Home Address</label>
                                <textarea name="homeAddress" rows={3} className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner resize-none" placeholder="Full residential address..." />
                            </div>
                        </section>
                    </div>

                    <div className="space-y-12">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-4 py-1.5 rounded-none border border-rose-100 dark:border-rose-800">04 Health (Optional)</span>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Clinical Diagnosis</label>
                                    <input name="diagnosis" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="e.g. ASD Level 1..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Target Behaviors</label>
                                    <input name="targetBehaviors" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="e.g. Stimming, Elopement..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Medical Notes</label>
                                    <textarea name="medicalRecords" rows={2} className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner resize-none" placeholder="Allergies, medications..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Uniform Sizes</label>
                                    <input name="uniformSizes" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="e.g. Small, Size 6..." />
                                </div>
                            </div>
                        </section>

                        <div className="pt-10">
                            <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-[#002D50] text-white rounded-none font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4">
                                {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <>Finalize Enrollment <ChevronRight size={20}/></>}
                            </button>
                        </div>
                    </div>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
