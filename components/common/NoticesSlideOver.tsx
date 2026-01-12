
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Bell, X, ChevronRight, MessageSquare, Clock, Send, AlertCircle, Calendar, Eye, User } from 'lucide-react';
import { Notice } from '../../types';

export const NoticesSlideOver: React.FC = () => {
  const { isNoticesOpen, toggleNotices, notices, user, replyToNotice, markNoticeAsViewed } = useStore();
  const [activeNoticeId, setActiveNoticeId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showViewers, setShowViewers] = useState(false);

  const filteredNotices = useMemo(() => {
    if (!user) return [];
    return notices.filter(n => 
      n.target === 'ALL' || n.target === user.role || (user.role === 'SUPER_ADMIN')
    );
  }, [notices, user]);

  const activeNotice = useMemo(() => 
    filteredNotices.find(n => n.id === activeNoticeId),
    [activeNoticeId, filteredNotices]
  );

  // Mark notice as viewed when opened
  useEffect(() => {
    if (activeNoticeId) {
      markNoticeAsViewed(activeNoticeId);
    }
  }, [activeNoticeId]);

  const handleReply = async () => {
    if (!replyText || !activeNoticeId) return;
    await replyToNotice(activeNoticeId, replyText);
    setReplyText('');
  };

  const formatExactTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className={`fixed inset-0 z-[600] transition-opacity duration-500 selection:bg-blue-100 ${isNoticesOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
       <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => toggleNotices(false)} />
       <aside className={`absolute inset-y-0 right-0 w-full md:w-[450px] lg:w-[500px] bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-500 transform flex flex-col rounded-none border-l border-slate-200 dark:border-slate-800 ${isNoticesOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-950 z-20 rounded-none">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-none text-blue-600 border border-blue-100">
                   <Bell size={24} />
                </div>
                <div>
                   <h3 className="text-base font-black uppercase tracking-tight dark:text-white">Notices from the administration</h3>
                   <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Official broadcast channel</p>
                </div>
             </div>
             <button onClick={() => toggleNotices(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none text-slate-400 transition-colors"><X size={24}/></button>
          </header>

          <div className="flex-1 overflow-y-auto sidebar-scrollbar p-6">
             {activeNotice ? (
               <div className="space-y-8 animate-in slide-in-from-right duration-500">
                  <button onClick={() => { setActiveNoticeId(null); setShowViewers(false); }} className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2 hover:underline mb-4">
                     <ChevronRight className="rotate-180" size={14}/> Back to all notices
                  </button>

                  <section className="bg-slate-50 dark:bg-slate-900 p-8 rounded-none border border-slate-200 dark:border-slate-800 shadow-sm relative">
                     <div className="flex items-center justify-between mb-6">
                        <span className={`px-3 py-1 rounded-none text-[8px] font-black uppercase border ${activeNotice.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                           {activeNotice.type}
                        </span>
                        <div className="relative">
                           <button 
                             onClick={() => setShowViewers(!showViewers)}
                             className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none text-[8px] font-black uppercase text-slate-500 hover:text-blue-600 transition-all shadow-sm"
                           >
                             <Eye size={12} />
                             {activeNotice.views?.length || 0} Views
                           </button>
                           
                           {showViewers && (
                             <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-4 animate-in fade-in slide-in-from-top-1">
                                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                   <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Seen by:</span>
                                   <button onClick={() => setShowViewers(false)}><X size={12}/></button>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                   {(activeNotice.views || []).map((v, i) => (
                                     <div key={i} className="flex flex-col gap-0.5 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                           <div className="w-5 h-5 bg-blue-600 text-white flex items-center justify-center text-[7px] font-black rounded-none shrink-0 uppercase">{v.userName[0]}</div>
                                           <span className="text-[9px] font-black uppercase text-slate-700 dark:text-slate-300 truncate">{v.userName}</span>
                                        </div>
                                        <span className="text-[7px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">Viewed at {formatExactTime(v.timestamp)}</span>
                                     </div>
                                   ))}
                                   {(!activeNotice.views || activeNotice.views.length === 0) && (
                                     <p className="text-[8px] text-slate-400 italic text-center py-4 uppercase">Awaiting activity nodes...</p>
                                   )}
                                </div>
                             </div>
                           )}
                        </div>
                     </div>

                     <h2 className="text-2xl font-black uppercase tracking-tight dark:text-white leading-[1.1]">{activeNotice.title}</h2>
                     <div className="flex items-center gap-2 mt-2 mb-8">
                        <Clock size={12} className="text-slate-300" />
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Logged at {formatExactTime(activeNotice.timestamp)} on {formatDate(activeNotice.timestamp)}</span>
                     </div>
                     
                     <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-4 border-blue-100 dark:border-blue-900/50 pl-6 py-2">
                        "{activeNotice.content}"
                     </p>
                     
                     <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-950 dark:bg-slate-800 text-white flex items-center justify-center font-black text-[10px] rounded-none border border-white/10 uppercase">
                           {activeNotice.authorName[0]}
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Authorized Source</p>
                           <p className="text-xs font-black uppercase dark:text-white">{activeNotice.authorName}</p>
                        </div>
                     </div>
                  </section>

                  <section className="space-y-6 pb-24">
                     <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                           <MessageSquare size={14} /> Community Feed
                        </h4>
                        <span className="text-[9px] font-mono font-bold text-blue-600">{activeNotice.replies?.length || 0} MESSAGES</span>
                     </div>
                     <div className="space-y-4">
                        {(activeNotice.replies || []).map((r: any, idx: number) => (
                          <div key={idx} className={`p-6 rounded-none border transition-all ${r.userId === user?.id ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-7 h-7 rounded-none bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black uppercase text-slate-600 border border-slate-300 dark:border-slate-700">{r.userName[0]}</div>
                                   <div>
                                      <span className="text-[10px] font-black uppercase tracking-tight dark:text-white">{r.userName}</span>
                                      <p className="text-[8px] font-mono text-slate-400 mt-0.5 uppercase">{formatExactTime(r.timestamp)}</p>
                                   </div>
                                </div>
                             </div>
                             <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">"{r.message}"</p>
                          </div>
                        ))}
                     </div>
                  </section>
               </div>
             ) : (
               <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2">Available Messages</p>
                  {filteredNotices.length > 0 ? filteredNotices.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => setActiveNoticeId(n.id)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-none shadow-sm hover:shadow-xl hover:border-blue-500 transition-all cursor-pointer group relative overflow-hidden"
                    >
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                             <span className={`px-2 py-0.5 rounded-none text-[7px] font-black uppercase border ${n.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                {n.type}
                             </span>
                             {!(n.views || []).some(v => v.userId === user?.id) && (
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                             )}
                          </div>
                          <div className="flex items-center gap-3">
                             <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">{formatExactTime(n.timestamp)}</span>
                          </div>
                       </div>
                       <h4 className="text-sm font-black uppercase tracking-tight dark:text-white group-hover:text-blue-600 transition-colors leading-tight">{n.title}</h4>
                       <p className="text-xs text-slate-500 mt-3 font-medium italic line-clamp-1 opacity-70">"{n.content}"</p>
                       <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex gap-4">
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><MessageSquare size={10} /> {n.replies?.length || 0}</span>
                             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Eye size={10} /> {n.views?.length || 0}</span>
                          </div>
                          <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                       </div>
                    </div>
                  )) : (
                    <div className="py-32 text-center space-y-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-none">
                       <AlertCircle size={48} className="mx-auto text-slate-200" />
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">No notices found in database.</p>
                    </div>
                  )}
               </div>
             )}
          </div>

          {activeNotice && (
            <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 sticky bottom-0 rounded-none">
               <div className="relative group">
                  <textarea 
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a reply message..."
                    className="w-full p-4 pr-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-sm font-bold outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none shadow-inner dark:text-white"
                    rows={1}
                  />
                  <button 
                    onClick={handleReply}
                    disabled={!replyText}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-none shadow-lg active:scale-95 disabled:opacity-50"
                  >
                     <Send size={14} />
                  </button>
               </div>
            </footer>
          )}
       </aside>
    </div>
  );
};
