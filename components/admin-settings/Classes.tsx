
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, X, Building } from 'lucide-react';

export const Classes: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [newClassName, setNewClassName] = useState('');
  const borderStyle = "border-[#154A70] dark:border-[#9DB6BF]";

  const handleAddClass = () => {
    if (newClassName && !settings.classes.includes(newClassName)) {
      updateSettings({ classes: [...settings.classes, newClassName] });
      setNewClassName('');
    }
  };

  return (
    <div className="p-16 max-w-2xl animate-in fade-in duration-500 space-y-10">
      <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-4 tracking-tight"><Building size={24}/> School Classes</h3>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={newClassName} 
          onChange={e => setNewClassName(e.target.value)} 
          placeholder="New class label (e.g. Nursery)..." 
          className={`flex-1 px-8 py-5 bg-slate-50 dark:bg-slate-950 border-2 ${borderStyle} rounded-none text-sm font-bold text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner`} 
        />
        <button onClick={handleAddClass} className="p-5 bg-[#154A70] text-white rounded-none shadow-xl hover:bg-slate-950 transition-all"><Plus size={24} /></button>
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
        {settings.classes.map(c => (
          <div key={c} className={`flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 border-2 ${borderStyle} rounded-none group hover:border-blue-400 transition-all`}>
            <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-white">{c}</span>
            <button onClick={() => updateSettings({ classes: settings.classes.filter(cls => cls !== c) })} className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all p-2"><X size={20}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};
