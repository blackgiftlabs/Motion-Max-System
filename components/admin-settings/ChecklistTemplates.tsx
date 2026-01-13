
import React from 'react';
import { useStore, MilestoneTemplate } from '../../store/useStore';
import { Plus, ClipboardCheck, ChevronRight, Trash2, BookOpen } from 'lucide-react';

interface Props {
  onEdit: (template: MilestoneTemplate) => void;
  onAdd: () => void;
}

export const ChecklistTemplates: React.FC<Props> = ({ onEdit, onAdd }) => {
  const { milestoneTemplates, deleteMilestoneTemplate, notify } = useStore();

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-ghText tracking-tight">Assessment Checklists</h3>
          <p className="text-sm text-slate-500 mt-1">Configure clinical standards for different student age groups.</p>
        </div>
        <button onClick={onAdd} className="px-6 py-2.5 bg-slate-900 text-white rounded-md text-xs font-bold uppercase tracking-widest hover:bg-googleBlue transition-all flex items-center gap-2 shadow-md active:scale-95">
          <Plus size={16} /> New Checklist
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {milestoneTemplates.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-ghBorder rounded-md">
             <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No checklists configured yet.</p>
          </div>
        ) : milestoneTemplates.map(template => (
          <div 
            key={template.id} 
            className="group bg-white border border-ghBorder rounded-md p-6 hover:border-googleBlue hover:shadow-md transition-all cursor-pointer flex flex-col relative" 
            onClick={() => onEdit(template)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 bg-blue-50 text-googleBlue rounded-md border border-blue-100">
                <ClipboardCheck size={20} />
              </div>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if(confirm("Are you sure you want to delete this checklist template?")) {
                    deleteMilestoneTemplate(template.id);
                    notify('info', 'Template removed.');
                  }
                }} 
                className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
              >
                <Trash2 size={16}/>
              </button>
            </div>
            <h4 className="text-sm font-bold text-ghText mb-2 uppercase tracking-tight group-hover:text-googleBlue transition-colors">{template.label}</h4>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-ghBg">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{template.sections.length} Categories</span>
               <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
