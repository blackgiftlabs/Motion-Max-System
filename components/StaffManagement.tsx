
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  ChevronRight, 
  Search, 
  X, 
  Plus, 
  Loader2, 
  LayoutGrid, 
  List, 
  Save, 
  Trash2, 
  Edit2,
  Globe,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  User,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { Staff } from '../types';

const ProfileRow = ({ 
  label, 
  value, 
  field, 
  isEditing, 
  editForm, 
  setEditForm,
  options,
  multiple,
  availableClasses
}: { 
  label: string, 
  value: any, 
  field?: keyof Staff, 
  isEditing: boolean, 
  editForm: Partial<Staff>, 
  setEditForm: (val: Partial<Staff>) => void,
  options?: string[],
  multiple?: boolean,
  availableClasses?: string[]
}) => (
  <tr className="border-b border-slate-100 dark:border-slate-800/50 group/row">
    <td className="py-4 px-2 w-1/3 text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 group-hover/row:text-blue-600 transition-colors">{label}</td>
    <td className="py-4 px-2">
      {isEditing && field ? (
        multiple && availableClasses ? (
          <div className="flex flex-wrap gap-2 py-2">
            {availableClasses.map(cls => (
              <label key={cls} className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-none cursor-pointer hover:border-blue-500 transition-all select-none">
                <input 
                  type="checkbox"
                  className="w-4 h-4 rounded-none border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
                  checked={(editForm.assignedClasses || []).includes(cls)}
                  onChange={e => {
                    const current = editForm.assignedClasses || [];
                    const next = e.target.checked 
                      ? [...current, cls]
                      : current.filter(c => c !== cls);
                    setEditForm({ ...editForm, assignedClasses: next });
                  }}
                />
                <span className="text-[10px] font-black uppercase tracking-tight">{cls}</span>
              </label>
            ))}
          </div>
        ) : options ? (
          <select 
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-none text-sm font-bold outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all"
            value={(editForm as any)[field] || ''}
            onChange={e => setEditForm({...editForm, [field]: e.target.value})}
          >
            <option value="">Select Option</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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
          {Array.isArray(value) ? value.join(', ') : (value || 'None')}
        </span>
      )}
    </td>
  </tr>
);

export const StaffManagement: React.FC = () => {
  const { staff, addStaff, updateStaff, deleteStaff, settings, user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'administration' | 'general'>('administration');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Staff>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedClassesForAdd, setSelectedClassesForAdd] = useState<string[]>([]);
  const [addFormNationality, setAddFormNationality] = useState('Zimbabwean');

  const isAdmin = user?.role === 'SUPER_ADMIN';

  const filteredStaff = (staff || []).filter(s => {
    const isCorrectType = activeSubTab === 'administration' 
      ? (s.role === 'ADMIN_SUPPORT' || s.role === 'SUPER_ADMIN')
      : (s.role === 'SPECIALIST');
    
    const fullName = s.fullName.toLowerCase();
    const search = searchTerm.toLowerCase();
    return isCorrectType && (fullName.includes(search));
  });

  const handleSaveEdit = async () => {
    if (!selectedStaff) return;
    setIsSubmitting(true);
    try {
      await updateStaff(selectedStaff.id, editForm);
      setSelectedStaff({ ...selectedStaff, ...editForm });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    await deleteStaff(selectedStaff.id);
    setSelectedStaff(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-none text-blue-600">
              <Briefcase size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Staff Records</span>
          </div>
          <h1 className="text-4xl font-black uppercase text-slate-900 dark:text-white leading-none tracking-tight">Staff Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-3 italic">Manage and view information for all school employees.</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button onClick={() => { setIsAdding(true); setSelectedClassesForAdd([]); setAddFormNationality('Zimbabwean'); }} className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 text-white rounded-none text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-black transition-all active:scale-95">
              <Plus size={18} /> Add New Staff
            </button>
          )}
        </div>
      </header>

      <div className="flex items-center gap-1.5 border-b-2 border-slate-100 dark:border-slate-800 mb-2">
        <button onClick={() => setActiveSubTab('administration')} className={`px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] border-b-4 transition-all ${activeSubTab === 'administration' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Admin & Support</button>
        <button onClick={() => setActiveSubTab('general')} className={`px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] border-b-4 transition-all ${activeSubTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Teachers & Therapists</button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search staff members..." 
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

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-none overflow-hidden shadow-sm">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-950 dark:text-slate-400 border-b-2 border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-10 py-6 tracking-widest">Full Name</th>
                  <th className="px-8 py-6 tracking-widest">Job Position</th>
                  <th className="px-8 py-6 tracking-widest">Classes</th>
                  <th className="px-10 py-6 text-right tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-24 text-center font-bold text-slate-300 uppercase italic text-xs tracking-[0.2em]">No staff records found.</td>
                  </tr>
                ) : filteredStaff.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/10 cursor-pointer group transition-colors" onClick={() => { setSelectedStaff(s); setIsEditing(false); setEditForm(s); }}>
                    <td className="px-10 py-6 font-black text-sm uppercase tracking-tight group-hover:text-blue-600 transition-colors">{s.fullName}</td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 rounded-none bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase border border-blue-100 dark:border-blue-800 shadow-sm">{s.position}</span>
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{s.assignedClasses?.join(', ') || 'Not Assigned'}</td>
                    <td className="px-10 py-6 text-right"><ChevronRight size={20} className="ml-auto text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredStaff.map(s => (
              <div key={s.id} className="bg-slate-50 dark:bg-slate-950 border-2 border-transparent hover:border-blue-500 dark:bg-slate-800 rounded-none p-8 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden" onClick={() => { setSelectedStaff(s); setIsEditing(false); setEditForm(s); }}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                   <ShieldCheck size={40} className="text-blue-600" />
                </div>
                <div className="w-16 h-16 rounded-none bg-slate-900 text-white flex items-center justify-center font-black text-2xl mb-6 uppercase shadow-lg group-hover:scale-110 transition-transform">{s.fullName[0]}</div>
                <h3 className="font-black text-lg uppercase group-hover:text-blue-600 transition-colors leading-tight mb-2">{s.fullName}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.position}</p>
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                   <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">ID: {s.id.substring(0,8)}</span>
                   <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStaff && (
        <div className="fixed inset-0 z-[500] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
          <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md z-20 shadow-sm">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setSelectedStaff(null)} 
                className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-slate-400 hover:text-black transition-all active:scale-90"
              >
                <ArrowLeft size={28} />
              </button>
              <div className="w-16 h-16 rounded-none bg-slate-900 text-white flex items-center justify-center font-black text-2xl uppercase shadow-xl">{selectedStaff.fullName[0]}</div>
              <div>
                 <h2 className="text-xl font-black uppercase dark:text-white leading-none tracking-tight">Staff Profile</h2>
                 <p className="text-[10px] font-mono font-bold text-blue-600 mt-2 uppercase tracking-[0.2em]">{selectedStaff.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <>
                  <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-4 bg-rose-50 text-rose-500 rounded-none hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100 dark:border-rose-900/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Trash2 size={18}/> Remove Staff
                  </button>
                  <button onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)} className={`px-8 py-4 rounded-none transition-all shadow-md text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isEditing ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 text-white hover:bg-black'}`}>
                    {isEditing ? <><Save size={18}/> Save Record</> : <><Edit2 size={18}/> Edit Record</>}
                  </button>
                </>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-10 space-y-12 max-w-6xl mx-auto w-full sidebar-scrollbar">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Personal Information</h3>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <table className="w-full">
                     <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        <ProfileRow label="First Name" value={selectedStaff.firstName} field="firstName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="Surname" value={selectedStaff.lastName} field="lastName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="Nationality" value={selectedStaff.nationality} field="nationality" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        {selectedStaff.nationality !== 'Zimbabwean' && (
                          <ProfileRow label="Passport" value={selectedStaff.passportNumber} field="passportNumber" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        )}
                        <ProfileRow label="National ID" value={selectedStaff.nationalId || 'None'} field="nationalId" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="Date of Birth" value={selectedStaff.dob} field="dob" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="Home Address" value={selectedStaff.address} field="address" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                     </tbody>
                  </table>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Professional Assignment</h3>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <table className="w-full">
                     <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        <ProfileRow label="Job Position" value={selectedStaff.position} field="position" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={settings?.positions || []} />
                        <ProfileRow label="Assigned Areas" value={selectedStaff.assignedClasses} field="assignedClasses" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} multiple availableClasses={settings?.classes || []} />
                        <ProfileRow label="Work Email" value={selectedStaff.email} field="email" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="Phone Contact" value={selectedStaff.phone} field="phone" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="Registry ID" value={selectedStaff.id} field="id" isEditing={false} editForm={editForm} setEditForm={setEditForm} />
                     </tbody>
                  </table>
               </div>
             </div>
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[600] bg-white/98 dark:bg-slate-950/98 flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 backdrop-blur-md">
               <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-none border-4 border-rose-100 flex items-center justify-center mb-8 shadow-2xl"><Trash2 size={48}/></div>
               <h3 className="text-4xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Disable Staff Record?</h3>
               <p className="text-base text-slate-500 dark:text-slate-400 font-medium mt-4 max-w-md mx-auto leading-relaxed">This will permanently remove <b>{selectedStaff.fullName}</b> from the active registry and disable their terminal access. This action cannot be reversed.</p>
               <div className="flex gap-6 mt-12 w-full max-w-md">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 rounded-none font-black uppercase text-xs transition-all hover:bg-slate-200 active:scale-95">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 py-5 bg-rose-600 text-white rounded-none font-black uppercase text-xs shadow-xl shadow-rose-600/20 hover:bg-rose-700 active:scale-95 transition-all">Confirm Removal</button>
               </div>
            </div>
          )}
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsAdding(false)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl rounded-none overflow-hidden animate-in zoom-in-95 max-h-[90vh] overflow-y-auto sidebar-scrollbar border border-slate-200 dark:border-slate-800">
             <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10 shadow-sm">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-none text-blue-600">
                      <Plus size={24} />
                   </div>
                   <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Add New Staff</h3>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={28}/></button>
             </div>
             
             <form onSubmit={async (e) => {
               e.preventDefault();
               if (selectedClassesForAdd.length === 0) {
                 alert("Please select at least one class.");
                 return;
               }
               setIsSubmitting(true);
               try {
                 const formData = new FormData(e.currentTarget);
                 const data = Object.fromEntries(formData.entries()) as any;
                 const role = activeSubTab === 'administration' ? 'ADMIN_SUPPORT' : 'SPECIALIST';
                 await addStaff({ 
                   ...data, 
                   role, 
                   assignedClasses: selectedClassesForAdd, 
                   nationality: addFormNationality 
                 });
                 setIsAdding(false);
               } finally { setIsSubmitting(false); }
             }} className="p-10 space-y-12">
                
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-none border border-blue-100 dark:border-blue-800">01 Identification</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">First Name</label>
                      <input required name="firstName" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="Enter first name..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Surname</label>
                      <input required name="lastName" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="Enter surname..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Nationality</label>
                      <div className="relative">
                        <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <select 
                          required 
                          value={addFormNationality} 
                          onChange={e => setAddFormNationality(e.target.value)}
                          className="w-full pl-16 pr-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white appearance-none cursor-pointer shadow-inner"
                        >
                          <option value="Zimbabwean">Zimbabwean</option>
                          <option value="South African">South African</option>
                          <option value="Zambian">Zambian</option>
                          <option value="Malawian">Malawian</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    {addFormNationality !== 'Zimbabwean' ? (
                      <div className="space-y-2 animate-in slide-in-from-left duration-300">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Passport Number</label>
                        <div className="relative">
                          <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input required name="passportNumber" placeholder="Enter passport ID" className="w-full pl-16 pr-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">National ID</label>
                        <input name="nationalId" placeholder="63-XXXXXX-X-XX" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" />
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-none border border-blue-100 dark:border-blue-800">02 Contact Info</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Email Address</label>
                      <input required type="email" name="email" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" placeholder="name@motionmax.co.zw" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Phone Number</label>
                      <input required type="tel" name="phone" placeholder="+263..." className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-inner" />
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-none border border-blue-100 dark:border-blue-800">03 Job Details</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 ml-2">Functional Role</label>
                    <select name="position" className="w-full px-6 py-4 rounded-none bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 focus:border-blue-600 outline-none transition-all font-bold dark:text-white appearance-none cursor-pointer shadow-inner">
                      <option value="">Select a position...</option>
                      {(settings?.positions || []).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400">Assigned Classes</label>
                      <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-none border border-blue-100 dark:border-blue-800">
                        {selectedClassesForAdd.length} Selected
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-6 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-none shadow-inner">
                      {(settings?.classes || []).map(cls => {
                        const isSelected = selectedClassesForAdd.includes(cls);
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => {
                              if (isSelected) setSelectedClassesForAdd(selectedClassesForAdd.filter(c => c !== cls));
                              else setSelectedClassesForAdd([...selectedClassesForAdd, cls]);
                            }}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-none text-[10px] font-black uppercase tracking-tight transition-all border-2 ${
                              isSelected 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' 
                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-blue-200'
                            }`}
                          >
                            {isSelected ? <CheckCircle2 size={14} /> : <div className="w-3 h-3 rounded-full border-2 border-slate-200" />}
                            {cls}
                          </button>
                        );
                      })}
                      {(!settings?.classes || settings.classes.length === 0) && (
                        <div className="col-span-full py-8 text-center">
                          <AlertCircle size={32} className="mx-auto text-slate-200 mb-4" />
                          <p className="text-[10px] text-slate-400 italic uppercase tracking-widest font-black">No classes configured.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full py-6 bg-slate-900 dark:bg-blue-600 text-white rounded-none font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <>Complete Registration <ChevronRight size={20}/></>}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
