
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Briefcase, Upload, Send, FileText, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export const CareersPage: React.FC = () => {
  const { submitApplication, notify } = useStore();
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
      notify('error', 'Please upload your CV before submitting.');
      return;
    }
    setLoading(true);
    try {
      await submitApplication(formData);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      notify('error', 'Failed to send application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black uppercase tracking-tight dark:text-white">Application Sent</h1>
          <p className="text-slate-500 max-w-md mx-auto font-medium">
            Thank you for applying to Motion Max. Our team will review your CV and contact you if you are a good match for our school.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-4 bg-brandNavy text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-all"
        >
          Back to Careers
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-grid-pattern">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20">
        {/* Info Side */}
        <div className="space-y-12">
          <header className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full border border-blue-100 dark:border-blue-800">
              <Briefcase size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Join our team</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-tight dark:text-white">
              Work With <br /> <span className="text-brandNavy dark:text-blue-400">Our Students</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed italic">
              "We are looking for kind and dedicated people who want to help children with special needs grow and learn in Zimbabwe."
            </p>
          </header>

          <div className="space-y-8">
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
               <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-brandNavy dark:text-blue-400">Open Job Positions</h3>
               <div className="space-y-4">
                  {['Behavioral Therapist', 'Junior Teacher', 'Office Assistant', 'School Nurse'].map(pos => (
                    <div key={pos} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-transparent hover:border-brandNavy transition-all group">
                       <span className="text-sm font-bold uppercase tracking-tight">{pos}</span>
                       <ArrowRight size={16} className="text-slate-300 group-hover:text-brandNavy group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-8 bg-brandNavy rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <FileText className="absolute -right-8 -bottom-8 text-white/5" size={160} />
               <h4 className="text-lg font-black uppercase tracking-widest mb-4">What you need</h4>
               <ul className="space-y-3 text-sm text-blue-100/80 font-medium">
                  <li>• Experience working with children</li>
                  <li>• A kind and patient attitude</li>
                  <li>• Ability to keep good records</li>
                  <li>• Zimbabwean ID or valid work permit</li>
               </ul>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Full Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. John Sibanda"
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brandNavy/5 transition-all"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                  <input 
                    required
                    type="email"
                    placeholder="name@email.com"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brandNavy/5 transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</label>
                  <input 
                    required
                    type="tel"
                    placeholder="+263..."
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brandNavy/5 transition-all"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Job Title</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none cursor-pointer"
                  value={formData.position}
                  onChange={e => setFormData({...formData, position: e.target.value})}
                >
                  <option>Behavioral Therapist</option>
                  <option>Junior Teacher</option>
                  <option>Office Assistant</option>
                  <option>School Nurse</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message to School</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Tell us why you want to work at Motion Max..."
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-brandNavy/5 transition-all resize-none"
                  value={formData.coverLetter}
                  onChange={e => setFormData({...formData, coverLetter: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload your CV (PDF or Word)</label>
                <div className="relative group">
                   <input 
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                   />
                   <div className="w-full px-6 py-8 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center group-hover:border-brandNavy transition-all">
                      <Upload size={32} className="text-slate-400 mb-2 group-hover:text-brandNavy transition-colors" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {formData.cvName || 'Click to select or drag your CV here'}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">File must be smaller than 2MB</p>
                   </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-brandNavy text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center gap-4 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Send Application <Send size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
