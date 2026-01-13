
import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  ArrowLeft,
  Filter,
  Check,
  Briefcase,
  User,
  ShieldCheck,
  Globe,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { Staff } from '../types';
import { RegisterStaffModal } from './admin/RegisterStaffModal';

const STAFF_COLORS = [
  { bg: 'bg-blue-600', row: 'bg-blue-50', text: 'text-white', border: 'border-blue-900', accent: 'border-blue-600', dark: 'dark:bg-blue-900/40' },
  { bg: 'bg-emerald-600', row: 'bg-emerald-50', text: 'text-white', border: 'border-emerald-900', accent: 'border-emerald-600', dark: 'dark:bg-emerald-900/40' },
  { bg: 'bg-rose-600', row: 'bg-rose-50', text: 'text-white', border: 'border-rose-900', accent: 'border-rose-600', dark: 'dark:bg-rose-900/40' },
  { bg: 'bg-amber-600', row: 'bg-amber-50', text: 'text-white', border: 'border-amber-900', accent: 'border-amber-600', dark: 'dark:bg-amber-900/40' },
  { bg: 'bg-purple-600', row: 'bg-purple-50', text: 'text-white', border: 'border-purple-900', accent: 'border-purple-600', dark: 'dark:bg-purple-900/40' },
  { bg: 'bg-cyan-600', row: 'bg-cyan-50', text: 'text-white', border: 'border-cyan-900', accent: 'border-cyan-600', dark: 'dark:bg-cyan-900/40' },
];

const getStaffColor = (id: string) => {
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % STAFF_COLORS.length;
  return STAFF_COLORS[index];
};

const ProfileRow = ({ label, value, field, isEditing, editForm, setEditForm, options, multiple, availableClasses }: any) => (
  <tr className="border-b border-slate-100 dark:border-slate-800/50 group/row">
    <td className="py-4 px-2 w-1/3 text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-400 group-hover/row:text-emerald-600 transition-colors">{label}</td>
    <td className="py-4 px-2">
      {isEditing && field ? (
        multiple && availableClasses ? (
          <div className="flex flex-wrap gap-2">
            {availableClasses.map((cls: string) => (
              <label key={cls} className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-none cursor-pointer hover:border-emerald-500 transition-all select-none">
                <input 
                  type="checkbox"
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  checked={(editForm.assignedClasses || []).includes(cls)}
                  onChange={e => {
                    const current = editForm.assignedClasses || [];
                    const next = e.target.checked ? [...current, cls] : current.filter((c: string) => c !== cls);
                    setEditForm({ ...editForm, assignedClasses: next });
                  }}
                />
                <span className="text-[10px] font-black uppercase tracking-tight">{cls}</span>
              </label>
            ))}
          </div>
        ) : options ? (
          <select 
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-none text-sm font-bold outline-none focus:border-emerald-600"
            value={(editForm as any)[field] || ''}
            onChange={e => setEditForm({...editForm, [field]: e.target.value})}
          >
            <option value="">Choose...</option>
            {options.map((opt: any) => <option key={opt.name || opt} value={opt.name || opt}>{opt.name || opt}</option>)}
          </select>
        ) : (
          <input 
            type="text"
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-none text-sm font-bold outline-none focus:border-emerald-600"
            value={(editForm as any)[field] || ''}
            onChange={e => setEditForm({...editForm, [field]: e.target.value})}
          />
        )
      ) : (
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {Array.isArray(value) ? value.join(', ') : (value || 'None')}
        </span>
      )}
    </td>
  </tr>
);

