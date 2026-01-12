
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Send, MessageSquare, Bell, ChevronRight, X, Clock, DollarSign, Sparkles, Loader2, CheckCircle2, Calendar, Search, History } from 'lucide-react';
import { NoticeType, NoticeTarget } from '../types';

export const AdminNotices: React.FC = () => {
  const { addNotice, notices, user, replyToNotice, students, settings, notify } = useStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoticeType>('General');
  const [target, setTarget] = useState<NoticeTarget>('ALL');
  const [isSending, setIsSending] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const studentsWithBalance = useMemo(() => {
    return students.filter(s => (s.totalPaid || 0) < settings.feesAmount);
  }, [students, settings]);

  const filteredNotices = useMemo(() => {
    return notices.filter(n => 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      n.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notices, searchTerm]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsSending(true);
    try {
      await addNotice(title, content, type, target);
      notify('success', 'Message posted successfully.');
      setTitle('');
      setContent('');
    } catch (err) {
      notify('error', 'Failed to post message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateDraft = () => {
    if (studentsWithBalance.length === 0) {
      notify('info', 'No unpaid balances found.');
      return;
    }
    setTitle('Tuition Fee Reminder');
    setContent(`Hello parents. We found ${studentsWithBalance.length} accounts that still need to pay school fees. Please visit the office soon to update your child's record. Thank you.`);
    setType('Fees');
    setTarget('PARENT');
    notify('success', 'Fee reminder draft created.');
  };

  const handleGenerateMeetingDraft = (group: 'Staff' | 'Teachers') => {
    const isTeachers = group === 'Teachers';
    setTitle(`${group} Meeting Notification`);
    setContent(`All ${group} members must attend a meeting tomorrow morning at 08:00 AM. We will talk about school plans and the new term.`);
    setType('Meeting');
    setTarget(isTeachers ? 'SPECIALIST' : 'ADMIN_SUPPORT');
    notify('success', `${group} meeting draft created.`);
  };

  const handleReply = async () => {
    if (!replyText || !selectedNotice) return;
    await replyToNotice(selectedNotice.id, replyText);
    setReplyText('');
  };

  const scrollToHistory = () => {
    document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20 selection:bg-blue-100 selection:text-blue-900">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bell size={18} className="text-googleBlue" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-googleBlue">Terminal Communications</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Notice Board</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-3 italic">Broadcast official updates to the school node.</p>
        </div>
        <button 
          onClick={scrollToHistory}
          className="flex items-center gap-3 px-8 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm rounded-none active:scale-95"
        >
          <History size={16} /> History Registry
        </button>
      </header>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Area */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-3">
                 <MessageSquare size={14} className="text-googleBlue" /> New Announcement
               </h3>
            </div>
            
            <form onSubmit={handleSend} className="p-8 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Message Title</label>
                <input 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Enter a subject line..." 
                  className="w-full px-6 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-sm font-bold outline-none focus:border-googleBlue focus:ring-4 focus:ring-blue-500/5 transition-all dark:text-white" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Notice Type</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value as any)} 
                    className="w-full px-5 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-[10px] font-black uppercase outline-none cursor-pointer dark:text-white transition-all focus:border-googleBlue focus:ring-4 focus:ring-blue-500/5"
                  >
                    <option value="General">General News</option>
                    <option value="Fees">Tuition & Fees</option>
                    <option value="Meeting">Meeting Alert</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Audience</label>
                  <select 
                    value={target} 
                    onChange={e => setTarget(e.target.value as any)} 
                    className="w-full px-5 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-[10px] font-black uppercase outline-none cursor-pointer dark:text-white transition-all focus:border-googleBlue focus:ring-4 focus:ring-blue-500/5"
                  >
                    <option value="ALL">Everyone</option>
                    <option value="PARENT">Parents Only</option>
                    <option value="SPECIALIST">Teachers Only</option>
                    <option value="ADMIN_SUPPORT">Support Staff Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white ml-1">Message Content</label>
                <textarea 
                  required 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="Type your announcement details here..." 
                  rows={5} 
                  className="w-full px-6 py-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none text-sm font-medium outline-none focus:border-googleBlue focus:ring-4 focus:ring-blue-500/5 resize-none dark:text-white transition-all" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSending} 
                className="w-full py-6 bg-slate-900 dark:bg-blue-600 text-white rounded-none font-black uppercase tracking-[0.3em] text-[11px] hover:bg-googleBlue transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 shadow-xl"
              >
                {isSending ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Post Message Now</>}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Tools Area */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 rounded-none space-y-8 h-full">
            <header>
               <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-amber-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Helper Tools</h3>
               </div>
               <h4 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Quick Drafts</h4>
            </header>

            <div className="space-y-4">
              <button 
                onClick={handleGenerateDraft} 
                className="w-full group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-googleBlue transition-all text-left rounded-none shadow-sm"
              >
                <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-none group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-tight dark:text-white">Fee Reminder</p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">{studentsWithBalance.length} unpaid nodes</p>
                </div>
              </button>

              <button 
                onClick={() => handleGenerateMeetingDraft('Teachers')} 
                className="w-full group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-googleBlue transition-all text-left rounded-none shadow-sm"
              >
                <div className="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-none group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-tight dark:text-white">Teacher Meeting</p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Registry coordination</p>
                </div>
              </button>

              <button 
                onClick={() => handleGenerateMeetingDraft('Staff')} 
                className="w-full group flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-googleBlue transition-all text-left rounded-none shadow-sm"
              >
                <div className="p-3 bg-slate-100 text-slate-600 border border-slate-200 rounded-none group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-tight dark:text-white">Staff Update</p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Admin support draft</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <section id="history-section" className="space-y-6 pt-12 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="flex items-center gap-3">
             <History size={18} className="text-googleBlue" />
             <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Message Registry</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter history..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-[10px] font-black uppercase tracking-widest outline-none focus:border-googleBlue transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <tr>
                       <th className="px-8 py-5">Subject / content</th>
                       <th className="px-8 py-5">Audience</th>
                       <th className="px-8 py-5">Category</th>
                       <th className="px-8 py-5 text-center">Replies</th>
                       <th className="px-8 py-5 text-right">Logged Date</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filteredNotices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                           <Bell size={48} className="mx-auto text-slate-200 mb-4 opacity-50" />
                           <p className="text-[10px] font-black uppercase text-slate-300 italic tracking-widest">No matching registry entries</p>
                        </td>
                      </tr>
                    ) : filteredNotices.map(notice => (
                      <tr 
                        key={notice.id} 
                        className="hover:bg-slate-50/50 dark:hover:bg-blue-900/5 group transition-colors cursor-pointer"
                        onClick={() => setSelectedNotice(notice)}
                      >
                         <td className="px-8 py-6">
                            <p className="text-[11px] font-black uppercase tracking-tight text-slate-950 dark:text-white leading-none">{notice.title}</p>
                            <p className="text-[10px] text-slate-400 mt-2 line-clamp-1 italic">"{notice.content}"</p>
                         </td>
                         <td className="px-8 py-6">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-none border border-slate-200 dark:border-slate-700">
                               {notice.target}
                            </span>
                         </td>
                         <td className="px-8 py-6">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-none border ${
                              notice.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                              notice.type === 'Meeting' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                              'bg-slate-50 text-slate-600 border-slate-100'
                            }`}>
                               {notice.type}
                            </span>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                               <MessageSquare size={12} className="text-slate-300" />
                               <span className="text-[10px] font-black font-mono text-slate-700 dark:text-slate-400">{notice.replies?.length || 0}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <div className="flex flex-col items-end">
                               <p className="text-[10px] font-mono font-bold text-slate-400">{new Date(notice.timestamp).toLocaleDateString()}</p>
                               <ChevronRight size={14} className="text-slate-200 mt-2 group-hover:text-googleBlue group-hover:translate-x-1 transition-all" />
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <div className="p-8 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                 <CheckCircle2 size={16} className="text-emerald-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Database Sync Active</span>
              </div>
              <p className="text-[9px] font-mono text-slate-400 uppercase">{filteredNotices.length} Total Messages Logged</p>
           </div>
        </div>
      </section>

      {/* Detail Slide-over */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[500] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedNotice(null)} />
          <aside className="relative w-full max-w-lg bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 rounded-none border-l border-slate-200 dark:border-slate-800">
            <header className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 sticky top-0 z-10 shadow-sm">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Broadcast Detail</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit Log Node</p>
              </div>
              <button onClick={() => setSelectedNotice(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none text-slate-400 transition-colors"><X size={28} /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 sidebar-scrollbar bg-slate-50/30 dark:bg-slate-950/40">
              <div className="bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 rounded-none shadow-sm">
                <span className={`px-3 py-1 rounded-none text-[9px] font-black uppercase border mb-6 inline-block ${
                  selectedNotice.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                  selectedNotice.type === 'Meeting' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                  'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                  {selectedNotice.type}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{selectedNotice.title}</h3>
                <p className="text-base text-slate-600 dark:text-slate-300 mt-6 leading-relaxed italic border-l-4 border-googleBlue/20 pl-6 py-2 font-medium">"{selectedNotice.content}"</p>
                
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-900 text-white rounded-none flex items-center justify-center font-black text-[10px] uppercase border border-white/10">
                        {selectedNotice.authorName[0]}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">By {selectedNotice.authorName}</span>
                   </div>
                   <span className="text-[10px] font-mono text-slate-400 uppercase">{new Date(selectedNotice.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Replies ({selectedNotice.replies?.length || 0})</h4>
                   <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 mx-4"></div>
                </div>
                
                <div className="space-y-4">
                  {selectedNotice.replies?.map((r: any, idx: number) => (
                    <div key={idx} className={`p-6 rounded-none border transition-all ${r.userId === user?.id ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-none bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200 uppercase">{r.userName[0]}</div>
                          <div>
                             <span className="text-xs font-black dark:text-white uppercase tracking-tight">{r.userName}</span>
                             <p className="text-[8px] text-slate-400 font-mono mt-0.5 uppercase">{new Date(r.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium pl-1 italic">"{r.message}"</p>
                    </div>
                  ))}
                  {(!selectedNotice.replies || selectedNotice.replies.length === 0) && (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-none">
                       <p className="text-[10px] font-black uppercase text-slate-300 italic tracking-widest">No community feedback nodes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <footer className="p-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <div className="relative group">
                <textarea 
                  value={replyText} 
                  onChange={e => setReplyText(e.target.value)} 
                  placeholder="Type a response node..." 
                  className="w-full p-6 pr-28 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-sm font-bold outline-none focus:border-googleBlue focus:bg-white dark:focus:bg-slate-800 transition-all resize-none shadow-inner dark:text-white" 
                  rows={2} 
                />
                <button 
                  onClick={handleReply} 
                  disabled={!replyText} 
                  className="absolute right-4 bottom-4 px-8 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-googleBlue transition-all disabled:opacity-50 active:scale-95"
                >
                  Send Reply
                </button>
              </div>
            </footer>
          </aside>
        </div>
      )}
    </div>
  );
};
