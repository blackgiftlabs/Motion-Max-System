
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Application } from '../types';
import { Mail, Clock, FileText, CheckCircle2, XCircle, ChevronRight, Briefcase, Search, Filter, Calendar, User, ArrowLeft, X } from 'lucide-react';

export const ApplicationsManagement: React.FC = () => {
  const { applications, updateApplicationStatus, notify } = useStore();
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
      case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Shortlisted': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const downloadCV = (base64: string, name: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = name || 'Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-ghBorder pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={16} className="text-googleBlue" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recruitment</span>
          </div>
          <h1 className="text-3xl font-bold text-ghText uppercase tracking-tight">Job Applications</h1>
          <p className="text-sm text-slate-500 mt-2">Manage people who want to join the Motion Max team.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-googleBlue" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-ghBorder rounded-md text-sm outline-none focus:ring-2 focus:ring-googleBlue/20 focus:border-googleBlue transition-all w-64 shadow-sm" 
            />
          </div>
          <div className="flex items-center bg-white border border-ghBorder rounded-md px-3 shadow-sm">
             <Filter size={14} className="text-slate-400 mr-2" />
             <select 
               value={filter} 
               onChange={(e) => setFilter(e.target.value as any)}
               className="py-2 bg-transparent text-xs font-bold uppercase outline-none cursor-pointer text-ghText"
             >
               <option value="All">All Applications</option>
               <option value="Pending">Pending Review</option>
               <option value="Shortlisted">Shortlisted</option>
               <option value="Rejected">Rejected</option>
             </select>
          </div>
        </div>
      </header>

      <div className="gh-box bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-ghBg border-b border-ghBorder text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Applicant Name</th>
                <th className="px-6 py-4">Desired Position</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Date Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ghBorder">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-xs font-bold text-slate-400 uppercase italic tracking-widest">No applications found.</td>
                </tr>
              ) : filteredApps.map(app => (
                <tr 
                  key={app.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedApp(app)}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 border border-ghBorder flex items-center justify-center font-bold text-xs text-slate-600 uppercase">
                        {app.fullName[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-ghText leading-none">{app.fullName}</p>
                        <p className="text-[11px] text-slate-400 mt-1 italic">{app.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{app.position}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <p className="text-[11px] font-mono text-slate-400">{new Date(app.timestamp).toLocaleDateString()}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedApp(null)} />
          <aside className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-ghBorder">
            <header className="px-6 py-4 border-b border-ghBorder flex items-center justify-between bg-ghBg">
              <h2 className="text-xs font-bold text-ghText uppercase">Applicant Details</h2>
              <button onClick={() => setSelectedApp(null)} className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-500"><X size={20}/></button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              <section className="space-y-4">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-slate-100 border border-ghBorder rounded-md flex items-center justify-center text-3xl font-bold text-slate-400 uppercase">
                    {selectedApp.fullName[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-ghText leading-tight">{selectedApp.fullName}</h3>
                    <p className="text-sm font-bold text-googleBlue mt-1 uppercase tracking-widest">{selectedApp.position}</p>
                    <div className="flex items-center gap-3 mt-3">
                       <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${getStatusColor(selectedApp.status)}`}>{selectedApp.status}</span>
                       <span className="text-[10px] font-mono text-slate-400">{new Date(selectedApp.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-ghBg border border-ghBorder rounded-md">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Email Address</p>
                    <p className="text-sm font-bold text-ghText truncate">{selectedApp.email}</p>
                 </div>
                 <div className="p-4 bg-ghBg border border-ghBorder rounded-md">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Phone Number</p>
                    <p className="text-sm font-bold text-ghText">{selectedApp.phone}</p>
                 </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-ghBorder pb-2">Introduction Message</h4>
                <div className="p-6 bg-slate-50 border border-ghBorder italic rounded-md">
                   <p className="text-sm text-slate-600 leading-relaxed font-medium">"{selectedApp.coverLetter}"</p>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-ghBorder pb-2">Resume / CV</h4>
                <button 
                  onClick={() => downloadCV(selectedApp.cvBase64!, selectedApp.cvName!)}
                  className="w-full flex items-center justify-between p-5 bg-white border border-ghBorder rounded-md hover:border-googleBlue group transition-all"
                >
                   <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-50 text-googleBlue rounded">
                         <FileText size={20} />
                      </div>
                      <div className="text-left">
                         <p className="text-xs font-bold text-ghText">{selectedApp.cvName || 'Resume.pdf'}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase">Attached Document</p>
                      </div>
                   </div>
                   <ChevronRight size={16} className="text-slate-300 group-hover:text-googleBlue group-hover:translate-x-1 transition-all" />
                </button>
              </section>
            </div>

            <footer className="p-6 border-t border-ghBorder bg-ghBg grid grid-cols-2 gap-4">
              <button 
                onClick={() => { updateApplicationStatus(selectedApp.id, 'Shortlisted'); setSelectedApp(null); notify('success', 'Candidate shortlisted.'); }}
                className="py-3 bg-emerald-600 text-white rounded-md text-xs font-bold uppercase tracking-widest shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} /> Shortlist
              </button>
              <button 
                onClick={() => { updateApplicationStatus(selectedApp.id, 'Rejected'); setSelectedApp(null); notify('info', 'Application rejected.'); }}
                className="py-3 bg-slate-900 text-white rounded-md text-xs font-bold uppercase tracking-widest shadow-md hover:bg-black transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={16} /> Reject
              </button>
            </footer>
          </aside>
        </div>
      )}
    </div>
  );
};
