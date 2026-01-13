
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Plus, Loader2, User, Mail, Phone, MapPin, Briefcase, Globe, ShieldCheck, CreditCard, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterStaffModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addStaff, settings } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nationality, setNationality] = useState('Zimbabwean');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      await addStaff({
        ...data,
        nationality,
        assignedClasses: selectedClasses,
        role: data.role as any,
      } as any);
      onClose();
    } catch (err) {
      console.error("Registration failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-white mb-2 block";
  const inputClass = "w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-600 outline-none transition-all font-bold dark:text-white shadow-sm rounded-none text-sm";
  const sectionHeaderClass = "flex items-center gap-3 border-b border-slate-900/10 dark:border-white/10 pb-4 mb-6";

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex flex-col animate-in zoom-in-95 duration-500 origin-top">
      <header className="h-20 px-8 border-b border-slate-900 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="p-2 bg-emerald-600 rounded-none shadow-lg">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">Register Staff</h3>
            <p className="text-[9px] font-black text-emerald-400 uppercase mt-1 tracking-[0.4em]">Expanding the school team</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-none">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Secure Entry</span>
          </div>
          <button onClick={onClose} className="p-2 hover:text-emerald-400 transition-colors">
            <X size={32} />
          </button>
        </div>
      </header>
      
      <form onSubmit={handleSubmit} id="staff-registration-form" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <section className="flex-1 bg-white dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-800 p-8 xl:p-12 overflow-y-auto">
          <div className={sectionHeaderClass}>
            <div className="w-8 h-8 bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-black">01</div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Identity</h4>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className={labelClass}>First Name</label><input required name="firstName" className={inputClass} placeholder="Name" /></div>
              <div className="space-y-1"><label className={labelClass}>Surname</label><input required name="lastName" className={inputClass} placeholder="Surname" /></div>
            </div>
            <div className="space-y-1"><label className={labelClass}>Nationality</label><select value={nationality} onChange={e => setNationality(e.target.value)} className={inputClass}><option value="Zimbabwean">Zimbabwean</option><option value="Other">Other</option></select></div>
            <div className="space-y-1"><label className={labelClass}>ID / Passport</label><input required name={nationality === 'Zimbabwean' ? 'nationalId' : 'passportNumber'} className={inputClass} placeholder="Number" /></div>
          </div>
        </section>

        <section className="flex-1 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-8 xl:p-12 overflow-y-auto shadow-inner">
          <div className={sectionHeaderClass}>
            <div className="w-8 h-8 bg-emerald-600 text-white flex items-center justify-center text-xs font-black">02</div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">Role</h4>
          </div>
          <div className="space-y-8">
            <div className="space-y-1"><label className={labelClass}>Job Title</label><select required name="position" className={inputClass}><option value="">Choose...</option>{settings.positions.filter(p => p.active).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select></div>
            <div className="space-y-1"><label className={labelClass}>Access Level</label><select required name="role" className={inputClass}><option value="SPECIALIST">Teacher</option><option value="ADMIN_SUPPORT">Office</option><option value="SUPER_ADMIN">Admin</option></select></div>
          </div>
        </section>

        <section className="flex-1 bg-white dark:bg-slate-950 p-8 xl:p-12 overflow-y-auto">
          <div className={sectionHeaderClass}>
            <div className="w-8 h-8 bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-black">03</div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-950 dark:text-white">Contact</h4>
          </div>
          <div className="space-y-6">
            <div className="space-y-1"><label className={labelClass}>Email</label><input required type="email" name="email" className={inputClass} placeholder="email@address.com" /></div>
            <div className="space-y-1"><label className={labelClass}>Phone</label><input required name="phone" className={inputClass} placeholder="+263..." /></div>
          </div>
        </section>
      </form>
      
      <footer className="h-24 px-12 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <button type="button" onClick={onClose} className="px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-black">Discard</button>
        <button form="staff-registration-form" type="submit" disabled={isSubmitting} className="px-16 py-5 bg-slate-900 text-white rounded-none font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-emerald-600 transition-all flex items-center gap-5 active:scale-95 disabled:opacity-50">
          {isSubmitting ? <>Saving... <Loader2 className="animate-spin" size={18} /></> : <>Complete Registration <ChevronRight size={18} /></>}
        </button>
      </footer>
    </div>
  );
};
