
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Bell, X, ChevronRight, MessageSquare, Clock, Send, Eye } from 'lucide-react';

export const NoticesSlideOver: React.FC = () => {
  const { isNoticesOpen, toggleNotices, notices, user, replyToNotice, markNoticeAsViewed } = useStore();
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

  return (
    <div className={`fixed inset-0 z-[600] transition-opacity duration-500 ${isNoticesOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
       <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => toggleNotices(false)} />
       <aside className={`absolute inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl transition-transform duration-500 transform flex flex-col border-l border-ghBorder ${isNoticesOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <header className="px-6 py-4 border-b border-ghBorder flex items-center justify-between bg-ghBg sticky top-0 z-20">
             <div className="flex items-center gap-3">
                <Bell size={18} className="text-googleBlue" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-ghText">School Notifications</h3>
             </div>
             <button onClick={() => toggleNotices(false)} className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-500"><X size={20}/></button>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
             {activeNotice ? (
               <div className="space-y-6 animate-in slide-in-from-right duration-300">
                  <button onClick={() => setActiveNoticeId(null)} className="text-[10px] font-bold uppercase text-googleBlue flex items-center gap-1 hover:underline mb-2">
                     <ChevronRight className="rotate-180" size={12}/> View all notifications
                  </button>

                  <section className="gh-box bg-white p-6 space-y-4">
                     <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${activeNotice.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                           {activeNotice.type}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                           <Eye size={10} />
                           {activeNotice.views?.length || 0}
                        </div>
                     </div>

                     <h2 className="text-lg font-bold text-ghText leading-tight">{activeNotice.title}</h2>
                     
                     <p className="text-[13px] font-medium text-slate-600 leading-relaxed bg-ghBg p-4 border-l-4 border-ghBorder italic">
                        "{activeNotice.content}"
                     </p>
                     
                     <div className="pt-4 border-t border-ghBorder flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold">Sent by {activeNotice.authorName}</span>
                        <span className="font-mono">{new Date(activeNotice.timestamp).toLocaleDateString()}</span>
                     </div>
                  </section>

                  <section className="space-y-3 pb-20">
                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-ghBorder pb-2">Comments</h4>
                     <div className="space-y-3">
                        {(activeNotice.replies || []).map((r: any, idx: number) => (
                          <div key={idx} className={`p-4 rounded-md border ${r.userId === user?.id ? 'bg-blue-50/50 border-blue-100' : 'bg-white border-ghBorder'}`}>
                             <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">{r.userName[0]}</div>
                                <span className="text-[11px] font-bold text-ghText">{r.userName}</span>
                                <span className="text-[10px] text-slate-400 ml-auto font-mono">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             </div>
                             <p className="text-[13px] text-slate-600 leading-relaxed italic">"{r.message}"</p>
                          </div>
                        ))}
                     </div>
                  </section>
               </div>
             ) : (
               <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-2">Active Messages</p>
                  {filteredNotices.length > 0 ? filteredNotices.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => setActiveNoticeId(n.id)}
                      className="bg-white border border-ghBorder p-5 rounded-md hover:border-googleBlue transition-all cursor-pointer group shadow-sm"
                    >
                       <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                             <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase border ${n.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                {n.type}
                             </span>
                             {!(n.views || []).some(v => v.userId === user?.id) && (
                               <div className="w-1.5 h-1.5 rounded-full bg-googleBlue animate-pulse"></div>
                             )}
                          </div>
                          <span className="text-[9px] font-mono text-slate-400">{new Date(n.timestamp).toLocaleDateString()}</span>
                       </div>
                       <h4 className="text-[13px] font-bold text-ghText group-hover:text-googleBlue transition-colors leading-tight">{n.title}</h4>
                       <p className="text-[11px] text-slate-500 mt-2 line-clamp-1 opacity-70">"{n.content}"</p>
                       <div className="mt-4 pt-3 border-t border-ghBg flex items-center justify-between text-slate-400">
                          <div className="flex gap-3 text-[10px] font-bold">
                             <span className="flex items-center gap-1"><MessageSquare size={10} /> {n.replies?.length || 0}</span>
                             <span className="flex items-center gap-1"><Eye size={10} /> {n.views?.length || 0}</span>
                          </div>
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-all" />
                       </div>
                    </div>
                  )) : (
                    <div className="py-24 text-center space-y-4 border-2 border-dashed border-ghBorder rounded-lg">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">No messages found.</p>
                    </div>
                  )}
               </div>
             )}
          </div>

          {activeNotice && (
            <footer className="p-4 border-t border-ghBorder bg-ghBg sticky bottom-0">
               <div className="flex gap-2">
                  <textarea 
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 p-2.5 bg-white border border-ghBorder rounded-md text-sm outline-none focus:ring-2 focus:ring-googleBlue/20 resize-none"
                    rows={1}
                  />
                  <button 
                    onClick={handleReply}
                    disabled={!replyText}
                    className="p-2.5 bg-slate-900 text-white rounded-md shadow hover:bg-googleBlue transition-all disabled:opacity-50"
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
