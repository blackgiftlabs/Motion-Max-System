
import React, { useState, useMemo } from 'react';
import { Student, MedicalRecordEntry } from '../../types';
import { useStore } from '../../store/useStore';
import { 
  FileText, Plus, Search, Calendar, User, Download, 
  Trash2, Edit2, CheckCircle2, X, Loader2, Upload, Eye,
  Activity, ClipboardList, Info
} from 'lucide-react';

interface Props {
  student: Student;
  isEditing: boolean;
  editForm: Partial<Student>;
  setEditForm: (form: Partial<Student>) => void;
  onViewPdf: (url: string) => void;
  onUploadPdf: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const HealthRecord: React.FC<Props> = ({ student }) => {
  const { user, addHealthRecordEntry, updateHealthRecordEntry, notify } = useStore();
  const [activeSubTab, setActiveSubTab] = useState<'DIAGNOSIS' | 'OBSERVATION'>('DIAGNOSIS');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    content: '',
    pdfUrl: '',
    pdfName: ''
  });

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isSpecialist = user?.role === 'SPECIALIST';
  const canManage = isAdmin || (isSpecialist && activeSubTab === 'OBSERVATION');

  const history = useMemo(() => {
    return (student.healthHistory || [])
      .filter(h => h.type === activeSubTab)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [student.healthHistory, activeSubTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, pdfUrl: reader.result as string, pdfName: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setForm({ content: '', pdfUrl: '', pdfName: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.content || !student.firebaseUid) return;
    setIsSaving(true);
    try {
      if (editingId) {
        await updateHealthRecordEntry(student.firebaseUid, editingId, {
          content: form.content,
          pdfUrl: form.pdfUrl,
          pdfName: form.pdfName
        });
      } else {
        await addHealthRecordEntry(student.firebaseUid, {
          date: new Date().toISOString(),
          type: activeSubTab,
          content: form.content,
          staffId: user?.id || 'system',
          staffName: user?.name || 'Admin',
          pdfUrl: form.pdfUrl,
          pdfName: form.pdfName
        });
      }
      resetForm();
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (entry: MedicalRecordEntry) => {
    setForm({ content: entry.content, pdfUrl: entry.pdfUrl || '', pdfName: entry.pdfName || '' });
    setEditingId(entry.id);
    setIsAdding(true);
  };

  const downloadFile = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name || 'MedicalRecord.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* Left Navigation Buttons */}
      <aside className="lg:w-72 flex flex-col gap-3">
        <button 
          onClick={() => { setActiveSubTab('DIAGNOSIS'); resetForm(); }}
          className={`flex items-center gap-4 p-6 border-2 transition-all text-left group ${activeSubTab === 'DIAGNOSIS' ? 'bg-blue-600 border-slate-900 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500'}`}
        >
          <div className={`p-2 rounded-lg ${activeSubTab === 'DIAGNOSIS' ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
             <Activity size={24} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${activeSubTab === 'DIAGNOSIS' ? 'text-blue-100' : 'text-slate-400'}`}>Category</p>
            <p className="text-sm font-black uppercase tracking-tight">Professional Diagnosis</p>
          </div>
        </button>

        <button 
          onClick={() => { setActiveSubTab('OBSERVATION'); resetForm(); }}
          className={`flex items-center gap-4 p-6 border-2 transition-all text-left group ${activeSubTab === 'OBSERVATION' ? 'bg-emerald-600 border-slate-900 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500'}`}
        >
          <div className={`p-2 rounded-lg ${activeSubTab === 'OBSERVATION' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
             <ClipboardList size={24} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${activeSubTab === 'OBSERVATION' ? 'text-emerald-100' : 'text-slate-400'}`}>Category</p>
            <p className="text-sm font-black uppercase tracking-tight">Teacher Observations</p>
          </div>
        </button>

        <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
           <div className="flex items-center gap-2 mb-3 text-slate-500">
              <Info size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Medical Note</span>
           </div>
           <p className="text-[11px] font-medium leading-relaxed italic text-slate-500 dark:text-slate-400">
             Sensitive clinical data is encrypted and only visible to authorized personnel and guardians.
           </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        <header className="flex items-center justify-between pb-4 border-b-2 border-slate-100 dark:border-slate-800">
           <div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                {activeSubTab === 'DIAGNOSIS' ? 'Diagnosis Records' : 'Observation History'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Viewing timeline for {student.fullName}</p>
           </div>
           {canManage && !isAdding && (
             <button 
               onClick={() => setIsAdding(true)}
               className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 shadow-xl transition-all active:scale-95"
             >
                <Plus size={16} /> New Entry
             </button>
           )}
        </header>

        {isAdding ? (
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
             <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Entry Workspace</h4>
                <button onClick={resetForm} className="p-2 text-slate-400 hover:text-black transition-colors"><X size={20}/></button>
             </div>
             
             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Detail Content</label>
                <textarea 
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                  rows={6}
                  placeholder="Type the record details here..."
                  className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-none text-sm font-bold outline-none focus:border-blue-600 transition-all dark:text-white"
                />
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Attached PDF Record (Optional)</label>
                <div className="relative group">
                   <input 
                     type="file" 
                     accept="application/pdf"
                     onChange={handleFileChange}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                   />
                   <div className="w-full p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950 group-hover:border-blue-500 transition-all">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm"><Upload size={20} className="text-blue-600" /></div>
                      <div>
                         <p className="text-[11px] font-black uppercase text-slate-900 dark:text-white">{form.pdfName || 'Click to upload PDF document'}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">MAX SIZE: 5MB</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleSave}
                  disabled={isSaving || !form.content}
                  className="flex-1 py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
                >
                   {isSaving ? <Loader2 className="animate-spin mx-auto" size={18} /> : (editingId ? 'Update Entry' : 'Save New Record')}
                </button>
                <button onClick={resetForm} className="px-8 py-4 text-[11px] font-black uppercase text-slate-400 hover:text-black">Discard</button>
             </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="py-32 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl opacity-50 bg-slate-50/50">
                 <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">No history found in this category.</p>
              </div>
            ) : history.map((entry, idx) => (
              <div key={entry.id} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-8 shadow-sm hover:border-slate-300 transition-all group relative animate-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 100}ms` }}>
                 <header className="flex items-center justify-between mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-4">
                       <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400"><Calendar size={16} /></div>
                       <div>
                          <p className="text-sm font-black dark:text-white leading-none">{new Date(entry.date).toLocaleDateString()}</p>
                          <p className="text-[9px] font-black uppercase text-blue-600 mt-1 tracking-widest">Added by {entry.staffName}</p>
                       </div>
                    </div>
                    {canManage && (
                      <button onClick={() => openEdit(entry)} className="p-2 text-slate-200 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                        <Edit2 size={16} />
                      </button>
                    )}
                 </header>

                 <div className="space-y-6">
                    <p className="text-sm font-medium leading-relaxed italic text-slate-700 dark:text-slate-300 border-l-4 border-slate-100 dark:border-slate-800 pl-6 py-2">
                       "{entry.content}"
                    </p>
                    
                    {entry.pdfUrl && (
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                         <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><FileText size={16}/></div>
                            <div>
                               <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[200px]">{entry.pdfName || 'Diagnostic_Record.pdf'}</p>
                               <p className="text-[8px] font-bold text-slate-400 uppercase">Secure PDF Attachment</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button 
                              onClick={() => notify('info', 'Opening preview...', 2000)}
                              className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="View Preview"
                            >
                               <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => downloadFile(entry.pdfUrl!, entry.pdfName!)}
                              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-blue-600 rounded-lg shadow-sm transition-all"
                            >
                               <Download size={18} />
                            </button>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
