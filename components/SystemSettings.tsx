
import React, { useState } from 'react';
import { useStore, MilestoneTemplate } from '../store/useStore';
import { 
  BookOpen, CreditCard, Building, User, ListChecks, Briefcase, Save, Loader2, Trash2, AlertTriangle, ChevronLeft, Plus, X
} from 'lucide-react';
import { ChecklistTemplates } from './admin-settings/ChecklistTemplates';
import { DefaultTasks } from './admin-settings/DefaultTasks';
import { FeesAndTerm } from './admin-settings/FeesAndTerm';
import { JobPositions } from './admin-settings/JobPositions';
import { Classes } from './admin-settings/Classes';
import { MyProfile } from './admin-settings/MyProfile';

type SettingsTab = 'checklists' | 'tasks' | 'fees' | 'jobs' | 'school' | 'profile';

export const SystemSettings: React.FC = () => {
  const { user, saveMilestoneTemplate, notify } = useStore();
  const isAdmin = user?.role === 'SUPER_ADMIN';
  
  const [activeTab, setActiveTab] = useState<SettingsTab>(isAdmin ? 'checklists' : 'profile');
  const [editingTemplate, setEditingTemplate] = useState<MilestoneTemplate | null>(null);
  const [isTemplateSaving, setIsTemplateSaving] = useState(false);
  
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'item' | 'category', sIdx?: number, iIdx?: number } | null>(null);

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setIsTemplateSaving(true);
    try {
      await saveMilestoneTemplate(editingTemplate);
      notify('success', 'Checklist template updated.');
      setEditingTemplate(null);
    } catch (err) {
      notify('error', 'Failed to save.');
    } finally {
      setIsTemplateSaving(false);
    }
  };

  const handleAddTemplate = () => {
    setEditingTemplate({
      id: `m-${Date.now()}`,
      label: 'New Age Group Checklist',
      minAge: 1,
      maxAge: 72,
      sections: [{ title: 'Movement Skills', items: ['Student can jump'] }],
      redFlags: ['Student cannot focus']
    });
  };

  const removeCategory = (sIdx: number) => {
    if (!editingTemplate) return;
    const next = [...editingTemplate.sections];
    next.splice(sIdx, 1);
    setEditingTemplate({ ...editingTemplate, sections: next });
    setConfirmDelete(null);
  };

  const removeItem = (sIdx: number, iIdx: number) => {
    if (!editingTemplate) return;
    const next = [...editingTemplate.sections];
    next[sIdx].items.splice(iIdx, 1);
    setEditingTemplate({ ...editingTemplate, sections: next });
    setConfirmDelete(null);
  };

  const allTabs = [
    { id: 'checklists', label: 'Checklists', icon: <BookOpen size={16}/>, adminOnly: true },
    { id: 'tasks', label: 'Lesson Templates', icon: <ListChecks size={16}/>, adminOnly: true },
    { id: 'fees', label: 'Fees & Term', icon: <CreditCard size={16}/>, adminOnly: true },
    { id: 'jobs', label: 'Staff Roles', icon: <Briefcase size={16}/>, adminOnly: true },
    { id: 'school', label: 'Classes', icon: <Building size={16}/>, adminOnly: true },
    { id: 'profile', label: 'My Profile', icon: <User size={16}/>, adminOnly: false }
  ];

  const visibleTabs = allTabs.filter(t => !t.adminOnly || isAdmin);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <header className="border-b border-ghBorder pb-6">
        <h1 className="text-3xl font-bold text-ghText tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-2 font-medium">Manage school configuration, payments, and therapeutic standards.</p>
      </header>

      <div className="flex bg-ghBg p-1 rounded-md border border-ghBorder w-fit overflow-x-auto">
         {visibleTabs.map(tab => (
           <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2.5 rounded-md flex items-center gap-3 text-xs font-bold uppercase transition-all ${activeTab === tab.id ? 'bg-white text-googleBlue shadow-sm border border-ghBorder' : 'text-slate-500 hover:text-ghText'}`}
           >
             {tab.icon} {tab.label}
           </button>
         ))}
      </div>

      <div className="gh-box bg-white overflow-hidden shadow-sm min-h-[500px]">
        {activeTab === 'checklists' && isAdmin && <ChecklistTemplates onEdit={setEditingTemplate} onAdd={handleAddTemplate} />}
        {activeTab === 'tasks' && isAdmin && <DefaultTasks />}
        {activeTab === 'fees' && isAdmin && <FeesAndTerm />}
        {activeTab === 'jobs' && isAdmin && <JobPositions />}
        {activeTab === 'school' && isAdmin && <Classes />}
        {activeTab === 'profile' && <MyProfile />}
      </div>

      {editingTemplate && isAdmin && (
        <div className="fixed inset-0 z-[10000] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
           <header className="h-16 border-b border-ghBorder bg-ghBg px-8 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                 <button onClick={() => setEditingTemplate(null)} className="p-2 hover:bg-slate-200 rounded-md text-slate-500 transition-colors">
                    <ChevronLeft size={20} />
                 </button>
                 <div className="h-6 w-px bg-ghBorder"></div>
                 <h2 className="text-sm font-bold text-ghText uppercase tracking-wide">Checklist Editor</h2>
              </div>
              <div className="flex items-center gap-3">
                 <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-ghText">Cancel</button>
                 <button onClick={handleSaveTemplate} disabled={isTemplateSaving} className="px-6 py-2 bg-slate-900 text-white rounded-md text-xs font-bold uppercase flex items-center gap-2 hover:bg-googleBlue transition-all disabled:opacity-50">
                    {isTemplateSaving ? <Loader2 size={14} className="animate-spin"/> : <><Save size={14}/> Save Template</>}
                 </button>
              </div>
           </header>

           <div className="flex-1 overflow-y-auto bg-[#f6f8fa] p-8 lg:p-12 custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-8">
                 <div className="bg-white border border-ghBorder rounded-md overflow-hidden shadow-sm">
                    <header className="px-6 py-4 bg-white border-b border-ghBorder">
                       <h3 className="text-xs font-bold uppercase text-slate-500">General Information</h3>
                    </header>
                    <div className="p-8 space-y-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-ghText">Checklist Name</label>
                          <input value={editingTemplate.label} onChange={e => setEditingTemplate({...editingTemplate, label: e.target.value})} className="w-full px-4 py-3 bg-white border border-ghBorder rounded-md text-sm font-bold outline-none focus:ring-2 focus:ring-googleBlue/20 focus:border-googleBlue" />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-ghText">Min Age (Months)</label>
                             <input type="number" value={editingTemplate.minAge} onChange={e => setEditingTemplate({...editingTemplate, minAge: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-white border border-ghBorder rounded-md text-sm outline-none focus:border-googleBlue" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-ghText">Max Age (Months)</label>
                             <input type="number" value={editingTemplate.maxAge} onChange={e => setEditingTemplate({...editingTemplate, maxAge: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-white border border-ghBorder rounded-md text-sm outline-none focus:border-googleBlue" />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                       <h3 className="text-sm font-bold uppercase text-slate-500">Assessment Categories</h3>
                       <button onClick={() => setEditingTemplate({...editingTemplate, sections: [...editingTemplate.sections, { title: 'New Category', items: ['New goal'] }]})} className="flex items-center gap-2 text-xs font-bold text-googleBlue hover:underline">
                          <Plus size={16}/> Add Category
                       </button>
                    </div>

                    {editingTemplate.sections.map((section, sIdx) => (
                       <div key={sIdx} className="bg-white border border-ghBorder rounded-md overflow-hidden shadow-sm">
                          <header className="px-6 py-4 bg-ghBg border-b border-ghBorder flex items-center justify-between">
                             <input value={section.title} onChange={e => { const next = [...editingTemplate.sections]; next[sIdx].title = e.target.value; setEditingTemplate({...editingTemplate, sections: next}); }} className="bg-transparent font-bold text-sm uppercase text-ghText outline-none focus:text-googleBlue w-1/2" />
                             <button onClick={() => setConfirmDelete({ type: 'category', sIdx })} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16}/></button>
                          </header>
                          <div className="p-6 space-y-3">
                             {section.items.map((item, iIdx) => (
                               <div key={iIdx} className="flex gap-3 animate-in fade-in duration-200">
                                  <div className="flex-none pt-3"><div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">{iIdx + 1}</div></div>
                                  <input value={item} onChange={e => { const next = [...editingTemplate.sections]; next[sIdx].items[iIdx] = e.target.value; setEditingTemplate({...editingTemplate, sections: next}); }} className="flex-1 px-4 py-2.5 bg-slate-50 border border-ghBorder rounded-md text-sm outline-none focus:bg-white focus:border-googleBlue transition-all" />
                                  <button onClick={() => setConfirmDelete({ type: 'item', sIdx, iIdx })} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={16}/></button>
                               </div>
                             ))}
                             <button onClick={() => { const next = [...editingTemplate.sections]; next[sIdx].items.push('New goal item'); setEditingTemplate({...editingTemplate, sections: next}); }} className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-googleBlue mt-4 ml-8">
                                <Plus size={14}/> Add item
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {confirmDelete && (
             <div className="fixed inset-0 z-[11000] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="bg-white max-w-sm w-full rounded-md shadow-2xl overflow-hidden animate-in zoom-in-95">
                   <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                         <AlertTriangle size={32}/>
                      </div>
                      <h3 className="text-lg font-bold text-ghText mb-2">Delete this {confirmDelete.type}?</h3>
                      <p className="text-sm text-slate-500 mb-8 font-medium italic">This cannot be undone. It will be removed from the template immediately.</p>
                      <div className="flex gap-3">
                         <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-md text-xs font-bold uppercase">Cancel</button>
                         <button onClick={() => confirmDelete.type === 'category' ? removeCategory(confirmDelete.sIdx!) : removeItem(confirmDelete.sIdx!, confirmDelete.iIdx!)} className="flex-1 py-2.5 bg-rose-600 text-white rounded-md text-xs font-bold uppercase">Delete</button>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};
