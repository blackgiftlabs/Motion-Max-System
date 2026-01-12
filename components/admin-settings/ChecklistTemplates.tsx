
import React from 'react';
import { useStore, MilestoneTemplate } from '../../store/useStore';
import { Plus, ClipboardCheck, ChevronRight, Trash2 } from 'lucide-react';

interface Props {
  onEdit: (template: MilestoneTemplate) => void;
  onAdd: () => void;
}

export const ChecklistTemplates: React.FC<Props> = ({ onEdit, onAdd }) => {
  const { milestoneTemplates, deleteMilestoneTemplate } = useStore();
  const borderStyle = "border-[#154A70] dark:border-[#9DB6BF]";

  return (
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Checklist Templates</h3>
          <p className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest mt-1">Manage standard growth goals for students</p>
        </div>
        <button onClick={onAdd} className="px-6 py-3 bg-[#154A70] text-white rounded-none text-[10px] font-black uppercase tracking-widest hover:bg-slate-950 transition-all flex items-center gap-2 shadow-xl">
          <Plus size={16} /> New Template
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {milestoneTemplates.map(template => (
          <div key={template.id} className={`group bg-slate-50 dark:bg-slate-950 border-2 ${borderStyle} p-6 rounded-none hover:border-blue-500 transition-all cursor-pointer relative`} onClick={() => onEdit(template)}>
            <div className="flex items-start justify-between mb-6">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-none text-[#154A70] shadow-sm border border-slate-100 dark:border-slate-800"><ClipboardCheck size={24} /></div>
              <button onClick={(e) => { e.stopPropagation(); if(confirm("Permanently delete this template?")) deleteMilestoneTemplate(template.id); }} className="text-slate-900 dark:text-rose-500 hover:text-rose-600 transition-colors p-2"><Trash2 size={20}/></button>
            </div>
            <h4 className="text-base font-black uppercase text-slate-900 dark:text-white mb-3 tracking-tight">{template.label}</h4>
            <p className="text-[9px] font-black text-black dark:text-white uppercase tracking-widest flex items-center gap-3">
              <span>{template.sections.length} Categories</span>
              <ChevronRight size={10} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
