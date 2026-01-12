
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, Edit2, Check, Briefcase } from 'lucide-react';

export const JobPositions: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [newPosName, setNewPosName] = useState('');
  const [editingPos, setEditingPos] = useState<{ original: string, current: string } | null>(null);
  const borderStyle = "border-[#154A70] dark:border-[#9DB6BF]";

  const handleAddPosition = () => {
    if (newPosName && !settings.positions.find(p => p.name === newPosName)) {
      updateSettings({ positions: [...settings.positions, { name: newPosName, active: true }] });
      setNewPosName('');
    }
  };

  return (
    <div className="p-10 max-w-4xl animate-in fade-in duration-500 space-y-10">
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight leading-none">Job Positions</h3>
          <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mt-3">Configure roles for applications</p>
        </div>
        <div className="flex gap-2">
          <input 
            value={newPosName} 
            onChange={e => setNewPosName(e.target.value)} 
            placeholder="Role title..."
            className={`px-6 py-4 text-xs bg-slate-50 dark:bg-slate-950 border-2 ${borderStyle} rounded-none font-bold text-black dark:text-white outline-none w-64 shadow-inner`} 
          />
          <button onClick={handleAddPosition} className="p-4 bg-[#154A70] text-white rounded-none hover:bg-slate-950 transition-all"><Plus size={24}/></button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-1 bg-slate-100 dark:bg-slate-800 p-1 border-2 border-[#154A70] min-h-[400px]">
        {settings.positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900">
            <Briefcase size={48} className="text-slate-100" />
            <p className="text-[10px] font-black uppercase text-slate-300 italic tracking-[0.4em]">No positions set</p>
          </div>
        ) : settings.positions.map(pos => (
          <div key={pos.name} className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 group">
            {editingPos?.original === pos.name ? (
              <div className="flex items-center gap-2 flex-1">
                <input 
                  value={editingPos.current} 
                  onChange={e => setEditingPos({...editingPos, current: e.target.value})}
                  className="text-sm font-black uppercase text-[#154A70] outline-none w-full border-b-2 border-[#154A70]"
                  autoFocus
                />
                <button onClick={() => { updateSettings({ positions: settings.positions.map(p => p.name === pos.name ? {...p, name: editingPos.current} : p) }); setEditingPos(null); }} className="p-2 bg-[#154A70] text-white"><Check size={16} /></button>
              </div>
            ) : (
              <span className={`text-sm font-black uppercase ${pos.active ? 'text-slate-900 dark:text-white' : 'text-slate-300 line-through'}`}>{pos.name}</span>
            )}
            <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-all">
              <button onClick={() => updateSettings({ positions: settings.positions.map(p => p.name === pos.name ? {...p, active: !p.active} : p) })} className={`px-4 py-2 text-[8px] font-black uppercase border ${pos.active ? 'text-emerald-600 border-emerald-100' : 'text-slate-400 border-slate-100'}`}>{pos.active ? 'Live' : 'Hidden'}</button>
              <button onClick={() => setEditingPos({ original: pos.name, current: pos.name })} className="p-3 text-slate-400 hover:text-blue-600"><Edit2 size={18}/></button>
              <button onClick={() => updateSettings({ positions: settings.positions.filter(p => p.name !== pos.name) })} className="p-3 text-slate-400 hover:text-rose-600"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
