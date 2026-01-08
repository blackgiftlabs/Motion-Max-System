
import React, { useState, useEffect } from 'react';
import { useStore, MilestoneTemplate } from '../store/useStore';
import { 
  Save, 
  Plus, 
  Trash2, 
  DollarSign, 
  ShieldCheck, 
  Loader2, 
  Briefcase, 
  User, 
  X,
  School,
  ClipboardCheck,
  FilePlus,
  Database,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Settings as SettingsIcon,
  Info,
  BookOpen,
  CreditCard,
  Building
} from 'lucide-react';

type SettingsTab = 'checklists' | 'fees' | 'school' | 'profile';

export const SystemSettings: React.FC = () => {
  const { settings, updateSettings, updateUserProfile, user, milestoneTemplates, saveMilestoneTemplate, deleteMilestoneTemplate } = useStore();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('checklists');
  const [isSaving, setIsSaving] = useState(false);
  
  const [fees, setFees] = useState(settings?.feesAmount || 500);
  const [term, setTerm] = useState(settings?.currentTerm || 'Term 1');
  const [positions, setPositions] = useState(settings?.positions || []);
  const [classes, setClasses] = useState(settings?.classes || []);
  const [newPosition, setNewPosition] = useState('');
  const [newClassName, setNewClassName] = useState('');

  const [newName, setNewName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState<MilestoneTemplate | null>(null);
  const [isTemplateSaving, setIsTemplateSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await updateSettings({ feesAmount: fees, currentTerm: term, positions, classes });
    setIsSaving(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    await updateUserProfile({ 
      name: newName !== user?.name ? newName : undefined, 
      password: newPassword ? newPassword : undefined 
    });
    setNewPassword('');
    setProfileSaving(false);
  };

  const saveTemplate = async () => {
    if (!editingTemplate) return;
    setIsTemplateSaving(true);
    await saveMilestoneTemplate(editingTemplate);
    setIsTemplateSaving(false);
    setEditingTemplate(null);
  };

  const addTemplate = () => {
    // Fix: Added missing minAge and maxAge properties required by MilestoneTemplate interface
    setEditingTemplate({
      id: `m-${Date.now()}`,
      label: 'New Category',
      minAge: 0,
      maxAge: 36,
      sections: [{ title: 'Area of Growth', items: ['New Task Item'] }],
      redFlags: ['Warning sign to watch']
    });
  };

  if (editingTemplate) {
    return (
      <div className="fixed inset-0 z-[500] bg-slate-50 dark:bg-slate-950 flex flex-col animate-in fade-in duration-300">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-20">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setEditingTemplate(null)} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Edit Checklist</h1>
                <p className="text-[11px] text-slate-500 uppercase font-medium">{editingTemplate.label || 'New Entry'}</p>
              </div>
            </div>
            <button 
              onClick={saveTemplate}
              disabled={isTemplateSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isTemplateSaving ? <Loader2 className="animate-spin" size={14} /> : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <label className="text-xs font-bold text-slate-500 mb-2 block">Checklist Name</label>
              <input 
                value={editingTemplate.label}
                onChange={e => setEditingTemplate({...editingTemplate, label: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-bold dark:text-white outline-none focus:border-blue-500"
                placeholder="e.g. 12 to 24 Months"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-300 px-1">Goal Areas</h3>
              {editingTemplate.sections.map((section, sIdx) => (
                <div key={sIdx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm space-y-4">
                  <div className="flex gap-2">
                    <input 
                      placeholder="Goal Area Title (e.g. Movement)" 
                      value={section.title}
                      onChange={e => {
                        const next = [...editingTemplate.sections];
                        next[sIdx].title = e.target.value;
                        setEditingTemplate({...editingTemplate, sections: next});
                      }}
                      className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-sm outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={() => {
                        const next = editingTemplate.sections.filter((_, i) => i !== sIdx);
                        setEditingTemplate({...editingTemplate, sections: next});
                      }} 
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {section.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex gap-2 group">
                        <input 
                          value={item}
                          onChange={e => {
                            const next = [...editingTemplate.sections];
                            next[sIdx].items[iIdx] = e.target.value;
                            setEditingTemplate({...editingTemplate, sections: next});
                          }}
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-sm dark:text-white outline-none focus:border-blue-400"
                        />
                        <button 
                          onClick={() => {
                            const next = [...editingTemplate.sections];
                            next[sIdx].items = next[sIdx].items.filter((_, i) => i !== iIdx);
                            setEditingTemplate({...editingTemplate, sections: next});
                          }} 
                          className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"
                        >
                          <X size={16}/>
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const next = [...editingTemplate.sections];
                        next[sIdx].items.push('New Skill Item');
                        setEditingTemplate({...editingTemplate, sections: next});
                      }} 
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-2"
                    >
                      <Plus size={14} /> Add Skill
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setEditingTemplate({...editingTemplate, sections: [...editingTemplate.sections, { title: '', items: [] }]})} 
                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-blue-500 hover:border-blue-500 transition-all"
              >
                + Add Goal Area
              </button>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-6 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle size={18}/> Red Flags (Alerts)
              </h3>
              <div className="space-y-2">
                {editingTemplate.redFlags.map((flag, fIdx) => (
                  <div key={fIdx} className="flex gap-2">
                    <input 
                      value={flag}
                      onChange={e => {
                        const next = [...editingTemplate.redFlags];
                        next[fIdx] = e.target.value;
                        setEditingTemplate({...editingTemplate, redFlags: next});
                      }}
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-800 rounded-md text-sm text-rose-900 dark:text-rose-200 outline-none focus:border-rose-500"
                    />
                    <button 
                      onClick={() => setEditingTemplate({...editingTemplate, redFlags: editingTemplate.redFlags.filter((_,i)=>i!==fIdx)})} 
                      className="p-1.5 text-rose-300 hover:text-rose-600"
                    >
                      <X size={16}/>
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setEditingTemplate({...editingTemplate, redFlags: [...editingTemplate.redFlags, 'New Alert Item']})} 
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Red Flag
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage school data, fees, and your profile.</p>
      </header>

      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
         {[
           { id: 'checklists', label: 'Checklists', icon: <BookOpen size={16}/> },
           { id: 'fees', label: 'Fees', icon: <CreditCard size={16}/> },
           { id: 'school', label: 'School Info', icon: <Building size={16}/> },
           { id: 'profile', label: 'My Profile', icon: <User size={16}/> }
         ].map(tab => (
           <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700'}`}
           >
             {tab.icon} {tab.label}
           </button>
         ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        {activeTab === 'checklists' && (
          <div className="p-6 space-y-6 animate-in fade-in">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Milestone Checklists</h3>
                  <p className="text-xs text-slate-500">Templates used for tracking student progress.</p>
                </div>
                <button 
                  onClick={addTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> New Checklist
                </button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {milestoneTemplates.length === 0 ? (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                     <p className="text-xs text-slate-400 font-medium">No checklists found.</p>
                  </div>
                ) : milestoneTemplates.map(template => (
                  <div key={template.id} className="group bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl hover:border-blue-500 transition-all cursor-pointer relative" onClick={() => setEditingTemplate(template)}>
                     <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800">
                           <ClipboardCheck size={20} />
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); if(window.confirm("Delete this record?")) deleteMilestoneTemplate(template.id); }} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                     </div>
                     <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{template.label}</h4>
                     <div className="flex gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>{template.sections.length} Areas</span>
                        <span>{template.redFlags.length} Flags</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="p-8 max-w-xl animate-in fade-in">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Fee Settings</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Tuition Amount ($ USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="number" value={fees} onChange={e => setFees(Number(e.target.value))} className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-lg font-bold outline-none dark:text-white focus:border-blue-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Current Term Name</label>
                <input type="text" value={term} onChange={e => setTerm(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-lg font-bold outline-none dark:text-white focus:border-blue-500" />
              </div>
            </div>
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
               <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Changes here will apply to all student accounts immediately.</p>
            </div>
          </div>
        )}

        {activeTab === 'school' && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Briefcase size={18}/> Staff Positions</h3>
              <div className="flex gap-2">
                <input type="text" value={newPosition} onChange={e => setNewPosition(e.target.value)} placeholder="New role..." className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium outline-none focus:border-blue-500" />
                <button onClick={() => { if(newPosition && !positions.includes(newPosition)) setPositions([...positions, newPosition]); setNewPosition(''); }} className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={20} /></button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {positions.map(pos => (
                  <div key={pos} className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                     <span className="text-xs font-medium">{pos}</span>
                     <button onClick={() => setPositions(positions.filter(p => p !== pos))} className="text-slate-300 hover:text-rose-500"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><School size={18}/> Available Classes</h3>
              <div className="flex gap-2">
                <input type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="New class..." className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium outline-none focus:border-blue-500" />
                <button onClick={() => { if(newClassName && !classes.includes(newClassName)) setClasses([...classes, newClassName]); setNewClassName(''); }} className="p-2 bg-blue-600 text-white rounded-lg"><Plus size={20} /></button>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {classes.map(c => (
                  <div key={c} className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                     <span className="text-xs font-medium">{c}</span>
                     <button onClick={() => setClasses(classes.filter(cl => cl !== c))} className="text-slate-300 hover:text-rose-500"><X size={14}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-8 max-w-xl mx-auto animate-in fade-in">
            <form onSubmit={handleUpdateProfile} className="space-y-8">
              <div className="flex flex-col items-center">
                 <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold mb-4 shadow-lg uppercase">
                    {user?.name?.[0]}
                 </div>
                 <h3 className="text-xl font-bold dark:text-white">{user?.name}</h3>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{user?.role.replace('_', ' ')} Account</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Display Name</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold dark:text-white outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Update Password (Optional)</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold dark:text-white outline-none focus:border-blue-500" />
                </div>
                <button type="submit" disabled={profileSaving} className="w-full py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
                  {profileSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Update My Profile</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between">
         <div className="flex items-center gap-2 text-slate-500">
            <Info size={18} className="text-blue-500" />
            <p className="text-xs font-medium">Click save to apply all changes across the school system.</p>
         </div>
         <button 
           onClick={handleSaveSettings}
           disabled={isSaving}
           className="px-8 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
         >
           {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save System Settings</>}
         </button>
      </div>
    </div>
  );
};
