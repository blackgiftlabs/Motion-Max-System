
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
  DollarSign
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
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
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
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
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
      // Therapist sees students in their assigned classes AND explicitly assigned to them
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
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
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
            <button onClick={() => { setIsAddModalOpen(true); setSelectedClassForAdd(''); }} className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-black transition-all active:scale-95">
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
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 rounded-[1.25rem] text-sm font-bold border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm" 
          />
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-700 h-fit">
          <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={22} /></button>
          <button onClick={() => setViewMode('cards')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={22} /></button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
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
                      <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700">{student.id}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase border border-blue-100 dark:border-blue-800 shadow-sm">{student.assignedClass}</span>
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
              <div key={student.id} className="bg-slate-50 dark:bg-slate-950 border-2 border-transparent hover:border-blue-500 dark:bg-slate-800 rounded-[2rem] p-8 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden" onClick={() => { setSelectedStudent(student); setIsEditing(false); setEditForm(student); }}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                   <Hash size={40} className="text-blue-600" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl mb-6 uppercase shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">{student.fullName[0]}</div>
                <h3 className="font-black text-lg uppercase text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight mb-2">{student.fullName}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.assignedClass}</p>
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                   <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">{student.id}</span>
                   <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setSelectedStudent(null)} />
          <aside className="relative w-full max-w-2xl bg-white dark:bg-slate-950 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-100 dark:border-slate-800">
            <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md z-20 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 text-white flex items-center justify-center font-black text-2xl uppercase shadow-xl shadow-blue-500/20">{selectedStudent.fullName[0]}</div>
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
                    <button onClick={() => setShowDeleteConfirm(true)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100 dark:border-rose-900/30"><Trash2 size={20}/></button>
                    <button onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)} className={`p-3 rounded-xl transition-all shadow-md ${isEditing ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 dark:border-blue-900/30'}`}>
                      {isEditing ? <Save size={20}/> : <Edit2 size={20}/>}
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedStudent(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-black transition-colors"><X size={28}/></button>
              </div>
            </header>

            <div className="flex bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-2 gap-1.5">
               {['personal', 'health', 'payments'].map((tab: any) => (
                 <button 
                  key={tab} 
                  onClick={() => setActiveProfileTab(tab)}
                  className={`flex-1 py-3.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeProfileTab === tab ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md border border-slate-100 dark:border-slate-700' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 sidebar-scrollbar">
               {activeProfileTab === 'personal' && (
                 <div className="space-y-8">
                    <div className="flex items-center gap-3">
                       <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Personal Details</h3>
                       <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                    </div>
                    <table className="w-full">
                       <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                          <ProfileRow label="First Name" value={selectedStudent.firstName} field="firstName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Surname" value={selectedStudent.lastName} field="lastName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Date of Birth" value={selectedStudent.dob} field="dob" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Gender" value={selectedStudent.gender} field="gender" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={['Male', 'Female']} />
                          <ProfileRow label="Class" value={selectedStudent.assignedClass} field="assignedClass" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={settings?.classes || []} />
                          {isAdmin && <ProfileRow label="Teacher" value={staff.find(s => s.id === selectedStudent.assignedStaffId)?.fullName || 'Not Assigned'} field="assignedStaffId" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={specialistOptions} />}
                          <ProfileRow label="Enrollment Date" value={selectedStudent.enrollmentDate} field="enrollmentDate" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                       </tbody>
                    </table>

                    <div className="flex items-center gap-3 pt-6">
                       <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Family Info</h3>
                       <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                    </div>
                    <table className="w-full">
                       <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                          <ProfileRow label="Parent/Guardian" value={selectedStudent.parentName} field="parentName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Email" value={selectedStudent.parentEmail} field="parentEmail" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Phone" value={selectedStudent.parentPhone} field="parentPhone" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Address" value={selectedStudent.homeAddress} field="homeAddress" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                       </tbody>
                    </table>
                 </div>
               )}

               {activeProfileTab === 'health' && (
                 <div className="space-y-8">
                    <div className="flex items-center gap-3">
                       <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-rose-600">Medical Data</h3>
                       <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                    </div>
                    <table className="w-full">
                       <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                          <ProfileRow label="Diagnosis" value={selectedStudent.diagnosis} field="diagnosis" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Behaviors" value={selectedStudent.targetBehaviors} field="targetBehaviors" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Medical Notes" value={selectedStudent.medicalRecords} field="medicalRecords" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                          <ProfileRow label="Uniform Sizes" value={selectedStudent.uniformSizes} field="uniformSizes" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                       </tbody>
                    </table>
                 </div>
               )}

               {activeProfileTab === 'payments' && (
                 <div className="space-y-10">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-8 bg-emerald-50/50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-800/50 rounded-[2rem] shadow-sm group">
                          <p className="text-[10px] font-black uppercase text-emerald-600 mb-3 tracking-widest group-hover:translate-x-1 transition-transform">Total Paid</p>
                          <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tighter">${selectedStudent.totalPaid || 0}</p>
                       </div>
                       <div className="p-8 bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800/50 rounded-[2rem] text-right shadow-sm group">
                          <p className="text-[10px] font-black uppercase text-blue-600 mb-3 tracking-widest group-hover:-translate-x-1 transition-transform">Total Fees</p>
                          <p className="text-3xl font-black text-blue-700 dark:text-blue-400 font-mono tracking-tighter">${settings.feesAmount}</p>
                       </div>
                    </div>
                    <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-between border-2 border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${selectedStudent.totalPaid === settings.feesAmount ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
                          <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.2em]">Payment Status</span>
                       </div>
                       <div className="flex flex-col items-end">
                         <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-xl shadow-sm border ${selectedStudent.totalPaid === settings.feesAmount ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                            {selectedStudent.totalPaid === settings.feesAmount ? 'Paid' : 'Balance Due'}
                         </span>
                         {selectedStudent.totalPaid !== settings.feesAmount && (
                           <p className="text-[10px] font-black text-rose-600 mt-2 font-mono">-${Math.max(0, settings.feesAmount - (selectedStudent.totalPaid || 0))}</p>
                         )}
                       </div>
                    </div>
                 </div>
               )}
            </div>

            {showDeleteConfirm && (
              <div className="absolute inset-0 z-50 bg-white/95 dark:bg-slate-950/95 flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 backdrop-blur-md">
                 <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl ring-8 ring-rose-50/50"><Trash2 size={48}/></div>
                 <h3 className="text-3xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Delete Student?</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-4 max-w-sm mx-auto leading-relaxed">This will permanently delete the student and all linked data. This cannot be undone.</p>
                 <div className="flex gap-4 mt-12 w-full max-sm">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black uppercase text-xs transition-all hover:bg-slate-200 active:scale-95">Cancel</button>
                    <button onClick={handleDelete} className="flex-1 py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-rose-600/20 hover:bg-rose-700 active:scale-95 transition-all">Confirm Delete</button>
                 </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-[90vw] lg:max-w-7xl bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] overflow-hidden animate-in zoom-in-95 max-h-[95vh] overflow-y-auto sidebar-scrollbar border border-slate-200 dark:border-slate-800">
             <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10 shadow-sm">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-[1.25rem] text-blue-600">
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
                    {/* Column 1: Identity & Assignment */}
                    <div className="space-y-12">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">01 Identity</span>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">First Name</label>
                                    <input required name="firstName" className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="First name..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Surname</label>
                                    <input required name="lastName" className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="Surname..." />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Date of Birth</label>
                                    <input required type="date" name="dob" className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Gender</label>
                                    <select name="gender" className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold dark:text-white appearance-none cursor-pointer shadow-inner">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">02 Assignment</span>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400">Class Assignment</label>
                                    {selectedClassForAdd && <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-800">{selectedClassForAdd}</span>}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-6 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-inner">
                                    {(settings?.classes || []).map(cls => (
                                        <button
                                            key={cls}
                                            type="button"
                                            onClick={() => setSelectedClassForAdd(cls)}
                                            className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border-2 flex items-center justify-center gap-2 ${selectedClassForAdd === cls ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-blue-200'}`}
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
                                    <select name="assignedStaffId" className="w-full pl-16 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold dark:text-white appearance-none cursor-pointer shadow-inner">
                                        <option value="">Select teacher...</option>
                                        {specialists.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Column 2: Parent Info */}
                    <div className="space-y-12">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">03 Parent Info</span>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Guardian Full Name</label>
                                <input required name="parentName" className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="Guardian name..." />
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Email Address</label>
                                    <input required type="email" name="parentEmail" className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="guardian@email.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Phone</label>
                                    <input required type="tel" name="parentPhone" placeholder="+263..." className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Home Address</label>
                                <textarea name="homeAddress" rows={3} className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner resize-none" placeholder="Full residential address..." />
                            </div>
                        </section>
                    </div>

                    {/* Column 3: Health & Save */}
                    <div className="space-y-12">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-4 py-1.5 rounded-full border border-rose-100 dark:border-rose-800">04 Health (Optional)</span>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Clinical Diagnosis</label>
                                    <input name="diagnosis" className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="e.g. ASD Level 1..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Target Behaviors</label>
                                    <input name="targetBehaviors" className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="e.g. Stimming, Elopement..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Medical Notes</label>
                                    <textarea name="medicalRecords" rows={2} className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner resize-none" placeholder="Allergies, medications..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Uniform Sizes</label>
                                    <input name="uniformSizes" className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="e.g. Small, Size 6..." />
                                </div>
                            </div>
                        </section>

                        <div className="pt-10">
                            <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-[#002D50] text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4">
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
