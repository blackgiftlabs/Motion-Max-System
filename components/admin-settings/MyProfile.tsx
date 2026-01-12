
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Save, Loader2, User } from 'lucide-react';

export const MyProfile: React.FC = () => {
  const { user, updateUserProfile } = useStore();
  const [newName, setNewName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const borderStyle = "border-[#154A70] dark:border-[#9DB6BF]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    await updateUserProfile({ name: newName, password: newPassword || undefined });
    setNewPassword('');
    setProfileSaving(false);
  };

  return (
    <div className="p-16 max-w-xl mx-auto animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-none bg-[#154A70] text-white flex items-center justify-center text-5xl font-black mb-6 shadow-2xl uppercase border-4 border-white dark:border-slate-800">{user?.name?.[0]}</div>
          <h3 className="text-2xl font-black uppercase dark:text-white tracking-tighter">{user?.name}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white mt-3">Role: {user?.role}</p>
        </div>
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest ml-1">Your Name</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className={`w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 border-2 ${borderStyle} rounded-none font-black uppercase text-sm text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner`} />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-900 dark:text-white tracking-widest ml-1">Update Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password..." className={`w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 border-2 ${borderStyle} rounded-none font-black text-sm text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner`} />
          </div>
          <button type="submit" disabled={profileSaving} className="w-full py-6 bg-slate-950 dark:bg-blue-600 text-white rounded-none font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-[#154A70] transition-all disabled:opacity-50">
            {profileSaving ? <Loader2 className="animate-spin mx-auto" size={20} /> : <><Save size={20} className="inline mr-3" /> Save Profile</>}
          </button>
        </div>
      </form>
    </div>
  );
};
