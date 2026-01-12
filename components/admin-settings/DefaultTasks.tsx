
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, X } from 'lucide-react';

export const DefaultTasks: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [newTaskStep, setNewTaskStep] = useState('');
  const borderStyle = "border-[#154A70] dark:border-[#9DB6BF]";

  const handleAddTaskStep = () => {
    if (newTaskStep && !settings.defaultTaskSteps?.includes(newTaskStep)) {
      const next = [...(settings.defaultTaskSteps || []), newTaskStep];
      updateSettings({ defaultTaskSteps: next });
      setNewTaskStep('');
    }
  };

  return (
    <div className="p-16 max-w-2xl animate-in fade-in duration-500 space-y-10">
      <div>
        <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight leading-none">Task Templates</h3>
        <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mt-3">Pre-set steps for Teacher logs</p>
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={newTaskStep} 
          onChange={e => setNewTaskStep(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleAddTaskStep()}
          placeholder="Enter new step description..." 
          className={`flex-1 px-8 py-5 bg-slate-50 dark:bg-slate-950 border-2 ${borderStyle} rounded-none text-sm font-bold text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner`} 
        />
        <button onClick={handleAddTaskStep} className="p-5 bg-[#154A70] text-white rounded-none shadow-xl hover:bg-slate-950 transition-all"><Plus size={24} /></button>
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
        {(settings.defaultTaskSteps || []).map(step => (
          <div key={step} className={`flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 border-2 ${borderStyle} rounded-none group hover:border-blue-400 transition-all`}>
            <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-white">{step}</span>
            <button onClick={() => updateSettings({ defaultTaskSteps: settings.defaultTaskSteps?.filter(s => s !== step) })} className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all p-2"><X size={20}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};
