
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Application } from '../types';
import { Mail, Phone, Clock, FileText, CheckCircle2, XCircle, ChevronRight, Eye, User, Briefcase, Trash2, Search, Filter, Calendar } from 'lucide-react';

export const ApplicationsManagement: React.FC = () => {
  const { applications, updateApplicationStatus } = useStore();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Shortlisted' | 'Rejected'>('All');

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Shortlisted': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'Rejected': return 'bg-rose-100 text-rose-600 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const downloadCV = (base64: string, name: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = name || 'CV_MotionMax.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
              <Briefcase size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Talent Acquisition</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase dark:text-white leading-none">Job Applications</h1>
          <p className="text-sm text-slate-500 font-medium mt-3">Review prospective candidate CVs and process recruitment.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group min-w-[300px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
            <input 
              type="text" 
              placeholder="Search applicants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none" 
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApps.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No applications found in the current node.</p>
            </div>
          ) : filteredApps.map(app => (
            <div 
              key={app.id} 
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm transition-all hover:shadow-xl group cursor-pointer ${selectedApp?.id === app.id ? 'ring-4 ring-blue-500/20 border-blue-500' : 'border-slate-100 dark:border-slate-800'}`}
              onClick={() => setSelectedApp(app)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[#002D50] dark:text-white flex items-center justify-center font-black text-xl uppercase border border-slate-100 dark:border-slate-700">
                  {app.fullName[0]}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
              <h3 className="font-black text-base dark:text-white uppercase tracking-tight mb-1 truncate">{app.fullName}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-6">{app.position}</p>
              
              <div className="space-y-3">
                 <div className="flex items-center gap-3 text-xs text-slate-500">
                    <Mail size={14} className="text-slate-300" /> <span className="truncate">{app.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-xs text-slate-500">
                    <Calendar size={14} className="text-slate-300" /> <span>{new Date(app.timestamp).toLocaleDateString()}</span>
                 </div>
              </div>

              <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                <button 
                  onClick={(e) => { e.stopPropagation(); downloadCV(app.cvBase64!, app.cvName!); }}
                  className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                >
                   <FileText size={14} /> Download CV
                </button>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 z-[200] flex justify-end">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedApp(null)} />
           <aside className="relative w-full md:w-[60%] lg:w-[45%] bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
              <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-950 z-10">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-[#002D50] text-white flex items-center justify-center text-3xl font-black uppercase">
                       {selectedApp.fullName[0]}
                    </div>
                    <div>
                       <h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-none">{selectedApp.fullName}</h2>
                       <div className="flex items-center gap-3 mt-2">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusColor(selectedApp.status)}`}>{selectedApp.status}</span>
                          <span className="text-[10px] font-mono text-slate-400">{new Date(selectedApp.timestamp).toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedApp(null)} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl"><XCircle size={32} /></button>
              </header>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                 <section className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Candidate Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400 mb-1">Applied Position</p>
                          <p className="text-sm font-black uppercase tracking-tight">{selectedApp.position}</p>
                       </div>
                       <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400 mb-1">Phone Contact</p>
                          <p className="text-sm font-black uppercase tracking-tight">{selectedApp.phone}</p>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Cover Letter</h3>
                    <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 font-medium italic text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                       "{selectedApp.coverLetter}"
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Attachments</h3>
                    <div className="flex items-center justify-between p-6 bg-[#002D50] rounded-3xl text-white shadow-xl">
                       <div className="flex items-center gap-4">
                          <FileText size={28} />
                          <div>
                             <p className="text-xs font-black uppercase tracking-widest">{selectedApp.cvName || 'Curriculum Vitae'}</p>
                             <p className="text-[9px] font-mono opacity-60">Base64 Binary Document</p>
                          </div>
                       </div>
                       <button 
                        onClick={() => downloadCV(selectedApp.cvBase64!, selectedApp.cvName!)}
                        className="px-6 py-2.5 bg-white text-[#002D50] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-50"
                       >
                          Download CV
                       </button>
                    </div>
                 </section>
              </div>

              <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex gap-4">
                 <button 
                  onClick={() => updateApplicationStatus(selectedApp.id, 'Shortlisted')}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                 >
                    <CheckCircle2 size={16} /> Shortlist Candidate
                 </button>
                 <button 
                  onClick={() => updateApplicationStatus(selectedApp.id, 'Rejected')}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                 >
                    <XCircle size={16} /> Reject Application
                 </button>
              </footer>
           </aside>
        </div>
      )}
    </div>
  );
};
