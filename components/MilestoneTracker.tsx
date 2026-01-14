
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  HeartPulse, Brain, ChevronRight, CheckCircle2, 
  AlertCircle, History, ArrowLeft, Save, Loader2, 
  Activity, Clock, Play, Layers, User, Calendar, X
} from 'lucide-react';
import { Student, MilestoneRecord, MilestoneItem } from '../types';
import { getHarareISOString } from '../utils/dateUtils';

// ECDC Milestone Data Definitions
const MILESTONE_TEMPLATES = [
  {
    id: '1-3m',
    label: '1 to 3 Months',
    sections: [
      { title: 'Movement', items: ['Raises head and cheek when lying on stomach (3 mos.)', 'Supports upper body with arms when lying on stomach (3 mos.)', 'Stretches legs out when lying on stomach or back (2-3 mos.)', 'Opens and shuts hands (2-3 mos.)', 'Pushes down on his legs when his feet are placed on firm surface (3 mos.)'] },
      { title: 'Visual', items: ['Watches face intently (2-3 mos.)', 'Follows moving objects (2 mos.)', 'Recognizes familiar objects and people at a distance (3 mos.)', 'Starts using hands and eyes in coordination (3 mos.)'] },
      { title: 'Hearing and Speech', items: ['Smiles at the sound of voice (2-3 mos.)', 'Cooing noises; vocal play (begins at 3 mos.)', 'Attends to sound (1-3 mos.)', 'Startles to loud noise (1-3 mos.)'] },
      { title: 'Social/Emotional', items: ['Begins to develop a social smile (1-3 mos.)', 'Enjoys playing with other people and may cry when playing stops (2-3 mos.)', 'Becomes more communicative and expressive with face and body (2-3 mos.)', 'Imitates some movements and facial expressions'] }
    ],
    redFlags: ['Doesn’t seem to respond to loud noises', 'Doesn’t follow moving objects with eyes by 2 to 3 months', 'Doesn’t smile at the sound of your voice by 2 months', 'Doesn’t grasp and hold objects by 3 months', 'Doesn’t smile at people by 3 months', 'Cannot support head well at 3 months']
  },
  {
    id: '4-7m',
    label: '4 to 7 Months',
    sections: [
      { title: 'Movement', items: ['Pushes up on extended arms (5 mos.)', 'Pulls to sitting with no head lag (5 mos.)', 'Sits with support of his hands (5-6 mos.)', 'Sits unsupported for short periods (6-8 mos.)', 'Supports whole weight on legs (6-7 mos.)', 'Grasps feet (6 mos.)', 'Transfers objects from hand to hand (6-7 mos.)', 'Uses raking grasp (6 mos.)'] },
      { title: 'Visual', items: ['Looks for toy beyond tracking range (5-6 mos.)', 'Tracks moving objects with ease (4-7 mos.)', 'Grasps objects dangling in front of him (5-6 mos.)', 'Looks for fallen toys (5-7 mos.)'] },
      { title: 'Language', items: ['Distinguishes emotions by tone of voice (4-7 mos.)', 'Responds to sound by making sounds (4-6 mos.)', 'Uses voice to express joy and displeasure (4-6 mos.)', 'Syllable repetition begins (5-7 mos.)'] },
      { title: 'Cognitive', items: ['Finds partially hidden objects (6-7 mos.)', 'Explores with hands and mouth (4-7 mos.)', 'Struggles to get objects that are out of reach (5-7 mos.)'] }
    ],
    redFlags: ['Seems very stiff, tight muscles', 'Seems very floppy, like a rag doll', 'Head still flops back when body is pulled to sitting', 'Shows no affection for the person who cares for them', 'Does not turn head to locate sounds by 4 months']
  },
  {
    id: '8-12m',
    label: '8 to 12 Months',
    sections: [
      { title: 'Movement', items: ['Gets to sitting position without assistance (8-10 mos.)', 'Crawls forward on belly', 'Creeps on hands and knees', 'Walks holding on to furniture', 'Stands momentarily without support'] },
      { title: 'Language', items: ['Responds to simple verbal requests', 'Responds to “no”', 'Makes simple gestures such as shaking head', 'Babbles with inflection (8-10 mos.)', 'Says “dada” and “mama” for specific person (11-12 mos.)'] },
      { title: 'Cognitive', items: ['Explores objects in many ways (shaking, banging)', 'Finds hidden objects easily (10-12 mos.)', 'Looks at correct picture when named', 'Imitates gestures (9-12 mos.)'] }
    ],
    redFlags: ['Does not crawl', 'Cannot stand when supported', 'Does not search for objects that are hidden', 'Says no single words', 'Does not sit steadily by 10 months']
  },
  {
    id: '1-2y',
    label: '12 to 24 Months',
    sections: [
      { title: 'Movement', items: ['Walks alone (12-16 mos.)', 'Pulls toys behind him while walking', 'Begins to run stiffly (16-18 mos.)', 'Walks into ball (18-24 mos.)', 'Climbs onto/down from furniture unsupported'] },
      { title: 'Language', items: ['Points to object/picture when named', 'Recognizes names of familiar people', 'Says several single words (15-18 mos.)', 'Uses two-word sentences (18-24 mos.)'] },
      { title: 'Cognitive', items: ['Finds objects hidden under 2 or 3 covers', 'Begins to sort shapes and colors', 'Begins make-believe play'] }
    ],
    redFlags: ['Cannot walk by 18 months', 'Fails to develop heel-toe walking pattern', 'Does not speak at least 15 words by 18 months', 'Does not follow simple instructions by 24 mos.']
  },
  {
    id: '2-3y',
    label: '24 to 36 Months',
    sections: [
      { title: 'Movement', items: ['Climbs well (24-30 mos.)', 'Walks down stairs alone, placing both feet', 'Walks up stairs alternating feet', 'Swings leg to kick ball', 'Pedals tricycle (30-36 mos.)'] },
      { title: 'Hand Skills', items: ['Makes vertical, horizontal, circular strokes', 'Turns book pages one at a time', 'Builds tower of more than 6 blocks', 'Turns rotating handles'] },
      { title: 'Language', items: ['Understands most sentences (24-40 mos.)', 'Understands physical relationships (on, in, under)', 'Can say name, age, and sex'] }
    ],
    redFlags: ['Frequent falling and difficulty with stairs', 'Persistent drooling or unclear speech', 'Inability to build tower of more than 4 blocks', 'Extreme difficulty separating from primary caregiver']
  }
];

