
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, Edit2, Check, Briefcase, X } from 'lucide-react';

export const JobPositions: React.FC = () => {
  const { settings, updateSettings, notify } = useStore();
  const [newPosName, setNewPosName] = useState('');
  const [editingPos, setEditingPos] = useState<{ original: string, current: string } | null>(null);

  const handleAddPosition = () => {
    if (newPosName && !settings.positions.find(p => p.name === newPosName)) {
      updateSettings({ positions: [...settings.positions, { name: newPosName, active: true }] });
      setNewPosName('');
      notify('success', 'New role added.');
    }
  };

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-ghBorder pb-8 mb-8">
        <div>
          <h3 className="text-xl font-bold text-ghText tracking-tight">Staff Roles</h3>
          <p className="text-sm text-slate-500 mt-1">Define the job titles available for recruitment and staff profiles.</p>
        </div>
        <div className="flex gap-2">
          <input 
            value={newPosName} 
            onChange={e => setNewPosName(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleAddPosition()}
            placeholder="e.g. Senior Therapist"
            className="px-4 py-2 text-sm bg-white border border-ghBorder rounded-md font-medium text-ghText outline-none w-64 focus:ring-2 focus:ring-googleBlue/20 focus:border-googleBlue transition-all shadow-sm" 
          />
          <button onClick={handleAddPosition} className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-googleBlue transition-all flex items-center gap-2 shadow-sm active:scale-95">
             <Plus size={18}/> Add Role
          </button>
        </div>
      </header>

      <div className="border border-ghBorder rounded-md overflow-hidden bg-white shadow-sm">
        <div className="bg-ghBg px-6 py-3 border-b border-ghBorder">
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Employment Roles</p>
        </div>
        
        <div className="divide-y divide-ghBorder">
          {settings.positions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white">
              <Briefcase size={32} className="text-slate-200 mb-3" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No roles defined.</p>
            </div>
          ) : settings.positions.map(pos => (
            <div key={pos.name} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
              {editingPos?.original === pos.name ? (
                <div className="flex items-center gap-2 flex-1 animate-in fade-in slide-in-from-left-2">
                  <input 
                    value={editingPos.current} 
                    onChange={e => setEditingPos({...editingPos, current: e.target.value})}
                    className="text-sm font-bold text-googleBlue outline-none w-full border-b border-googleBlue bg-transparent"
                    autoFocus
                  />
                  <button onClick={() => { updateSettings({ positions: settings.positions.map(p => p.name === pos.name ? {...p, name: editingPos.current} : p) }); setEditingPos(null); }} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"><Check size={18} /></button>
                  <button onClick={() => setEditingPos(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"><X size={18} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${pos.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                   <span className={`text-sm font-bold uppercase tracking-tight ${pos.active ? 'text-ghText' : 'text-slate-300 line-through'}`}>{pos.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => updateSettings({ positions: settings.positions.map(p => p.name === pos.name ? {...p, active: !p.active} : p) })} 
                  className={`px-3 py-1 text-[9px] font-bold uppercase border rounded ${pos.active ? 'text-slate-400 border-slate-200 hover:text-ghText' : 'text-emerald-600 border-emerald-100 bg-emerald-50'}`}
                >
                   {pos.active ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => setEditingPos({ original: pos.name, current: pos.name })} className="p-2 text-slate-400 hover:text-googleBlue transition-colors"><Edit2 size={16}/></button>
                <button onClick={() => { if(confirm("Remove this role permanently?")) updateSettings({ positions: settings.positions.filter(p => p.name !== pos.name) }); }} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
