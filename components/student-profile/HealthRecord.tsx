
import React, { useState, useMemo } from 'react';
import { Student, MedicalRecordEntry } from '../../types';
import { useStore } from '../../store/useStore';
import { 
  FileText, Plus, Calendar, Download, 
  Trash2, Edit2, X, Loader2, Upload, Eye,
  Activity, ClipboardList
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
          staffName: user?.name || 'Staff Member',
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

  const triggerDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name || 'MedicalRecord.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('success', 'Fetching document...');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-10 animate-in fade-in duration-500 pb-20">
      {/* Navigation */}
      <aside className="lg:w-64 flex flex-col gap-2 shrink-0">
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
          <button 
            onClick={() => { setActiveSubTab('DIAGNOSIS'); resetForm(); }}
            className={`flex items-center justify-center lg:justify-start gap-3 p-3 lg:p-4 border-2 transition-all rounded-none ${activeSubTab === 'DIAGNOSIS' ? 'bg-blue-600 border-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white dark:bg-slate-900 border-slate-900 hover:bg-slate-50'}`}
          >
            <Activity size={18} />
            <span className="text-[10px] font-black uppercase tracking-tight">Diagnosis</span>
          </button>

          <button 
            onClick={() => { setActiveSubTab('OBSERVATION'); resetForm(); }}
            className={`flex items-center justify-center lg:justify-start gap-3 p-3 lg:p-4 border-2 transition-all rounded-none ${activeSubTab === 'OBSERVATION' ? 'bg-emerald-600 border-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white dark:bg-slate-900 border-slate-900 hover:bg-slate-50'}`}
          >
            <ClipboardList size={18} />
            <span className="text-[10px] font-black uppercase tracking-tight">Observations</span>
          </button>
        </div>
      </aside>

      {/* Main Feed */}
      <div className="flex-1 space-y-4 md:space-y-6">
        <header className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
           <div>
              <h3 className="text-lg md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">
                {activeSubTab === 'DIAGNOSIS' ? 'Registry' : 'Field Notes'}
              </h3>
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">Active records for {student.firstName}</p>
           </div>
           {canManage && !isAdding && (
             <button 
               onClick={() => setIsAdding(true)}
               className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0.5 active:shadow-none"
             >
                <Plus size={14} /> New Entry
             </button>
           )}
        </header>

        {isAdding ? (
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 p-5 md:p-8 space-y-5 animate-in slide-in-from-top-2 duration-300 rounded-none shadow-lg">
             <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-600">Document Node</h4>
                <button onClick={resetForm} className="p-1 text-slate-400"><X size={20}/></button>
             </div>
             
             <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Body Text</label>
                <textarea 
                  value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})}
                  rows={5}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-900 rounded-none text-sm font-bold outline-none focus:border-blue-600 dark:text-white"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Attach PDF</label>
                <div className="relative group">
                   <input type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                   <div className="w-full p-5 border-2 border-dashed border-slate-400 dark:border-slate-700 flex items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950 group-hover:border-blue-500 rounded-none transition-colors">
                      <Upload size={16} className="text-blue-600" />
                      <p className="text-[9px] font-black uppercase text-slate-900 dark:text-white truncate">{form.pdfName || 'Select PDF file...'}</p>
                   </div>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={handleSave} disabled={isSaving || !form.content} className="flex-1 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-md hover:bg-blue-600 disabled:opacity-50">
                   {isSaving ? <Loader2 className="animate-spin mx-auto" size={16} /> : (editingId ? 'Push Update' : 'Finalize Entry')}
                </button>
                <button onClick={resetForm} className="py-4 px-6 text-[10px] font-black uppercase text-slate-400">Cancel</button>
             </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-none opacity-40">
                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic">Node database empty</p>
              </div>
            ) : history.map((entry) => (
              <div key={entry.id} className="bg-white dark:bg-slate-900 border-2 border-slate-900 p-5 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none relative">
                 <header className="flex items-center justify-between mb-4 border-b border-slate-50 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                       <Calendar size={14} className="text-blue-600" />
                       <div>
                          <p className="text-[11px] font-black dark:text-white uppercase leading-none">{new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</p>
                          <p className="text-[7px] font-black uppercase text-slate-400 mt-1">Staff: {entry.staffName}</p>
                       </div>
                    </div>
                    {canManage && (
                      <button onClick={() => openEdit(entry)} className="p-1.5 text-slate-300 hover:text-blue-600">
                        <Edit2 size={16} />
                      </button>
                    )}
                 </header>

                 <div className="space-y-4">
                    <p className="text-xs md:text-sm font-bold leading-relaxed text-slate-800 dark:text-slate-200">
                      {entry.content}
                    </p>
                    
                    {entry.pdfUrl && (
                      <button 
                        onClick={() => triggerDownload(entry.pdfUrl!, entry.pdfName!)}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-900 hover:border-blue-600 rounded-none text-left transition-colors"
                      >
                         <div className="flex items-center gap-2.5 overflow-hidden">
                            <FileText size={16} className="text-blue-600 shrink-0"/>
                            <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase truncate">{entry.pdfName || 'Record.pdf'}</p>
                         </div>
                         <div className="flex items-center gap-1.5 text-blue-600 font-black text-[8px] uppercase tracking-widest shrink-0 ml-2">
                            <span>Read</span>
                            <Download size={12} />
                         </div>
                      </button>
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