export const MilestoneTracker: React.FC = () => {
  const { students, selectedStudentIdForLog, setSelectedStudentIdForLog, saveMilestoneRecord } = useStore();
  const [activeTemplateId, setActiveTemplateId] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [localData, setLocalData] = useState<any>(null);

  const student = students.find(s => s.id === selectedStudentIdForLog);

  // Chrono-Logic for CAT Time
  const currentAgeInMonths = useMemo(() => {
    if (!student?.dob) return 0;
    const dob = new Date(student.dob);
    const now = new Date(); // Browser local, but we just need month diff
    return (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  }, [student]);

  // Determine Intelligent Focus Card
  useEffect(() => {
    if (!activeTemplateId) {
      if (currentAgeInMonths <= 3) setActiveTemplateId('1-3m');
      else if (currentAgeInMonths <= 7) setActiveTemplateId('4-7m');
      else if (currentAgeInMonths <= 12) setActiveTemplateId('8-12m');
      else if (currentAgeInMonths <= 24) setActiveTemplateId('1-2y');
      else setActiveTemplateId('2-3y');
    }
  }, [currentAgeInMonths]);

  // Initialize Local Checklist Data
  useEffect(() => {
    const template = MILESTONE_TEMPLATES.find(t => t.id === activeTemplateId);
    if (template) {
      setLocalData({
        sections: template.sections.map(s => ({
          title: s.title,
          items: s.items.map(text => ({ id: Math.random().toString(36).substr(2, 9), text, checked: false }))
        })),
        redFlags: template.redFlags.map(text => ({ id: Math.random().toString(36).substr(2, 9), text, checked: false }))
      });
    }
  }, [activeTemplateId]);

  const toggleItem = (sectionIdx: number, itemIdx: number) => {
    const newData = { ...localData };
    newData.sections[sectionIdx].items[itemIdx].checked = !newData.sections[sectionIdx].items[itemIdx].checked;
    setLocalData(newData);
  };

  const toggleRedFlag = (idx: number) => {
    const newData = { ...localData };
    newData.redFlags[idx].checked = !newData.redFlags[idx].checked;
    setLocalData(newData);
  };

  const calculateCompletion = () => {
    if (!localData) return 0;
    const allItems = localData.sections.flatMap((s: any) => s.items);
    const checked = allItems.filter((i: any) => i.checked).length;
    return Math.round((checked / allItems.length) * 100);
  };

  const handleSync = async () => {
    if (!student || !localData) return;
    setIsSyncing(true);
    try {
      const template = MILESTONE_TEMPLATES.find(t => t.id === activeTemplateId);
      await saveMilestoneRecord({
        studentId: student.id,
        ageCategory: template?.label || activeTemplateId,
        sections: localData.sections,
        redFlags: localData.redFlags,
        overallPercentage: calculateCompletion(),
        timestamp: getHarareISOString()
      });
      setSelectedStudentIdForLog(null);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!student) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <button 
            onClick={() => setSelectedStudentIdForLog(null)}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"
           >
             <ArrowLeft size={20} />
           </button>
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-[2rem] bg-brandNavy text-white flex items-center justify-center text-2xl font-black shadow-xl">
                 {student.fullName[0]}
              </div>
              <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Clinical Node Assessment</span>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 </div>
                 <h1 className="text-2xl font-black uppercase tracking-tight dark:text-white leading-none">{student.fullName}</h1>
                 <p className="text-[10px] font-mono text-slate-400 mt-2 uppercase">ID: {student.id} // AGE: {currentAgeInMonths} MONTHS</p>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
              <div className="text-right">
                 <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">CAT Terminal Time</p>
                 <p className="text-xs font-mono font-bold dark:text-white">
                    {new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Harare' }).format(new Date())}
                 </p>
              </div>
              <Clock size={20} className="text-blue-500" />
           </div>
           <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="px-8 py-3.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
           >
             {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Sync to Database</>}
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Focused Checklist Card (Large Player View) */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-brandNavy to-blue-500"></div>
              
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-600/20">
                       <Play size={40} className="fill-current" />
                    </div>
                    <div>
                       <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-3 block">Now Tracking Milestone</h3>
                       <h4 className="text-4xl font-black uppercase tracking-tight dark:text-white leading-tight">
                         {MILESTONE_TEMPLATES.find(t => t.id === activeTemplateId)?.label}
                       </h4>
                    </div>
                 </div>
                 <div className="flex items-center gap-6 bg-white dark:bg-slate-950 px-8 py-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Mastery Score</p>
                       <p className="text-4xl font-black font-mono text-blue-600">{calculateCompletion()}%</p>
                    </div>
                    <Activity size={32} className="text-blue-500" />
                 </div>
              </div>

              <div className="p-10 space-y-12 max-h-[600px] overflow-y-auto sidebar-scrollbar">
                 {localData?.sections.map((section: any, sIdx: number) => (
                   <section key={section.title} className="space-y-6">
                      <div className="flex items-center gap-4">
                         <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800">
                           {section.title}
                         </h5>
                         <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {section.items.map((item: any, iIdx: number) => (
                           <button 
                            key={item.id}
                            onClick={() => toggleItem(sIdx, iIdx)}
                            className={`flex items-start gap-4 p-5 rounded-3xl border transition-all text-left group ${item.checked ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/10' : 'bg-slate-50 dark:bg-slate-950 border-transparent hover:border-blue-500'}`}
                           >
                              <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                                 {item.checked && <CheckCircle2 size={16} />}
                              </div>
                              <span className={`text-[13px] font-bold leading-relaxed transition-colors ${item.checked ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                 {item.text}
                              </span>
                           </button>
                         ))}
                      </div>
                   </section>
                 ))}

                 <section className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-[3rem] p-10 space-y-8">
                    <div className="flex items-center justify-between">
                       <h5 className="text-xl font-black uppercase tracking-tight text-rose-600 flex items-center gap-3">
                          <AlertCircle size={28} /> Developmental Red Flags
                       </h5>
                       <span className="text-[8px] font-black uppercase bg-rose-600 text-white px-3 py-1 rounded-full tracking-widest shadow-lg">Observation Only</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {localData?.redFlags.map((flag: any, fIdx: number) => (
                         <button 
                          key={flag.id}
                          onClick={() => toggleRedFlag(fIdx)}
                          className={`flex items-start gap-4 p-5 rounded-3xl border-2 transition-all text-left group ${flag.checked ? 'bg-rose-100 border-rose-500' : 'bg-white dark:bg-slate-900 border-dashed border-rose-200 dark:border-rose-800'}`}
                         >
                            <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${flag.checked ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white dark:bg-slate-800 border-rose-100 dark:border-rose-700'}`}>
                               {flag.checked && <X size={16} />}
                            </div>
                            <span className={`text-[13px] font-bold leading-relaxed ${flag.checked ? 'text-rose-700 dark:text-rose-400' : 'text-rose-400 dark:text-rose-500'}`}>
                               {flag.text}
                            </span>
                         </button>
                       ))}
                    </div>
                 </section>
              </div>
           </div>
        </div>

        {/* Templates Sidebar (YouTube Recommendation Style) */}
        <div className="lg:col-span-4 space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2 ml-2">
              <Layers size={14} /> Checklist Matrix
           </h3>
           <div className="space-y-4">
              {MILESTONE_TEMPLATES.map(template => {
                const isActive = activeTemplateId === template.id;
                const isRecommended = (template.id === '1-3m' && currentAgeInMonths <= 3) ||
                                    (template.id === '4-7m' && currentAgeInMonths > 3 && currentAgeInMonths <= 7) ||
                                    (template.id === '8-12m' && currentAgeInMonths > 7 && currentAgeInMonths <= 12) ||
                                    (template.id === '1-2y' && currentAgeInMonths > 12 && currentAgeInMonths <= 24) ||
                                    (template.id === '2-3y' && currentAgeInMonths > 24);

                return (
                  <button 
                    key={template.id}
                    onClick={() => setActiveTemplateId(template.id)}
                    className={`w-full group flex items-start gap-4 p-4 rounded-3xl border transition-all text-left ${isActive ? 'bg-blue-600 border-blue-600 shadow-xl scale-105 z-10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-lg'}`}
                  >
                    <div className={`w-28 h-20 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center flex-shrink-0 border-2 ${isActive ? 'bg-white border-white/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                       <Brain size={28} className={isActive ? 'text-blue-600' : 'text-slate-300'} />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                       <div className="flex items-center gap-2 mb-1">
                          {isRecommended && <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${isActive ? 'bg-white text-blue-600' : 'bg-emerald-500 text-white'}`}>Recommended</span>}
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>Template ID: {template.id}</span>
                       </div>
                       <h5 className={`font-black text-sm uppercase tracking-tight truncate ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{template.label}</h5>
                       <p className={`text-[10px] font-medium mt-1 truncate ${isActive ? 'text-blue-100/60' : 'text-slate-400'}`}>
                         {template.sections.length} Category Clusters
                       </p>
                    </div>
                  </button>
                );
              })}
           </div>

           <div className="bg-brandNavy rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-125 transition-transform duration-1000">
                 <History size={160} />
              </div>
              <div className="relative z-10">
                 <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-6">Archive Access</h4>
                 <div className="space-y-4">
                    <p className="text-sm font-medium leading-relaxed italic opacity-80">
                       "All marks made here are synced to the parent dashboard. Percentages are calculated per developmental block."
                    </p>
                    <button 
                      onClick={() => setSelectedStudentIdForLog(null)}
                      className="w-full py-4 bg-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                    >
                       View All Records
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
