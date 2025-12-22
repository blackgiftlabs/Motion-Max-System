
import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Send, MessageSquare, Bell, ChevronRight, X, Clock, AlertCircle, DollarSign, Sparkles, Loader2, Users, CheckCircle2, Calendar } from 'lucide-react';
import { NoticeType, NoticeTarget } from '../types';

export const AdminNotices: React.FC = () => {
  const { addNotice, notices, user, replyToNotice, students, settings, parents, notify } = useStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoticeType>('General');
  const [target, setTarget] = useState<NoticeTarget>('ALL');
  const [isSending, setIsSending] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const formRef = useRef<HTMLDivElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  // Helper: Calculate outstanding fee metrics for drafts
  const studentsWithBalance = useMemo(() => {
    return students
      .filter(s => (s.totalPaid || 0) < settings.feesAmount)
      .map(s => ({
        ...s,
        balance: settings.feesAmount - (s.totalPaid || 0)
      }));
  }, [students, settings]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsSending(true);
    try {
      await addNotice(title, content, type, target);
      notify('success', 'Message sent to the board.');
      setTitle('');
      setContent('');
    } catch (err) {
      notify('error', 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const scrollToForm = () => {
    setTimeout(() => {
      submitBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleGenerateDraft = () => {
    if (studentsWithBalance.length === 0) {
      notify('info', 'No outstanding balances found.');
      return;
    }
    setTitle('Outstanding Fee Reminder');
    setContent(`This is a friendly notification from the school office. Records show there is an outstanding terminal fee balance for ${studentsWithBalance.length} students. Please ensure your child's ledger is synced at the reception office. Thank you.`);
    setType('Fees');
    setTarget('PARENT');
    notify('success', 'Fee draft generated.');
    scrollToForm();
  };

  const handleGenerateMeetingDraft = (group: 'Staff' | 'Teachers') => {
    const isTeachers = group === 'Teachers';
    setTitle(`Mandatory ${group} Meeting`);
    setContent(`Attention all ${isTeachers ? 'Teachers' : 'Support Staff'}. A coordination meeting is scheduled for tomorrow at 08:00 AM in the Staff Room. We will be discussing the current term and school events. Please be on time.`);
    setType('Meeting');
    setTarget(isTeachers ? 'SPECIALIST' : 'ADMIN_SUPPORT');
    notify('success', `${group} meeting draft generated.`);
    scrollToForm();
  };

  const handleReply = async () => {
    if (!replyText || !selectedNotice) return;
    await replyToNotice(selectedNotice.id, replyText);
    setReplyText('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Notice Board</h1>
          <p className="text-sm text-slate-500 font-medium mt-1 italic">Post updates for parents, teachers, and staff.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          {/* Smart Tool: Fee Draft */}
          <div className="bg-[#002D50] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <DollarSign size={180} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-blue-400 rounded-2xl text-[#002D50] shadow-lg shadow-blue-400/20">
                    <Sparkles size={20} />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-300">Quick Drafts</span>
              </div>
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">Fee Reminder</h2>
                 <p className="text-sm text-blue-100/60 mt-3 font-medium leading-relaxed italic">
                    Found <b>{studentsWithBalance.length}</b> parents who still need to pay.
                 </p>
              </div>
              <button onClick={handleGenerateDraft} className="w-full py-5 bg-white text-[#002D50] rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-3">
                <MessageSquare size={18} />
                <span>Create Fee Notice</span>
              </button>
            </div>
          </div>

          {/* Smart Tool: Meeting Draft */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700 text-blue-500">
               <Calendar size={180} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                    <Clock size={20} />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400">Meeting Planner</span>
              </div>
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">Meeting Alert</h2>
                 <p className="text-sm text-slate-400 mt-3 font-medium leading-relaxed italic">
                    Instantly draft meetings for your specific teams.
                 </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleGenerateMeetingDraft('Teachers')} className="py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] shadow-xl hover:bg-blue-700 transition-all active:scale-95">
                  Teachers Only
                </button>
                <button onClick={() => handleGenerateMeetingDraft('Staff')} className="py-4 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] shadow-xl hover:bg-slate-700 transition-all active:scale-95 border border-white/10">
                  Staff Only
                </button>
              </div>
            </div>
          </div>

          {/* Posting Form */}
          <div ref={formRef} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-3 dark:text-white">
              <MessageSquare size={18} className="text-blue-600" /> New Announcement
            </h3>
            
            <form onSubmit={handleSend} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. End of Year Party" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Type</label>
                  <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black uppercase outline-none cursor-pointer dark:text-white">
                    <option value="General">News</option>
                    <option value="Fees">Fees</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Audience</label>
                  <select value={target} onChange={e => setTarget(e.target.value as any)} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black uppercase outline-none cursor-pointer dark:text-white">
                    <option value="ALL">Everyone</option>
                    <option value="PARENT">Parents Only</option>
                    <option value="SPECIALIST">Teachers Only</option>
                    <option value="ADMIN_SUPPORT">Staff Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Message</label>
                <textarea required value={content} onChange={e => setContent(e.target.value)} placeholder="Type your message details..." rows={5} className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 resize-none dark:text-white transition-all" />
              </div>

              <button ref={submitBtnRef} type="submit" disabled={isSending} className="w-full py-5 bg-[#002D50] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 shadow-xl">
                {isSending ? <Loader2 className="animate-spin" size={18} /> : <><Bell size={18} /> Post to Board</>}
              </button>
            </form>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                <Clock size={14} /> History
             </h3>
             <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase">{notices.length} Posts Total</span>
          </div>
          
          <div className="space-y-4">
            {notices.length > 0 ? notices.map(n => (
              <div 
                key={n.id} 
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm hover:border-blue-400 transition-all cursor-pointer group" 
                onClick={() => setSelectedNotice(n)}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${n.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : n.type === 'Meeting' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {n.type}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">For: {n.target}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{new Date(n.timestamp).toLocaleDateString()}</span>
                </div>
                
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{n.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic leading-relaxed font-medium">"{n.content}"</p>
                
                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                       <MessageSquare size={16} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">{n.replies?.length || 0} Replies</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-32 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Bell size={64} className="mx-auto text-slate-200 mb-6" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] italic">No active notices.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Engagement Detail (Slide Over) */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[500] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedNotice(null)} />
          <aside className="relative w-full max-w-lg bg-white dark:bg-slate-950 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
            <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 sticky top-0 z-10 shadow-sm">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Notice Detail</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live View</p>
              </div>
              <button onClick={() => setSelectedNotice(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors"><X size={28} /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 sidebar-scrollbar bg-slate-50/30 dark:bg-slate-950/40">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border mb-6 inline-block ${selectedNotice.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : selectedNotice.type === 'Meeting' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                  {selectedNotice.type}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{selectedNotice.title}</h3>
                <p className="text-base text-slate-600 dark:text-slate-300 mt-6 leading-relaxed italic border-l-4 border-blue-100 dark:border-blue-900 pl-6 py-2">"{selectedNotice.content}"</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Replies ({selectedNotice.replies?.length || 0})</h4>
                   <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 mx-4"></div>
                </div>
                
                <div className="space-y-4">
                  {selectedNotice.replies?.map((r: any, idx: number) => (
                    <div key={idx} className={`p-6 rounded-[2rem] border transition-all ${r.userId === user?.id ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-black text-blue-600 shadow-sm border border-white dark:border-slate-700 uppercase">{r.userName[0]}</div>
                          <div>
                             <span className="text-xs font-black dark:text-white uppercase tracking-tight">{r.userName}</span>
                             <p className="text-[9px] text-slate-400 font-mono mt-0.5">{new Date(r.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium pl-1">{r.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
              <div className="relative">
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." className="w-full p-6 pr-28 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all resize-none shadow-inner dark:text-white" rows={2} />
                <button onClick={handleReply} disabled={!replyText} className="absolute right-4 bottom-4 px-8 py-3 bg-[#002D50] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all disabled:opacity-50 active:scale-95">
                  Reply
                </button>
              </div>
            </footer>
          </aside>
        </div>
      )}
    </div>
  );
};
