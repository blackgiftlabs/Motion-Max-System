
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
      notify('success', 'Announcement posted successfully.');
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
    setTitle('Reminder: School Fees Payment');
    setContent(`Dear Parents, we noticed that ${studentsWithBalance.length} accounts still have outstanding balances. Please visit the office to update your child's record. Thank you.`);
    setType('Fees');
    setTarget('PARENT');
    notify('success', 'Fee reminder draft created.');
  };

  const handleGenerateMeetingDraft = (group: 'Staff' | 'Teachers') => {
    const isTeachers = group === 'Teachers';
    setTitle(`Important Meeting for ${group}`);
    setContent(`All members of the ${group} team are required to attend a meeting tomorrow at 08:00 AM in the main hall. We will discuss upcoming plans.`);
    setType('Meeting');
    setTarget(isTeachers ? 'SPECIALIST' : 'ADMIN_SUPPORT');
    notify('success', `${group} meeting draft created.`);
  };

  const handleReply = async () => {
    if (!replyText || !selectedNotice) return;
    await replyToNotice(selectedNotice.id, replyText);
    setReplyText('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-ghBorder pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell size={16} className="text-googleBlue" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Communications Portal</span>
          </div>
          <h1 className="text-3xl font-bold text-ghText uppercase tracking-tight">Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">Send messages and updates to parents and staff.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Post Announcement Area */}
        <div className="lg:col-span-8">
          <div className="gh-box bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-ghBg border-b border-ghBorder flex items-center gap-3">
               <MessageSquare size={16} className="text-slate-500" />
               <h3 className="text-xs font-bold uppercase tracking-wide text-ghText">Create New Post</h3>
            </div>
            
            <form onSubmit={handleSend} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Announcement Title</label>
                <input 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="What is this about?" 
                  className="w-full px-4 py-3 bg-white border border-ghBorder rounded-md text-sm outline-none focus:ring-2 focus:ring-googleBlue/20 focus:border-googleBlue transition-all" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Message Category</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value as any)} 
                    className="w-full px-4 py-3 bg-ghBg border border-ghBorder rounded-md text-xs font-bold uppercase outline-none cursor-pointer"
                  >
                    <option value="General">General News</option>
                    <option value="Fees">Money & Fees</option>
                    <option value="Meeting">Meetings</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Who can see this?</label>
                  <select 
                    value={target} 
                    onChange={e => setTarget(e.target.value as any)} 
                    className="w-full px-4 py-3 bg-ghBg border border-ghBorder rounded-md text-xs font-bold uppercase outline-none cursor-pointer"
                  >
                    <option value="ALL">Everyone</option>
                    <option value="PARENT">Parents Only</option>
                    <option value="SPECIALIST">Teachers Only</option>
                    <option value="ADMIN_SUPPORT">Support Staff Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Details</label>
                <textarea 
                  required 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="Write your message here..." 
                  rows={4} 
                  className="w-full px-4 py-3 bg-white border border-ghBorder rounded-md text-sm outline-none focus:ring-2 focus:ring-googleBlue/20 focus:border-googleBlue resize-none" 
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSending} 
                  className="px-8 py-3 bg-slate-900 text-white rounded-md text-xs font-bold uppercase tracking-widest hover:bg-googleBlue transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
                >
                  {isSending ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Post Announcement</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Templates Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="gh-box bg-ghBg p-6 space-y-6">
            <header className="flex items-center gap-2 border-b border-ghBorder pb-4">
               <Sparkles size={16} className="text-amber-500" />
               <h3 className="text-xs font-bold uppercase text-ghText">Quick Drafts</h3>
            </header>

            <div className="space-y-3">
              <button onClick={handleGenerateDraft} className="w-full flex items-center gap-3 p-3 bg-white border border-ghBorder hover:border-googleBlue rounded-md transition-all text-left group">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-md">
                  <DollarSign size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-ghText">Fee Payment Reminder</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">{studentsWithBalance.length} accounts pending</p>
                </div>
              </button>

              <button onClick={() => handleGenerateMeetingDraft('Teachers')} className="w-full flex items-center gap-3 p-3 bg-white border border-ghBorder hover:border-googleBlue rounded-md transition-all text-left group">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-ghText">Teacher Meeting</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Standard invite</p>
                </div>
              </button>

              <button onClick={() => handleGenerateMeetingDraft('Staff')} className="w-full flex items-center gap-3 p-3 bg-white border border-ghBorder hover:border-googleBlue rounded-md transition-all text-left group">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-md">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-ghText">Staff Update</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">General assembly</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message History Table */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <History size={16} className="text-slate-400" />
             <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Previous Messages</h2>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-ghBorder rounded-md text-xs outline-none focus:border-googleBlue w-64"
            />
          </div>
        </div>

        <div className="gh-box bg-white overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-ghBg border-b border-ghBorder text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                       <th className="px-6 py-3">Subject & Content</th>
                       <th className="px-6 py-3">Audience</th>
                       <th className="px-6 py-3">Category</th>
                       <th className="px-6 py-3 text-center">Comments</th>
                       <th className="px-6 py-3 text-right">Date Posted</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-ghBorder">
                    {filteredNotices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching messages found.</p>
                        </td>
                      </tr>
                    ) : filteredNotices.map(notice => (
                      <tr 
                        key={notice.id} 
                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        onClick={() => setSelectedNotice(notice)}
                      >
                         <td className="px-6 py-4">
                            <p className="text-[13px] font-bold text-ghText leading-none">{notice.title}</p>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">"{notice.content}"</p>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-white border border-ghBorder rounded text-slate-600">
                               {notice.target}
                            </span>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                              notice.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                              notice.type === 'Meeting' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                              'bg-ghBg text-slate-600 border-ghBorder'
                            }`}>
                               {notice.type}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                               <MessageSquare size={12} />
                               {notice.replies?.length || 0}
                            </div>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end">
                               <p className="text-[11px] font-mono text-slate-400">{new Date(notice.timestamp).toLocaleDateString()}</p>
                               <ChevronRight size={14} className="text-slate-300 group-hover:text-googleBlue transition-all mt-1" />
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </section>

      {/* Detail View Slide-over */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[500] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedNotice(null)} />
          <aside className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-ghBorder">
            <header className="px-6 py-4 border-b border-ghBorder flex items-center justify-between bg-ghBg sticky top-0 z-10">
              <div>
                <h2 className="text-sm font-bold text-ghText uppercase tracking-wide">Announcement Detail</h2>
              </div>
              <button onClick={() => setSelectedNotice(null)} className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-500"><X size={20} /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div className="gh-box bg-white p-6 space-y-4">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border inline-block ${
                  selectedNotice.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                  selectedNotice.type === 'Meeting' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                  'bg-ghBg text-slate-600 border-ghBorder'
                }`}>
                  {selectedNotice.type}
                </span>
                <h3 className="text-xl font-bold text-ghText leading-tight">{selectedNotice.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium bg-ghBg/50 p-4 border-l-4 border-ghBorder italic">
                  "{selectedNotice.content}"
                </p>
                
                <div className="pt-4 border-t border-ghBorder flex items-center justify-between text-[11px] text-slate-400">
                   <span className="font-bold">Sent by {selectedNotice.authorName}</span>
                   <span className="font-mono">{new Date(selectedNotice.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-ghBorder pb-2">Comments ({selectedNotice.replies?.length || 0})</h4>
                
                <div className="space-y-3">
                  {selectedNotice.replies?.map((r: any, idx: number) => (
                    <div key={idx} className={`p-4 rounded-md border ${r.userId === user?.id ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-ghBorder'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">{r.userName[0]}</div>
                        <span className="text-[11px] font-bold text-ghText">{r.userName}</span>
                        <span className="text-[10px] text-slate-400 ml-auto">{new Date(r.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[13px] text-slate-600 leading-relaxed italic">"{r.message}"</p>
                    </div>
                  ))}
                  {(!selectedNotice.replies || selectedNotice.replies.length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-8 uppercase tracking-widest">No comments yet.</p>
                  )}
                </div>
              </div>
            </div>

            <footer className="p-6 border-t border-ghBorder bg-ghBg">
              <div className="flex gap-2">
                <textarea 
                  value={replyText} 
                  onChange={e => setReplyText(e.target.value)} 
                  placeholder="Write a comment..." 
                  className="flex-1 p-3 bg-white border border-ghBorder rounded-md text-sm outline-none focus:ring-2 focus:ring-googleBlue/20 focus:border-googleBlue resize-none" 
                  rows={1} 
                />
                <button 
                  onClick={handleReply} 
                  disabled={!replyText} 
                  className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-bold uppercase disabled:opacity-50 active:scale-95"
                >
                  Send
                </button>
              </div>
            </footer>
          </aside>
        </div>
      )}
    </div>
  );
};