export const StaffManagement: React.FC = () => {
  const { staff, updateStaff, deleteStaff, settings, user, isStaffRegistrationOpen, setStaffRegistrationOpen } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtering States
  const [selectedRole, setSelectedRole] = useState('All Jobs');
  const [selectedClass, setSelectedClass] = useState('All Classrooms');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Staff>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const roleRef = useRef<HTMLDivElement>(null);
  const classRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const availableClasses = settings?.classes || [];

  const filteredStaff = (staff || []).filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All Jobs' || s.position === selectedRole;
    const matchesClass = selectedClass === 'All Classrooms' || (s.assignedClasses || []).includes(selectedClass);
    return matchesSearch && matchesRole && matchesClass;
  });

  const uniqueRoles = useMemo(() => {
    return Array.from(new Set(staff.map(s => s.position)));
  }, [staff]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) setShowRoleDropdown(false);
      if (classRef.current && !classRef.current.contains(event.target as Node)) setShowClassDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveEdit = async () => {
    if (!selectedStaff) return;
    try {
      await updateStaff(selectedStaff.id, editForm);
      setSelectedStaff({ ...selectedStaff, ...editForm });
      setIsEditing(false);
    } catch(e) {}
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    setIsDeleting(true);
    try {
      await deleteStaff(selectedStaff.id);
      setSelectedStaff(null);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto px-4 md:px-0">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 border-b border-slate-200 pb-6 md:pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-slate-950 dark:text-white leading-none tracking-tight">Staff Registry</h1>
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mt-2 md:mt-3 tracking-widest italic">Monitoring school personnel & specialists</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setStaffRegistrationOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-none text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} />
            Add New Member
          </button>
        )}
      </header>

      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        {/* Search Box */}
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by full name..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 bg-white dark:bg-slate-900 rounded-none text-sm font-bold border border-slate-900 outline-none focus:border-emerald-600 transition-all shadow-sm" 
          />
        </div>

        {/* Filter by Job */}
        <div className="relative" ref={roleRef}>
          <button 
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center justify-between gap-6 px-6 py-3 md:py-4 bg-white dark:bg-slate-900 border border-slate-900 rounded-none text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors w-full md:w-56"
          >
            <div className="flex items-center gap-3">
              <Briefcase size={16} className="text-slate-400" />
              <span className="truncate">{selectedRole}</span>
            </div>
            <ChevronRight size={16} className={`text-slate-400 transition-transform duration-300 ${showRoleDropdown ? 'rotate-90' : 'rotate-0'}`} />
          </button>

          {showRoleDropdown && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] p-1 animate-in fade-in zoom-in-95 duration-200 origin-top">
              <div className="max-h-64 overflow-y-auto no-scrollbar py-1">
                <button 
                  onClick={() => { setSelectedRole('All Jobs'); setShowRoleDropdown(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase transition-colors hover:bg-emerald-600 hover:text-white rounded-none ${selectedRole === 'All Jobs' ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  All Jobs
                  {selectedRole === 'All Jobs' && <Check size={14} />}
                </button>
                {uniqueRoles.map(role => (
                  <button 
                    key={role}
                    onClick={() => { setSelectedRole(role); setShowRoleDropdown(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase transition-colors hover:bg-emerald-600 hover:text-white rounded-none ${selectedRole === role ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    {role}
                    {selectedRole === role && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter by Classroom */}
        <div className="relative" ref={classRef}>
          <button 
            onClick={() => setShowClassDropdown(!showClassDropdown)}
            className="flex items-center justify-between gap-6 px-6 py-3 md:py-4 bg-white dark:bg-slate-900 border border-slate-900 rounded-none text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors w-full md:w-56"
          >
            <div className="flex items-center gap-3">
              <User size={16} className="text-slate-400" />
              <span className="truncate">{selectedClass}</span>
            </div>
            <ChevronRight size={16} className={`text-slate-400 transition-transform duration-300 ${showClassDropdown ? 'rotate-90' : 'rotate-0'}`} />
          </button>

          {showClassDropdown && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] p-1 animate-in fade-in zoom-in-95 duration-200 origin-top">
              <div className="max-h-64 overflow-y-auto no-scrollbar py-1">
                <button 
                  onClick={() => { setSelectedClass('All Classrooms'); setShowClassDropdown(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase transition-colors hover:bg-emerald-600 hover:text-white rounded-none ${selectedClass === 'All Classrooms' ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  All Classrooms
                  {selectedClass === 'All Classrooms' && <Check size={14} />}
                </button>
                {settings.classes.map(cls => (
                  <button 
                    key={cls}
                    onClick={() => { setSelectedClass(cls); setShowClassDropdown(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase transition-colors hover:bg-emerald-600 hover:text-white rounded-none ${selectedClass === cls ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    {cls}
                    {selectedClass === cls && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-none flex gap-1 border border-slate-900 h-fit w-fit self-center md:self-auto">
          <button onClick={() => setViewMode('table')} className={`p-2 md:p-2.5 rounded-none transition-all ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><List size={20} /></button>
          <button onClick={() => setViewMode('cards')} className={`p-2 md:p-2.5 rounded-none transition-all ${viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}><LayoutGrid size={20} /></button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-900 rounded-none overflow-hidden shadow-sm">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left table-auto min-w-[600px] md:min-w-0">
              <thead className="bg-slate-900 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b border-slate-900">
                <tr><th className="px-6 md:px-10 py-5 md:py-6">Staff Member</th><th className="px-4 py-6 text-center">Work Role</th><th className="px-4 py-6 hidden md:table-cell">Assigned Areas</th><th className="px-6 md:px-10 py-6 text-right">View</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-20 text-center text-xs font-black uppercase text-slate-300 italic tracking-widest">No matching staff members found</td>
                  </tr>
                ) : filteredStaff.map(s => {
                  const color = getStaffColor(s.id);
                  return (
                    <tr key={s.id} className={`${color.row} ${color.dark} hover:brightness-95 cursor-pointer transition-all border-l-[6px] md:border-l-[12px] ${color.accent}`} onClick={() => { setSelectedStaff(s); setEditForm(s); setIsEditing(false); }}>
                      <td className="px-6 md:px-10 py-4 md:py-6 flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white border border-slate-900 overflow-hidden flex items-center justify-center font-black text-[10px] md:text-xs uppercase text-slate-900 rounded-none flex-shrink-0 shadow-sm">
                          {s.imageUrl ? <img src={s.imageUrl} className="w-full h-full object-cover" alt={s.fullName} /> : s.fullName[0]}
                        </div>
                        <span className="font-black text-xs md:text-sm uppercase text-slate-900 dark:text-white truncate">{s.fullName}</span>
                      </td>
                      <td className="px-4 py-6 text-center">
                         <span className="px-3 py-1 bg-slate-950 text-white text-[8px] font-black uppercase tracking-widest">{s.position}</span>
                      </td>
                      <td className="px-4 py-6 text-[9px] md:text-[10px] font-black uppercase text-slate-900 dark:text-slate-100 hidden md:table-cell">{(s.assignedClasses || []).join(', ') || 'School Wide'}</td>
                      <td className="px-6 md:px-10 py-6 text-right"><ChevronRight size={18} className="inline text-slate-900 dark:text-white" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredStaff.map(s => {
              const color = getStaffColor(s.id);
              return (
                <div key={s.id} className={`${color.bg} border-2 border-slate-900 hover:scale-[1.02] md:hover:scale-105 rounded-none p-6 md:p-8 transition-all cursor-pointer group shadow-lg active:translate-y-0.5 relative overflow-hidden`} onClick={() => { setSelectedStaff(s); setEditForm(s); setIsEditing(false); }}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -translate-y-12 translate-x-12 rotate-45 group-hover:bg-white/20 transition-all"></div>
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white border border-slate-900 mb-4 md:mb-6 flex items-center justify-center font-black text-3xl md:text-4xl text-slate-900 uppercase rounded-none shadow-lg overflow-hidden group-hover:rotate-3 transition-transform">
                    {s.imageUrl ? <img src={s.imageUrl} className="w-full h-full object-cover" alt={s.fullName} /> : s.fullName[0]}
                  </div>
                  <h3 className="font-black text-lg md:text-xl uppercase text-white leading-none mb-1 md:mb-2 tracking-tighter truncate">{s.fullName}</h3>
                  <p className="text-[9px] md:text-[10px] font-black text-white/70 uppercase tracking-widest">{s.position}</p>
                  <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/20 flex items-center justify-between">
                    <span className="text-[8px] md:text-[9px] font-mono text-white/50 font-bold uppercase">ID: {s.id.substring(0,8).toUpperCase()}</span>
                    <ChevronRight size={18} className="text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedStaff && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-[9999] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
          <header className="p-4 md:p-6 lg:px-10 border-b border-slate-900 flex items-center justify-between bg-white dark:bg-slate-900 z-50">
            <div className="flex items-center gap-4 min-w-0">
              <button 
                onClick={() => setSelectedStaff(null)} 
                className="p-2 md:p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-900 text-slate-500 hover:text-black dark:hover:text-white transition-all active:scale-90 flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Close Profile</span>
              </button>
              
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white flex items-center justify-center font-black text-lg text-slate-900 border border-slate-900 shadow-md overflow-hidden shrink-0">
                {selectedStaff.imageUrl ? <img src={selectedStaff.imageUrl} className="w-full h-full object-cover" alt="" /> : selectedStaff.fullName[0]}
              </div>
              
              <div className="min-w-0">
                <h2 className="text-base md:text-lg font-black uppercase text-slate-950 dark:text-white leading-none truncate">{selectedStaff.fullName}</h2>
                <p className="text-[8px] font-mono font-bold text-emerald-600 mt-1 uppercase tracking-widest">STAFF ID: {selectedStaff.id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isAdmin && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowDeleteModal(true)} 
                    disabled={isDeleting}
                    className="p-2 md:px-4 md:py-2.5 bg-rose-600 text-white rounded-none text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 border border-slate-900 shadow-sm"
                  >
                    <Trash2 size={14} />
                    <span className="hidden lg:inline">Erase Member</span>
                  </button>
                  <button 
                    onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)} 
                    className={`px-4 py-2.5 rounded-none border border-slate-900 transition-all text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2 ${isEditing ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white hover:bg-black'}`}
                  >
                    {isEditing ? <Save size={14}/> : <Edit2 size={14}/>}
                    <span>{isEditing ? (window.innerWidth < 768 ? 'Save' : 'Update Profile') : 'Modify Details'}</span>
                  </button>
                </div>
              )}
              <button onClick={() => setSelectedStaff(null)} className="p-2 text-slate-400 hover:text-black dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-16 sidebar-scrollbar bg-slate-50/30 dark:bg-slate-950/30">
             <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
                <div className="space-y-10">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600 border-b border-slate-100 dark:border-slate-800 pb-2">Member Identity</h3>
                   <table className="w-full">
                      <tbody>
                         <ProfileRow label="First Name" value={selectedStaff.firstName} field="firstName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                         <ProfileRow label="Surname" value={selectedStaff.lastName} field="lastName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                         <ProfileRow label="Photo Link" value={selectedStaff.imageUrl} field="imageUrl" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                         <ProfileRow label="Nationality" value={selectedStaff.nationality} field="nationality" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={['Zimbabwean', 'South African', 'Zambian', 'Malawian', 'Other']} />
                         <ProfileRow label="Birth Date" value={selectedStaff.dob} field="dob" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                         <ProfileRow label="Where they live" value={selectedStaff.address} field="address" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                      </tbody>
                   </table>
                </div>
                <div className="space-y-10">
                   <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600 border-b border-slate-100 dark:border-slate-800 pb-2">Work Assignment</h3>
                   <table className="w-full">
                      <tbody>
                         <ProfileRow label="Job Title" value={selectedStaff.position} field="position" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={settings.positions.filter(p => p.active)} />
                         <ProfileRow label="Classrooms" value={selectedStaff.assignedClasses} field="assignedClasses" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} multiple availableClasses={availableClasses} />
                         <ProfileRow label="Email Address" value={selectedStaff.email} field="email" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                         <ProfileRow label="Phone Number" value={selectedStaff.phone} field="phone" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                         <ProfileRow label="Access Mode" value={selectedStaff.role} field="role" isEditing={false} editForm={editForm} setEditForm={setEditForm} />
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>
      )}

      <RegisterStaffModal isOpen={isStaffRegistrationOpen} onClose={() => setStaffRegistrationOpen(false)} />

      {showDeleteModal && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-slate-950/80">
           <div className="bg-white dark:bg-slate-900 w-full max-w-md border-2 border-slate-900 rounded-none overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
              <div className="p-8 text-center space-y-6">
                 <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-600 mx-auto flex items-center justify-center border-2 border-rose-100 dark:border-rose-800 rounded-none shadow-inner">
                    <Trash2 size={48} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white">Delete Profile?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">
                      This will permanently remove <b>{selectedStaff?.fullName}</b> from the school registry.
                    </p>
                 </div>
                 <div className="flex flex-col gap-3 pt-4">
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full py-4 bg-rose-600 text-white font-black uppercase tracking-widest text-[11px] shadow-lg hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 className="animate-spin" size={18}/> : <><Trash2 size={18}/> Yes, Delete Record</>}
                    </button>
                    <button 
                      onClick={() => setShowDeleteModal(false)}
                      className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[11px] border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
                    >
                      Go Back
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
