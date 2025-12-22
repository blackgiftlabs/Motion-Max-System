
import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Bell, X, ChevronRight, MessageSquare, Clock, Send, AlertCircle, Calendar } from 'lucide-react';

export const NoticesSlideOver: React.FC = () => {
  const { isNoticesOpen, toggleNotices, notices, user, replyToNotice } = useStore();
  const [activeNoticeId, setActiveNoticeId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

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

  const handleReply = async () => {
    if (!replyText || !activeNoticeId) return;
    await replyToNotice(activeNoticeId, replyText);
    setReplyText('');
  };

  return (
    <div className={`fixed inset-0 z-[600] transition-opacity duration-500 ${isNoticesOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
       <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => toggleNotices(false)} />
       <aside className={`absolute inset-y-0 right-0 w-full md:w-[450px] lg:w-[500px] bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-500 transform flex flex-col ${isNoticesOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-950 z-20">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600">
                   <Bell size={24} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Directive Hub</h3>
             </div>
             <button onClick={() => toggleNotices(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors"><X size={24}/></button>
          </header>

          <div className="flex-1 overflow-y-auto sidebar-scrollbar p-6">
             {activeNotice ? (
               <div className="space-y-8 animate-in slide-in-from-right duration-500">
                  <button onClick={() => setActiveNoticeId(null)} className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-2 hover:underline mb-4">
                     <ChevronRight className="rotate-180" size={14}/> Back to list
                  </button>

                  <section className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                     <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase border ${activeNotice.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                           {activeNotice.type}
                        </span>
                     </div>
                     <h2 className="text-2xl font-black uppercase tracking-tight dark:text-white leading-tight">{activeNotice.title}</h2>
                     <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-6 leading-relaxed italic">"{activeNotice.content}"</p>
                     <p className="text-[9px] font-black text-slate-400 mt-4 uppercase tracking-[0.2em]">Authored by {activeNotice.authorName}</p>
                  </section>

                  <section className="space-y-6 pb-24">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Engagement Feed</h4>
                     <div className="space-y-4">
                        {(activeNotice.replies || []).map((r: any, idx: number) => (
                          <div key={idx} className={`p-6 rounded-[2rem] border transition-all ${r.userId === user?.id ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                             <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black uppercase text-slate-600">{r.userName[0]}</div>
                                   <span className="text-[10px] font-black uppercase tracking-tight dark:text-white">{r.userName}</span>
                                </div>
                             </div>
                             <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed pl-11">{r.message}</p>
                          </div>
                        ))}
                     </div>
                  </section>
               </div>
             ) : (
               <div className="space-y-4">
                  {filteredNotices.length > 0 ? filteredNotices.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => setActiveNoticeId(n.id)}
                      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-blue-500 transition-all cursor-pointer group"
                    >
                       <div className="flex items-center justify-between mb-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase border ${n.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                             {n.type}
                          </span>
                          <span className="text-[8px] font-mono text-slate-400">{new Date(n.timestamp).toLocaleDateString()}</span>
                       </div>
                       <h4 className="text-sm font-black uppercase tracking-tight dark:text-white group-hover:text-blue-600 transition-colors">{n.title}</h4>
                       <p className="text-xs text-slate-500 mt-2 font-medium italic line-clamp-1">"{n.content}"</p>
                       <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{n.replies?.length || 0} Comments</span>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                       </div>
                    </div>
                  )) : (
                    <div className="py-32 text-center space-y-6">
                       <AlertCircle size={48} className="mx-auto text-slate-200" />
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">No directives targeted for this node.</p>
                    </div>
                  )}
               </div>
             )}
          </div>

          {activeNotice && (
            <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 sticky bottom-0">
               <div className="relative">
                  <textarea 
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type response node..."
                    className="w-full p-4 pr-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium outline-none focus:border-blue-500 transition-all resize-none"
                    rows={1}
                  />
                  <button 
                    onClick={handleReply}
                    disabled={!replyText}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg active:scale-95 disabled:opacity-50"
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
