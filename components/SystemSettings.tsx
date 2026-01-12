
import React, { useState, useEffect } from 'react';
import { useStore, MilestoneTemplate } from '../store/useStore';
import { 
  X, BookOpen, CreditCard, Building, User, ListChecks, Briefcase, Save, Loader2, PlusCircle, Trash2
} from 'lucide-react';
import { ChecklistTemplates } from './admin-settings/ChecklistTemplates';
import { DefaultTasks } from './admin-settings/DefaultTasks';
import { FeesAndTerm } from './admin-settings/FeesAndTerm';
import { JobPositions } from './admin-settings/JobPositions';
import { Classes } from './admin-settings/Classes';
import { MyProfile } from './admin-settings/MyProfile';

type SettingsTab = 'checklists' | 'tasks' | 'fees' | 'jobs' | 'school' | 'profile';

export const SystemSettings: React.FC = () => {
  const { user, milestoneTemplates, saveMilestoneTemplate } = useStore();
  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isSpecialist = user?.role === 'SPECIALIST';
  
  const [activeTab, setActiveTab] = useState<SettingsTab>(isAdmin ? 'checklists' : 'profile');
  const [editingTemplate, setEditingTemplate] = useState<MilestoneTemplate | null>(null);
  const [isTemplateSaving, setIsTemplateSaving] = useState(false);
  const inputBorderStyle = "border-[#154A70] dark:border-[#9DB6BF]";

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setIsTemplateSaving(true);
    await saveMilestoneTemplate(editingTemplate);
    setIsTemplateSaving(false);
    setEditingTemplate(null);
  };

  const handleAddTemplate = () => {
    setEditingTemplate({
      id: `m-${Date.now()}`,
      label: 'New Template',
      minAge: 0,
      maxAge: 36,
      sections: [{ title: 'Movement', items: ['Step one'] }],
      redFlags: ['Warning one']
    });
  };

  // Ensure Specialists stay on profile tab
  useEffect(() => {
    if (isSpecialist) setActiveTab('profile');
  }, [isSpecialist]);

  const allTabs = [
    { id: 'checklists', label: 'Checklists', icon: <BookOpen size={16}/>, adminOnly: true },
    { id: 'tasks', label: 'Tasks', icon: <ListChecks size={16}/>, adminOnly: true },
    { id: 'fees', label: 'Fees & Term', icon: <CreditCard size={16}/>, adminOnly: true },
    { id: 'jobs', label: 'Roles', icon: <Briefcase size={16}/>, adminOnly: true },
    { id: 'school', label: 'Classes', icon: <Building size={16}/>, adminOnly: true },
    { id: 'profile', label: 'Profile Settings', icon: <User size={16}/>, adminOnly: false }
  ];

  const visibleTabs = allTabs.filter(t => !t.adminOnly || isAdmin);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto selection:bg-blue-100 font-sans">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Settings</h1>
        <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 mt-3 italic">
          {isAdmin ? 'System Registry Management' : 'Manage your professional node'}
        </p>
      </header>

      <div className={`flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-none border-2 ${inputBorderStyle} w-fit overflow-x-auto max-w-full no-scrollbar`}>
         {visibleTabs.map(tab => (
           <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-none flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#154A70] text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
           >
             {tab.icon} {tab.label}
           </button>
         ))}
      </div>

      <div className={`bg-white dark:bg-slate-900 border-2 ${inputBorderStyle} rounded-none shadow-sm overflow-hidden min-h-[600px]`}>
        {activeTab === 'checklists' && isAdmin && <ChecklistTemplates onEdit={setEditingTemplate} onAdd={handleAddTemplate} />}
        {activeTab === 'tasks' && isAdmin && <DefaultTasks />}
        {activeTab === 'fees' && isAdmin && <FeesAndTerm />}
        {activeTab === 'jobs' && isAdmin && <JobPositions />}
        {activeTab === 'school' && isAdmin && <Classes />}
        {activeTab === 'profile' && <MyProfile />}
      </div>

      {editingTemplate && isAdmin && (
        <div className="fixed inset-0 z-[2000] bg-slate-950/90 backdrop-blur-md flex justify-end">
           <aside className="relative w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 rounded-none border-l-4 border-[#154A70]">
              <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                 <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Template Editor</h3>
                 <button onClick={() => setEditingTemplate(null)} className="p-3 text-slate-400 hover:text-rose-600 transition-colors"><X size={28}/></button>
              </header>

              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                 <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Template Label</label>
                    <input value={editingTemplate.label} onChange={e => setEditingTemplate({...editingTemplate, label: e.target.value})} className={`w-full p-5 border-2 ${inputBorderStyle} rounded-none font-black text-lg dark:text-white bg-slate-50 dark:bg-slate-950 outline-none`} />
                    <div className="grid grid-cols-2 gap-8">
                       <input type="number" value={editingTemplate.minAge} onChange={e => setEditingTemplate({...editingTemplate, minAge: parseInt(e.target.value)})} placeholder="Min Age (Mo)" className={`w-full p-5 border-2 ${inputBorderStyle} rounded-none font-black dark:text-white bg-slate-50 dark:bg-slate-950 outline-none`} />
                       <input type="number" value={editingTemplate.maxAge} onChange={e => setEditingTemplate({...editingTemplate, maxAge: parseInt(e.target.value)})} placeholder="Max Age (Mo)" className={`w-full p-5 border-2 ${inputBorderStyle} rounded-none font-black dark:text-white bg-slate-50 dark:bg-slate-950 outline-none`} />
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                       <h4 className="text-sm font-black uppercase tracking-widest text-[#154A70]">Assessment Sections</h4>
                       <button onClick={() => setEditingTemplate({...editingTemplate, sections: [...editingTemplate.sections, { title: 'New Area', items: ['Goal'] }]})} className="flex items-center gap-2 text-[10px] font-black uppercase text-[#154A70] hover:underline"><PlusCircle size={14}/> Add Area</button>
                    </div>
                    {editingTemplate.sections.map((section, sIdx) => (
                       <div key={sIdx} className="p-8 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 relative">
                          <button onClick={() => setEditingTemplate({...editingTemplate, sections: editingTemplate.sections.filter((_, i) => i !== sIdx)})} className="absolute top-4 right-4 text-slate-300 hover:text-rose-600"><Trash2 size={16}/></button>
                          <input value={section.title} onChange={e => { const next = [...editingTemplate.sections]; next[sIdx].title = e.target.value; setEditingTemplate({...editingTemplate, sections: next}); }} className="bg-transparent font-black uppercase text-base border-b-2 border-slate-200 focus:border-[#154A70] outline-none w-full pb-2 dark:text-white mb-6" />
                          <div className="space-y-2">
                             {section.items.map((item, iIdx) => (
                               <div key={iIdx} className="flex gap-2">
                                  <input value={item} onChange={e => { const next = [...editingTemplate.sections]; next[sIdx].items[iIdx] = e.target.value; setEditingTemplate({...editingTemplate, sections: next}); }} className={`flex-1 p-3 bg-white dark:bg-slate-900 border ${inputBorderStyle} rounded-none text-xs font-bold text-black dark:text-white`} />
                                  <button onClick={() => { const next = [...editingTemplate.sections]; next[sIdx].items.splice(iIdx, 1); setEditingTemplate({...editingTemplate, sections: next}); }} className="p-3 text-rose-300 hover:text-rose-600"><X size={14}/></button>
                               </div>
                             ))}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex gap-4">
                 <button onClick={() => setEditingTemplate(null)} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Cancel</button>
                 <button onClick={handleSaveTemplate} disabled={isTemplateSaving} className="flex-1 py-5 bg-[#154A70] text-white rounded-none font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-slate-950 transition-all flex items-center justify-center gap-3">
                    {isTemplateSaving ? <Loader2 size={18} className="animate-spin"/> : <><Save size={18}/> Commit Template</>}
                 </button>
              </footer>
           </aside>
        </div>
      )}
    </div>
  );
};
