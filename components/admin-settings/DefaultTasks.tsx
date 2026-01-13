
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, X, ListChecks, FileText, Trash2 } from 'lucide-react';

export const DefaultTasks: React.FC = () => {
  const { settings, updateSettings, notify } = useStore();
  const [newTaskStep, setNewTaskStep] = useState('');

  const handleAddTaskStep = () => {
    if (newTaskStep && !settings.defaultTaskSteps?.includes(newTaskStep)) {
      const next = [...(settings.defaultTaskSteps || []), newTaskStep];
      updateSettings({ defaultTaskSteps: next });
      setNewTaskStep('');
      notify('success', 'Lesson item added to global template.');
    }
  };

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-ghBorder pb-8 mb-8">
        <div>
          <h3 className="text-xl font-bold text-ghText tracking-tight">Global Lesson Template</h3>
          <p className="text-sm text-slate-500 mt-1">Add items that will appear by default in every teacher's new lesson plan.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newTaskStep} 
            onChange={e => setNewTaskStep(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleAddTaskStep()}
            placeholder="Describe the lesson item..." 
            className="px-4 py-2 text-sm bg-white border border-ghBorder rounded-md font-medium text-ghText outline-none w-64 focus:ring-2 focus:ring-googleBlue/20 focus:border-googleBlue transition-all shadow-sm" 
          />
          <button onClick={handleAddTaskStep} className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-googleBlue transition-all flex items-center gap-2 shadow-sm active:scale-95">
             <Plus size={18}/> Add Item
          </button>
        </div>
      </header>

      <div className="bg-white border border-ghBorder rounded-md overflow-hidden shadow-sm">
        <div className="bg-ghBg px-6 py-3 border-b border-ghBorder">
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Template Items</p>
        </div>
        
        <div className="divide-y divide-ghBorder">
          {!settings.defaultTaskSteps || settings.defaultTaskSteps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white">
              <FileText size={32} className="text-slate-200 mb-3" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No items set.</p>
            </div>
          ) : settings.defaultTaskSteps.map((step, idx) => (
            <div key={idx} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                 <span className="text-[11px] font-bold text-slate-300 font-mono">{(idx + 1).toString().padStart(2, '0')}</span>
                 <span className="text-sm font-medium text-ghText">{step}</span>
              </div>
              <button 
                onClick={() => updateSettings({ defaultTaskSteps: settings.defaultTaskSteps?.filter(s => s !== step) })} 
                className="p-2 text-slate-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
              >
                 <Trash2 size={16}/>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
