
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Header } from './Header';
import { Upload, Send, CheckCircle2, Loader2, ArrowLeft, ChevronDown } from 'lucide-react';

const CareerHeroImg = "https://i.ibb.co/zVt6rHr6/33781.jpg";

export const CareersPage: React.FC = () => {
  const { setView, submitApplication, notify } = useStore();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: 'Behavioral Therapist',
    coverLetter: '',
    cvBase64: '',
    cvName: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        notify('error', 'File is too big. Maximum size is 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          cvBase64: reader.result as string, 
          cvName: file.name 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cvBase64) {
      notify('error', 'Please upload your CV (resume) first.');
      return;
    }
    setLoading(true);
    try {
      await submitApplication(formData);
      setSubmitted(true);
    } catch (err) {
      notify('error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="h-screen bg-white dark:bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-700">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-none flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-black uppercase tracking-tight text-black dark:text-white leading-none">Thank You</h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
                We received your application. Our team will look at your CV and call you if we want to talk more.
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
      
      <div className="flex-1 flex flex-col lg:flex-row pt-16 md:pt-24 h-full overflow-hidden">
        
        {/* Left Side: Sticky Image */}
        <div className="hidden lg:block lg:w-1/2 sticky top-0 h-full bg-slate-900 overflow-hidden border-r border-slate-100 dark:border-slate-800">
          <img 
            src={CareerHeroImg} 
            alt="Work with us" 
            className="w-full h-full object-cover opacity-90" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12 text-white">
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400 mb-2">Join our node</p>
             <h3 className="text-5xl font-black uppercase tracking-tighter leading-none">Join our <br /> <span className="text-blue-500">team</span></h3>
          </div>
        </div>

        {/* Right Side: Simple Application Form (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 custom-scrollbar">
          <div className="max-w-xl w-full mx-auto px-6 py-12 lg:py-16 lg:px-12 relative">
            
            <button 
              onClick={() => setView('landing')}
              className="mb-10 group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black dark:hover:text-white transition-all self-start"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              <span>Back to home</span>
            </button>

            <header className="mb-14">
               <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black dark:text-white leading-none mb-4">Job Application <span className="text-blue-600">form</span></h1>
               <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                 Do you want to work with us? Tell us about yourself below.
               </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12 pb-20">
              {/* Section 01: About You */}
              <div className="space-y-10">
                 <div className="flex items-center gap-4">
                    <span className="w-10 h-10 bg-black dark:bg-blue-600 text-white flex items-center justify-center text-xs font-black">01</span>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black dark:text-white">Your Details</h3>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Your Full Name</label>
                       <input 
                         required 
                         type="text" 
                         placeholder="Enter your name"
                         className="w-full px-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-none text-sm font-bold outline-none dark:text-white transition-all shadow-sm"
                         value={formData.fullName}
                         onChange={e => setFormData({...formData, fullName: e.target.value})}
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Email Address</label>
                          <input 
                            required 
                            type="email" 
                            placeholder="Email address"
                            className="w-full px-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-none text-sm font-bold outline-none dark:text-white transition-all shadow-sm"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Phone Number</label>
                          <input 
                            required 
                            type="tel" 
                            placeholder="Phone number"
                            className="w-full px-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-none text-sm font-bold outline-none dark:text-white transition-all shadow-sm"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">What job are you looking for?</label>
                       <div className="relative">
                          <select 
                            required 
                            className="w-full px-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-none text-sm font-bold outline-none dark:text-white appearance-none transition-all cursor-pointer shadow-sm"
                            value={formData.position}
                            onChange={e => setFormData({...formData, position: e.target.value})}
                          >
                             <option>Behavioral Therapist</option>
                             <option>Junior Teacher</option>
                             <option>Office Assistant</option>
                             <option>School Nurse</option>
                             <option>Internship</option>
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Section 02: CV and Bio */}
              <div className="space-y-10">
                 <div className="flex items-center gap-4">
                    <span className="w-10 h-10 bg-black dark:bg-blue-600 text-white flex items-center justify-center text-xs font-black">02</span>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black dark:text-white">Your Background</h3>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Tell us about yourself</label>
                       <textarea 
                         required 
                         rows={4}
                         placeholder="Why do you want to work here?"
                         className="w-full px-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 rounded-none text-sm font-bold outline-none dark:text-white resize-none transition-all shadow-sm"
                         value={formData.coverLetter}
                         onChange={e => setFormData({...formData, coverLetter: e.target.value})}
                       />
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Upload your CV (Resume)</label>
                       <div className="relative group">
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="w-full px-6 py-12 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-none flex flex-col items-center justify-center text-center group-hover:border-blue-500 transition-all shadow-sm">
                             <Upload size={32} className="text-slate-400 mb-4 group-hover:text-blue-500 transition-colors" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                               {formData.cvName || 'Click here to upload your file'}
                             </p>
                             <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-widest">PDF or DOC works best (Max 2MB)</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-8">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-6 bg-black dark:bg-blue-600 text-white rounded-none font-black uppercase tracking-[0.4em] text-xs shadow-2xl flex items-center justify-center gap-4 hover:bg-googleBlue transition-all active:scale-95 disabled:opacity-50 group"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                       <Loader2 className="w-5 h-5 animate-spin" />
                       <span>Sending...</span>
                    </div>
                  ) : (
                    <>Send My Application <Send size={18} className="group-hover:translate-x-2 transition-transform" /></>
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
