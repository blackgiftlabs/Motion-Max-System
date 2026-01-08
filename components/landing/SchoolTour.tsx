
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  ArrowRight, 
  Map, 
  BookOpen, 
  Calendar, 
  ShoppingBag, 
  ChevronRight,
  Star,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  CheckCircle2,
  Camera,
  Info
} from 'lucide-react';

const HeroBg = "https://i.ibb.co/BHrbSN6Y/groupphoto.jpg";

const TourHeroSection = ({ title, desc, images, items, reverse, onImageClick, theme = 'light' }: any) => {
  const [activeImage, setActiveImage] = useState(images[0]);
  const isDark = theme === 'dark';

  return (
    <section className={`py-24 md:py-32 ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'} transition-colors duration-500 overflow-hidden border-b border-slate-100 dark:border-slate-800`}>
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 lg:gap-24 items-center`}>
          
          {/* Text Content Area */}
          <div className="flex-1 space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-500">
                <Camera size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Facility Spotlight</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                {title.split(' ').map((word: string, i: number) => (
                  <span key={i} className={i === 1 ? 'text-blue-600 block' : ''}>{word} </span>
                ))}
              </h2>
              <p className={`text-lg md:text-xl font-medium italic leading-relaxed max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {desc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item: string, i: number) => (
                <div key={i} className={`flex items-start gap-4 p-5 border rounded-none transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                   <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                   <span className="text-xs font-bold uppercase tracking-tight">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button 
                onClick={() => onImageClick(images, images.indexOf(activeImage))}
                className={`group flex items-center gap-4 px-8 py-4 rounded-none font-black uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95 ${isDark ? 'bg-white text-black hover:bg-blue-600 hover:text-white' : 'bg-black text-white hover:bg-blue-600'}`}
              >
                View Full Gallery <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          {/* Visual Gallery Area */}
          <div className="flex-1 w-full space-y-6">
            <div className="relative group cursor-pointer" onClick={() => onImageClick(images, images.indexOf(activeImage))}>
              {/* Decorative background blocks */}
              <div className="absolute -inset-4 bg-blue-600 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"></div>
              
              <div className="relative z-10 aspect-[4/3] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-8 border-white dark:border-slate-900 group">
                <img 
                  src={activeImage} 
                  className="w-full h-full object-cover transition-all duration-[2s] group-hover:scale-110" 
                  alt={title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                  <div className="text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-blue-400">Preview Mode</p>
                    <h4 className="text-2xl font-black uppercase tracking-tighter">Click to Expand</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnails - Modern Github Strip style */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              {images.map((img: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`flex-shrink-0 w-24 h-24 border-4 transition-all duration-500 overflow-hidden relative ${activeImage === img ? 'border-blue-600 scale-105 z-10 shadow-lg' : 'border-white dark:border-slate-800 opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
                  {activeImage === img && <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[1px]"></div>}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const FullScreenGallery = ({ images, currentIndex, onClose }: { images: string[], currentIndex: number, onClose: () => void }) => {
  const [index, setIndex] = useState(currentIndex);

  const next = () => setIndex((index + 1) % images.length);
  const prev = () => setIndex((index - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-[1010] p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all active:scale-90"
      >
        <X size={32} />
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-4">
        <img 
          src={images[index]} 
          className="max-w-full max-h-[85vh] object-contain shadow-2xl animate-in zoom-in-95 duration-500" 
          alt="Gallery View"
        />
        
        {/* Navigation Arrows */}
        <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-6 p-4 text-white/50 hover:text-white transition-all hover:scale-110 active:scale-90">
          <ChevronLeft size={64} strokeWidth={1} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-6 p-4 text-white/50 hover:text-white transition-all hover:scale-110 active:scale-90">
          <ChevronRightIcon size={64} strokeWidth={1} />
        </button>
      </div>

      <div className="absolute bottom-10 flex gap-3">
        {images.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)}
            className={`h-1.5 transition-all duration-500 rounded-full ${i === index ? 'bg-blue-500 w-12' : 'bg-white/20 w-3 hover:bg-white/40'}`} 
          />
        ))}
      </div>
    </div>
  );
};

export const SchoolTour: React.FC = () => {
  const { setView } = useStore();
  const [gallery, setGallery] = useState<{ images: string[], index: number } | null>(null);

  const tourCategories = [
    {
      title: "Calm Classrooms",
      desc: "Our learning spaces are designed to keep children focused and comfortable. We use soft colors, natural light, and quiet zones to help every student learn at their own pace.",
      images: [
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
      ],
      items: ["Personal study stations", "Visual learning tools", "Quiet focus rooms", "Small student groups", "Comfortable furniture", "Teacher-led guidance"],
      theme: 'light',
      reverse: false
    },
    {
      title: "Secure Playgrounds",
      desc: "Fresh air and physical activity are key to growth. Our play areas are fully enclosed and safe, offering special equipment that helps children build strength and make new friends.",
      images: [
        "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1524178232363-1fb28f74b671?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800"
      ],
      items: ["Safe padded surfaces", "Specialized swings", "Sensory garden paths", "Full staff supervision", "Physical therapy zones", "Social play areas"],
      theme: 'dark',
      reverse: true
    },
    {
      title: "Inspiring Activities",
      desc: "We go beyond just books. Our students enjoy music sessions, art workshops, and life-skills training that prepare them for a bright and independent future in our community.",
      images: [
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1524178232363-1fb28f74b671?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&q=80&w=800"
      ],
      items: ["Music & Rhythm therapy", "Arts and Crafts", "Daily living skills", "Social skills groups", "Holiday celebrations", "Community outings"],
      theme: 'light',
      reverse: false
    }
  ];

  const calendarEvents = [
    { date: "Oct 12", event: "Term 3 Begins", type: "Academic" },
    { date: "Oct 25", event: "Parent Workshop", type: "Workshop" },
    { date: "Nov 15", event: "Annual Sports Day", type: "Community" },
    { date: "Dec 05", event: "End of Year Celebration", type: "Event" }
  ];

  const openGallery = (images: string[], index: number) => {
    setGallery({ images, index });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 animate-in fade-in duration-1000">
      {gallery && (
        <FullScreenGallery 
          images={gallery.images} 
          currentIndex={gallery.index} 
          onClose={() => setGallery(null)} 
        />
      )}

      {/* Hero Section */}
      <section className="h-[80vh] min-h-[600px] relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={HeroBg} 
            alt="School Team" 
            className="w-full h-full object-cover scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-white dark:to-slate-950 transition-colors duration-500"></div>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 text-center relative z-10 space-y-10">
           <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-600/20 border border-blue-600/30 rounded-full text-blue-400 backdrop-blur-md">
              <Map size={18} />
              <span className="text-xs font-black uppercase tracking-[0.5em]">Tour Experience</span>
           </div>
           <h1 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter leading-none">
             See our <br /><span className="text-blue-600">School</span>
           </h1>
           <p className="text-xl md:text-3xl text-slate-200 max-w-3xl mx-auto font-medium italic leading-relaxed">
             Step inside our specialized center in Harare. Take a closer look at our classrooms, play areas, and student programs.
           </p>
           <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
             <button onClick={() => setView('apply')} className="w-full sm:w-auto px-12 py-6 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4 group">
               Apply for a Place <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
             </button>
             <button onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})} className="w-full sm:w-auto px-12 py-6 border-2 border-white text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all backdrop-blur-sm active:scale-95">
               Start the Tour
             </button>
           </div>
        </div>
      </section>

      {/* Dynamic Tour Heroes */}
      {tourCategories.map((cat, idx) => (
        <TourHeroSection key={idx} {...cat} onImageClick={openGallery} />
      ))}

      {/* Calendar & Resources Hub */}
      <section className="bg-slate-50 dark:bg-slate-900 py-32 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Calendar Block */}
            <div className="space-y-12">
              <header className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar size={32} className="text-blue-600" />
                  <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white">Upcoming Events</h3>
                </div>
                <p className="text-slate-500 font-medium italic text-lg leading-relaxed">Keep track of important school dates and family workshops.</p>
              </header>
              
              <div className="space-y-4">
                 {calendarEvents.map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-none group hover:border-blue-500 transition-all shadow-sm hover:shadow-xl">
                      <div className="flex items-center gap-10">
                         <div className="text-center min-w-[70px] border-r-2 border-slate-100 dark:border-slate-800 pr-8">
                            <p className="text-xs font-black uppercase text-blue-600 mb-1">{item.date.split(' ')[0]}</p>
                            <p className="text-3xl font-black dark:text-white leading-none">{item.date.split(' ')[1]}</p>
                         </div>
                         <div>
                            <p className="text-lg font-black uppercase dark:text-white tracking-tight leading-none mb-2">{item.event}</p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{item.type} Notification</span>
                         </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                   </div>
                 ))}
              </div>
            </div>

            {/* Resources Matrix */}
            <div className="space-y-12">
              <header className="space-y-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={32} className="text-blue-600" />
                  <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white">Quick Access</h3>
                </div>
                <p className="text-slate-500 font-medium italic text-lg leading-relaxed">Everything you need to join the Motion Max family.</p>
              </header>
              
              <div className="grid sm:grid-cols-2 gap-6">
                 <button 
                  onClick={() => setView('shop')}
                  className="bg-[#002D50] p-12 text-white flex flex-col items-center justify-center text-center gap-8 group hover:bg-black transition-all relative overflow-hidden"
                 >
                    <ShoppingBag size={56} className="group-hover:scale-110 transition-transform relative z-10" />
                    <div className="relative z-10">
                      <h4 className="font-black uppercase tracking-widest text-base mb-2">School Shop</h4>
                      <p className="text-[10px] text-blue-200/60 uppercase font-bold tracking-widest">Official apparel</p>
                    </div>
                    <ArrowRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-400"></div>
                 </button>

                 <button 
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center gap-8 group hover:border-blue-600 transition-all shadow-sm relative overflow-hidden"
                 >
                    <BookOpen size={56} className="text-blue-600 group-hover:scale-110 transition-transform relative z-10" />
                    <div className="relative z-10">
                      <h4 className="font-black uppercase tracking-widest text-base mb-2 dark:text-white">School Brochure</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Digital Prospectus</p>
                    </div>
                    <ArrowRight size={24} className="dark:text-white group-hover:translate-x-2 transition-transform relative z-10" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700"></div>
                 </button>
              </div>

              <div className="p-10 bg-blue-50 dark:bg-blue-900/10 border-4 border-dashed border-blue-200 dark:border-blue-800 space-y-6">
                 <div className="flex items-center gap-4">
                    <Star size={28} className="text-blue-600 fill-blue-600" />
                    <span className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">Quality of Care</span>
                 </div>
                 <p className="text-sm font-bold text-slate-600 dark:text-slate-400 italic leading-relaxed">
                   "Motion Max is fully certified to provide educational and behavioral support. We focus on every detail to ensure your child's safety and progress."
                 </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-40 px-6 text-center max-w-5xl mx-auto space-y-16">
        <div className="space-y-6">
           <div className="w-20 h-2 bg-blue-600 mx-auto"></div>
           <h3 className="text-5xl md:text-8xl font-black uppercase tracking-tighter dark:text-white leading-[0.85]">Become Part of <br /> our <span className="text-blue-600">Community</span></h3>
           <p className="text-xl md:text-2xl text-slate-500 font-medium italic max-w-2xl mx-auto">We have limited places for the next school term. Contact our admissions office to learn more.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
           <button onClick={() => setView('apply')} className="w-full sm:w-auto px-16 py-6 bg-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-blue-700 active:scale-95 transition-all">Start Application</button>
           <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="w-full sm:w-auto px-16 py-6 border-2 border-slate-200 dark:border-slate-800 dark:text-white font-black uppercase tracking-widest text-xs hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">Go back up</button>
        </div>
      </section>
    </div>
  );
};
