
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Header } from './Header';
import { 
  User, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';

const IllustrationImg = "https://i.ibb.co/Lb8Lzqs/college-student-read-a-book-illustration.jpg";
const WhatsAppIcon = "https://cdn-icons-png.flaticon.com/512/3670/3670051.png";
const EmailIcon = "https://cdn-icons-png.flaticon.com/512/542/542689.png";

export const OnlineApplication: React.FC = () => {
  const { setView, submitStudentApplication, notify } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male' as 'Male' | 'Female',
    address: '',
    guardianPhone: '',
    guardianEmail: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitStudentApplication(formData);
      setIsSuccess(true);
    } catch (err) {
      notify('error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="h-screen bg-white dark:bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-700">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-googleBlue"></div>
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-none flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-black uppercase tracking-tight text-black dark:text-white leading-none">Success</h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                We have received your details securely. Someone from our admissions office will reach out to you soon.
              </p>
            </div>
            <button 
              onClick={() => setView('landing')}
              className="w-full py-5 bg-black dark:bg-blue-600 text-white rounded-none font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-googleBlue transition-all active:scale-95"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-slate-950 flex flex-col font-sans overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      <Header />
      
      {/* Sticky-Scrolling Model Container */}
      <div className="flex-1 flex flex-col lg:flex-row pt-16 md:pt-24 h-full overflow-hidden">
        
        {/* Left Side: Sticky Illustration (Hidden on mobile for better flow) */}
        <div className="hidden lg:block lg:w-1/2 sticky top-0 h-full bg-white dark:bg-slate-950 overflow-hidden border-r border-slate-100 dark:border-slate-800">
          <img 
            src={IllustrationImg} 
            alt="Student Reading" 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Right Side: Scrollable Application Form */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 custom-scrollbar">
          <div className="max-w-xl w-full mx-auto px-6 py-12 lg:py-16 lg:px-12 relative">
            
            {/* Back Button */}
            <button 
              onClick={() => setView('landing')}
              className="mb-10 group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black dark:hover:text-white transition-all"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              <span>Back to home</span>
            </button>

            <header className="mb-14">
               <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white leading-none mb-4">Student Application <span className="text-blue-600">form</span></h1>
               <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                 Start your child's journey with us. Fill in the form below to apply.
               </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12 pb-20">
              {/* Section 01: Student Details */}
              <div className="space-y-10">
                 <div className="flex items-center gap-4">
                    <span className="w-10 h-10 bg-black dark:bg-blue-600 text-white flex items-center justify-center text-xs font-black">01</span>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black dark:text-white">Student Details</h3>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">First Name</label>
                       <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            required 
                            type="text" 
                            placeholder="Student's first name"
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-none text-sm font-bold outline-none dark:text-white transition-all shadow-sm"
                            value={formData.firstName}
                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Surname</label>
                       <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            required 
                            type="text" 
                            placeholder="Student's surname"
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-none text-sm font-bold outline-none dark:text-white transition-all shadow-sm"
                            value={formData.lastName}
                            onChange={e => setFormData({...formData, lastName: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Date of Birth</label>
                       <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            required 
                            type="date" 
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-none text-sm font-bold outline-none dark:text-white transition-all shadow-sm"
                            value={formData.dob}
                            onChange={e => setFormData({...formData, dob: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Gender</label>
                       <div className="relative">
                          <select 
                            required 
                            className="w-full px-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-none text-sm font-bold outline-none dark:text-white appearance-none transition-all cursor-pointer shadow-sm"
                            value={formData.gender}
                            onChange={e => setFormData({...formData, gender: e.target.value as 'Male' | 'Female'})}
                          >
                             <option value="Male">Male</option>
                             <option value="Female">Female</option>
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Home Address</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-5 text-slate-400" size={18} />
                       <textarea 
                         required 
                         rows={3}
                         placeholder="Residential address in Harare"
                         className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-none text-sm font-bold outline-none dark:text-white resize-none transition-all shadow-sm"
                         value={formData.address}
                         onChange={e => setFormData({...formData, address: e.target.value})}
                       />
                    </div>
                 </div>
              </div>

              {/* Section 02: Guardian Details */}
              <div className="space-y-10">
                 <div className="flex items-center gap-4">
                    <span className="w-10 h-10 bg-black dark:bg-blue-600 text-white flex items-center justify-center text-xs font-black">02</span>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black dark:text-white">Guardian Details</h3>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">WhatsApp Number</label>
                       <div className="relative">
                          <img src={WhatsAppIcon} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" alt="WhatsApp" />
                          <input 
                            required 
                            type="tel" 
                            placeholder="+263..."
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-none text-sm font-bold outline-none dark:text-white transition-all shadow-sm"
                            value={formData.guardianPhone}
                            onChange={e => setFormData({...formData, guardianPhone: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Email Address</label>
                       <div className="relative">
                          <img src={EmailIcon} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" alt="Email" />
                          <input 
                            required 
                            type="email" 
                            placeholder="guardian@example.com"
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-none text-sm font-bold outline-none dark:text-white transition-all shadow-sm"
                            value={formData.guardianEmail}
                            onChange={e => setFormData({...formData, guardianEmail: e.target.value})}
                          />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-8">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-6 bg-black dark:bg-blue-600 text-white rounded-none font-black uppercase tracking-[0.4em] text-xs shadow-2xl flex items-center justify-center gap-4 hover:bg-googleBlue transition-all active:scale-95 disabled:opacity-50 group"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                       <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                       <span>Sending...</span>
                    </div>
                  ) : (
                    <>Submit Application <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
