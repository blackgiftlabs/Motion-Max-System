
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, X, Building, Trash2 } from 'lucide-react';

export const Classes: React.FC = () => {
  const { settings, updateSettings, notify } = useStore();
  const [newClassName, setNewClassName] = useState('');

  const handleAddClass = () => {
    if (newClassName && !settings.classes.includes(newClassName)) {
      updateSettings({ classes: [...settings.classes, newClassName] });
      setNewClassName('');
      notify('success', 'Class added.');
    }
  };

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-ghBorder pb-8 mb-8">
        <div>
          <h3 className="text-xl font-bold text-ghText tracking-tight flex items-center gap-2">
             Classrooms & Groups
          </h3>
          <p className="text-sm text-slate-500 mt-1">Manage the physical and academic groups students belong to.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newClassName} 
            onChange={e => setNewClassName(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleAddClass()}
            placeholder="e.g. Preschool B" 
            className="px-4 py-2 text-sm bg-white border border-ghBorder rounded-md font-medium text-ghText outline-none w-64 focus:ring-2 focus:ring-googleBlue/20 focus:border-googleBlue transition-all shadow-sm" 
          />
          <button onClick={handleAddClass} className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-googleBlue transition-all flex items-center gap-2 shadow-sm active:scale-95">
             <Plus size={18}/> Add Class
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings.classes.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-ghBorder rounded-md bg-white">
             <Building size={32} className="mx-auto text-slate-200 mb-3" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No classes defined.</p>
          </div>
        ) : settings.classes.map(c => (
          <div key={c} className="flex items-center justify-between p-5 bg-white border border-ghBorder rounded-md group hover:border-googleBlue transition-all shadow-sm hover:shadow-md">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-ghBg text-slate-500 rounded flex items-center justify-center border border-ghBorder group-hover:text-googleBlue group-hover:border-blue-100 transition-colors">
                  <Building size={16} />
               </div>
               <span className="text-sm font-bold uppercase tracking-tight text-ghText">{c}</span>
            </div>
            <button 
              onClick={() => { if(confirm("Remove this class?")) updateSettings({ classes: settings.classes.filter(cls => cls !== c) }); }} 
              className="p-2 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
            >
               <Trash2 size={16}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
