
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Plus, Loader2, User, Mail, Phone, MapPin, GraduationCap, Calendar, Image as ImageIcon, ChevronRight, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterStudentModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addStudent, settings, staff } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      await addStudent({
        ...data,
        fullName: `${data.firstName} ${data.lastName}`,
        totalPaid: 0,
        medicalRecords: '',
        socialHistory: '',
        targetBehaviors: '',
        uniformSizes: '',
      } as any);
      onClose();
    } catch (err) {
      console.error("Registration failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-white mb-2 block";
  const inputClass = "w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-600 outline-none transition-all font-bold dark:text-white shadow-sm rounded-none text-sm";
  const sectionHeaderClass = "flex items-center gap-3 border-b border-slate-900/10 dark:border-white/10 pb-4 mb-6";

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-[10000] bg-white/60 dark:bg-slate-950/60 backdrop-blur-3xl flex flex-col animate-in zoom-in-75 fade-in duration-700 ease-out origin-top-right">
      {/* Header */}
      <header className="h-20 px-8 border-b border-slate-900 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
          <div className="p-2 bg-blue-600 rounded-none shadow-lg">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">Add New Student</h3>
            <p className="text-[9px] font-black text-blue-400 uppercase mt-1 tracking-[0.4em]">Registering a student into the system</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-none">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Secure Entry</span>
          </div>
          <button onClick={onClose} className="p-2 hover:text-blue-400 transition-colors">
            <X size={32} />
          </button>
        </div>
      </header>
      
      <form onSubmit={handleSubmit} id="registration-form" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Section 01: Identity */}
        <section className="flex-1 bg-slate-50 dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-800 p-8 xl:p-12 overflow-y-auto lg:overflow-visible">
          <div className={sectionHeaderClass}>
            <div className="w-8 h-8 bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center text-xs font-black">01</div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Personal Details</h4>
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
              <label className={labelClass}>Student Photo Link</label>
              <div className="relative">
                <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="imageUrl" className={`${inputClass} pl-12`} placeholder="Paste image web link here" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Date of Birth</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required type="date" name="dob" className={`${inputClass} pl-12`} />
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
              <label className={labelClass}>Start Date</label>
              <input required type="date" name="enrollmentDate" className={inputClass} defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
        </section>

        {/* Section 02: Placement (Darker background for contrast) */}
        <section className="flex-1 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-8 xl:p-12 overflow-y-auto lg:overflow-visible">
          <div className={sectionHeaderClass}>
            <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center text-xs font-black">02</div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">School Placement</h4>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-1">
              <label className={labelClass}>Assigned Class</label>
              <select required name="assignedClass" className={inputClass}>
                <option value="">Select a class...</option>
                {settings.classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">The group this student will join</p>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Assigned Teacher</label>
              <select required name="assignedStaffId" className={inputClass}>
                <option value="">Select a teacher...</option>
                {staff.filter(s => s.role === 'SPECIALIST').map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">The main specialist for this student</p>
            </div>

            <div className="p-6 bg-slate-900/5 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-none text-center">
               <GraduationCap size={32} className="text-slate-400 mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Login details will be created automatically</p>
            </div>
          </div>
        </section>

        {/* Section 03: Guardian */}
        <section className="flex-1 bg-white dark:bg-slate-950 p-8 xl:p-12 overflow-y-auto lg:overflow-visible">
          <div className={sectionHeaderClass}>
            <div className="w-8 h-8 bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center text-xs font-black">03</div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-950 dark:text-white">Parent Information</h4>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-1">
              <label className={labelClass}>Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required name="parentName" className={`${inputClass} pl-12`} placeholder="Name of parent or guardian" />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required type="email" name="parentEmail" className={`${inputClass} pl-12`} placeholder="email@address.com" />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required type="tel" name="parentPhone" className={`${inputClass} pl-12`} placeholder="+263..." />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className={labelClass}>Home Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-4 text-slate-400" />
                <textarea required name="homeAddress" rows={3} className={`${inputClass} pl-12 resize-none`} placeholder="Residential address" />
              </div>
            </div>
          </div>
        </section>
      </form>
      
      {/* Footer */}
      <footer className="h-24 px-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between shrink-0">
        <button 
          type="button" 
          onClick={onClose} 
          className="px-10 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
        >
          Cancel and Go Back
        </button>
        
        <div className="flex items-center gap-6">
          <p className="hidden md:block text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Guardians will be notified by email once you save</p>
          <button 
            form="registration-form"
            type="submit"
            disabled={isSubmitting}
            className="px-16 py-5 bg-slate-950 dark:bg-blue-600 text-white rounded-none font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-blue-600 dark:hover:bg-blue-500 transition-all flex items-center gap-5 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>Adding Student... <Loader2 className="animate-spin" size={18} /></>
            ) : (
              <>Add Student to School <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};
