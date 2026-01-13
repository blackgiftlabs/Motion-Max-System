
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
    <div className="fixed inset-0 z-[40000] bg-white dark:bg-slate-950 flex flex-col animate-in zoom-in-50 fade-in duration-700 ease-out origin-top-right">
      <header className="h-20 px-8 border-b border-slate-900 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="p-2 bg-emerald-600 rounded-none shadow-lg">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">Register Staff Member</h3>
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
        {/* Section 01: Identity */}
        <section className="flex-1 bg-white dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-800 p-8 xl:p-12 overflow-y-auto lg:overflow-visible">
          <div className={sectionHeaderClass}>
            <div className="w-8 h-8 bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-black">01</div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Basic Info</h4>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>First Name</label>
                <input required name="firstName" className={inputClass} placeholder="Enter name" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Surname</label>
                <input required name="lastName" className={inputClass} placeholder="Enter surname" />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Photo Link (URL)</label>
              <div className="relative">
                <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="imageUrl" className={`${inputClass} pl-12 font-mono text-[10px]`} placeholder="Paste image web link" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Nationality</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    value={nationality} 
                    onChange={e => setNationality(e.target.value)}
                    className={`${inputClass} pl-12`}
                  >
                    <option value="Zimbabwean">Zimbabwean</option>
                    <option value="South African">South African</option>
                    <option value="Zambian">Zambian</option>
                    <option value="Malawian">Malawian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Gender</label>
                <select required name="gender" className={inputClass}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{nationality === 'Zimbabwean' ? 'National ID' : 'Passport Number'}</label>
              <div className="relative">
                <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required name={nationality === 'Zimbabwean' ? 'nationalId' : 'passportNumber'} className={`${inputClass} pl-12`} placeholder="ID Number" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 02: Employment */}
        <section className="flex-1 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-8 xl:p-12 overflow-y-auto lg:overflow-visible shadow-inner">
          <div className={sectionHeaderClass}>
            <div className="w-8 h-8 bg-emerald-600 text-white flex items-center justify-center text-xs font-black">02</div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">Job & Classes</h4>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-1">
              <label className={labelClass}>Job Title</label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select required name="position" className={`${inputClass} pl-12`}>
                  <option value="">Select a job...</option>
                  {settings.positions.filter(p => p.active).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>System Access</label>
              <select required name="role" className={inputClass}>
                <option value="SPECIALIST">Therapist / Teacher</option>
                <option value="ADMIN_SUPPORT">Office Staff</option>
                <option value="SUPER_ADMIN">Administrator</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className={labelClass}>Assigned Classes</label>
              <div className="grid grid-cols-2 gap-2">
                {settings.classes.map(cls => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      if (selectedClasses.includes(cls)) setSelectedClasses(selectedClasses.filter(c => c !== cls));
                      else setSelectedClasses([...selectedClasses, cls]);
                    }}
                    className={`px-4 py-2 text-[10px] font-black uppercase transition-all border ${selectedClasses.includes(cls) ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-emerald-400'}`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Which rooms will they work in?</p>
            </div>
          </div>
        </section>

        {/* Section 03: Contact */}
        <section className="flex-1 bg-white dark:bg-slate-950 p-8 xl:p-12 overflow-y-auto lg:overflow-visible">
          <div className={sectionHeaderClass}>
            <div className="w-8 h-8 bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center text-xs font-black">03</div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-950 dark:text-white">Contact Info</h4>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-1">
              <label className={labelClass}>Work Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required type="email" name="email" className={`${inputClass} pl-12`} placeholder="name@motionmax.com" />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required type="tel" name="phone" className={`${inputClass} pl-12`} placeholder="+263..." />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className={labelClass}>Home Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-4 text-slate-400" />
                <textarea required name="address" rows={4} className={`${inputClass} pl-12 resize-none`} placeholder="Current home address" />
              </div>
            </div>
          </div>
        </section>
      </form>
      
      <footer className="h-24 px-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between shrink-0">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
        >
          Cancel and Go Back
        </button>
        
        <div className="flex items-center gap-6">
          <p className="hidden md:block text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Account will be created automatically</p>
          <button 
            form="staff-registration-form"
            type="submit"
            disabled={isSubmitting}
            className="px-16 py-5 bg-slate-950 dark:bg-emerald-600 text-white rounded-none font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all flex items-center gap-5 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>Saving... <Loader2 className="animate-spin" size={18} /></>
            ) : (
              <>Finish Registration <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};
