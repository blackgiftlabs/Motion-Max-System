
import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Label } from 'recharts';
import { 
  Users, Activity, Bell, Settings, Clock, Target,
  Brain, History, Zap, MessageSquare, ChevronRight, ListChecks
} from 'lucide-react';

const QuickAction = ({ label, sub, icon: Icon, onClick, saturatedColor, tintedBg, accentBorder }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col border-2 border-slate-900 rounded-none shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-[0.99] transition-all w-full text-left overflow-hidden bg-white dark:bg-slate-900 group`}
  >
    <div className={`p-5 ${saturatedColor} text-white flex items-center justify-between`}>
      <Icon size={22} className="group-hover:scale-110 transition-transform" />
      <p className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</p>
    </div>
    <div className={`p-4 ${tintedBg} border-l-4 ${accentBorder} flex-1`}>
      <p className="text-[9px] font-bold text-slate-800 dark:text-slate-200 leading-tight uppercase tracking-tight">{sub}</p>
    </div>
  </button>
);

const DetailedLineChart = ({ data, color, theme }: any) => {
  const axisColor = theme === 'dark' ? '#94a3b8' : '#1e293b';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  
  return (
    <div className="h-36 w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={true} horizontal={true} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 9, fontWeight: '900', fill: axisColor }} 
            tickLine={true} 
            axisLine={true} 
            stroke={axisColor}
          />
          <YAxis 
            tick={{ fontSize: 9, fontWeight: '900', fill: axisColor }} 
            tickLine={true} 
            axisLine={true}
            stroke={axisColor}
          />
          <Line 
            type="monotone" 
            dataKey="val" 
            stroke={color} 
            strokeWidth={3} 
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }} 
            animationDuration={2000}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#000', 
              border: 'none', 
              borderRadius: '0px', 
              color: '#fff',
              fontSize: '10px',
              fontWeight: 'bold'
            }} 
            itemStyle={{ color: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const StatSquare = ({ title, value, sub, icon: Icon, color, chartData, span, btnLabel, onBtnClick, theme }: any) => (
  <div className={`${span} bg-white dark:bg-slate-900 p-8 border-2 border-slate-900 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all relative group overflow-hidden`}>
    <div>
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-none ${color} text-white shadow-md border border-slate-900/10`}>
          <Icon size={24} />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-1.5">{title}</p>
          <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{value}</h3>
        </div>
      </div>
      <div className="border-l-4 border-slate-900 dark:border-slate-700 pl-4 py-1 mb-6">
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight leading-relaxed">
          {sub}
        </p>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border border-slate-100 dark:border-slate-800 mb-6">
        <DetailedLineChart data={chartData} color={color.includes('blue') ? '#2563eb' : color.includes('emerald') ? '#059669' : '#e11d48'} theme={theme} />
      </div>
    </div>

    <button 
      onClick={onBtnClick}
      className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 rounded-none shadow-xl"
    >
      {btnLabel} <ChevronRight size={16} />
    </button>
  </div>
);

export const TherapistDashboard: React.FC = () => {
  const { theme, students, staff, user, setActiveTab, milestoneRecords, toggleNotices } = useStore();

  const myStudents = useMemo(() => {
    const currentStaff = staff.find(st => st.id === user?.id);
    return students.filter(s => currentStaff?.assignedClasses?.includes(s.assignedClass) && s.assignedStaffId === user?.id);
  }, [students, user, staff]);

  const performanceData = useMemo(() => {
    return myStudents.map(student => {
      const studentMilestones = milestoneRecords.filter(r => r.studentId === student.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return {
        id: student.id,
        name: student.firstName.toUpperCase(),
        growth: studentMilestones[0]?.overallPercentage || 0,
      };
    });
  }, [myStudents, milestoneRecords]);

  const historyData = [
    { name: '01', val: 30 }, { name: '02', val: 55 }, { name: '03', val: 40 }, { name: '04', val: 80 }, { name: '05', val: 75 }
  ];

  const axisColor = theme === 'dark' ? '#94a3b8' : '#1e293b';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-full mx-auto px-2 md:px-4 pb-20 font-sans selection:bg-blue-100">
      {/* App Header */}
      <header className="flex items-center justify-between pt-1 pb-6 border-b-4 border-slate-900 px-1">
        <div>
          <h1 className="text-[11px] font-black tracking-[0.5em] uppercase text-slate-900 dark:text-white leading-none">School Portal</h1>
          <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-tighter">Staff Member: {user?.name || 'Authorized Personnel'}</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-4 py-2 border-2 border-slate-900 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
           <div className="w-2 h-2 bg-emerald-500 animate-pulse"></div>
           <span>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</span>
        </div>
      </header>

      {/* Saturated Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction 
          label="Growth" 
          sub="Check how your students are growing"
          icon={Brain} 
          saturatedColor="bg-emerald-600" 
          tintedBg="bg-emerald-50/50 dark:bg-emerald-900/10"
          accentBorder="border-emerald-600"
          onClick={() => setActiveTab('clinical')} 
        />
        <QuickAction 
          label="Lessons" 
          sub="Write notes about today's lessons"
          icon={History} 
          saturatedColor="bg-blue-600" 
          tintedBg="bg-blue-50/50 dark:bg-blue-900/10"
          accentBorder="border-blue-600"
          onClick={() => setActiveTab('clinical-logs')} 
        />
        <QuickAction 
          label="Notices" 
          sub="Check notices from administration"
          icon={Bell} 
          saturatedColor="bg-purple-600" 
          tintedBg="bg-purple-50/50 dark:bg-purple-900/10"
          accentBorder="border-purple-600"
          onClick={() => toggleNotices(true)} 
        />
        <QuickAction 
          label="Account" 
          sub="Manage your personal profile"
          icon={Settings} 
          saturatedColor="bg-slate-800" 
          tintedBg="bg-slate-100 dark:bg-slate-800/20"
          accentBorder="border-slate-800"
          onClick={() => setActiveTab('settings')} 
        />
      </div>

      {/* Asymmetric Statistic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
        <StatSquare 
          span="md:col-span-7"
          title="Students Managed"
          value={myStudents.length.toString()}
          sub="Number of students assigned to your specific classroom nodes."
          icon={Users}
          color="bg-blue-600"
          chartData={historyData}
          btnLabel="View all students"
          onBtnClick={() => setActiveTab('my-students')}
          theme={theme}
        />
        <StatSquare 
          span="md:col-span-5"
          title="Average Marks"
          value={`${performanceData.length > 0 ? Math.round(performanceData.reduce((a,b)=>a+b.growth,0)/performanceData.length) : 0}%`}
          sub="Based on all average marks recorded for your sessions."
          icon={Target}
          color="bg-emerald-600"
          chartData={[...historyData].reverse()}
          btnLabel="Open Checklist"
          onBtnClick={() => setActiveTab('clinical')}
          theme={theme}
        />
        <StatSquare 
          span="md:col-span-6"
          title="Weekly Reviews"
          value="12"
          sub="Tasks from earlier sessions that need clinical marking."
          icon={Zap}
          color="bg-rose-600"
          chartData={historyData.map(d => ({ ...d, val: d.val * 0.8 }))}
          btnLabel="Task Analysis"
          onBtnClick={() => setActiveTab('clinical-logs')}
          theme={theme}
        />
        <StatSquare 
          span="md:col-span-6"
          title="Notices"
          value="4"
          sub="Official notices from administration regarding school terms."
          icon={MessageSquare}
          color="bg-slate-800"
          chartData={historyData.map(d => ({ ...d, val: d.val + 10 }))}
          btnLabel="View Notices from administration"
          onBtnClick={() => toggleNotices(true)}
          theme={theme}
        />
      </div>

      {/* Performance Insights */}
      <section className="pt-12 space-y-8">
        <div className="px-1 border-l-8 border-slate-900 dark:border-blue-600 pl-6">
           <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white tracking-[0.4em]">Student Performance Results</h3>
           <p className="text-[10px] text-slate-500 font-black mt-2 uppercase tracking-widest italic">Average passrate based on actual classroom data recorded in the registry.</p>
        </div>
        
        <div className="h-[450px] w-full bg-white dark:bg-slate-900 border-2 border-slate-900 p-8 md:p-14 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden rounded-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ left: 30, right: 20, top: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={true} stroke={gridColor} />
              <XAxis 
                dataKey="name" 
                stroke={axisColor} 
                fontSize={10} 
                tickLine={true} 
                axisLine={true} 
                tick={{ fontWeight: '900', fill: axisColor }}
              >
                <Label value="INDIVIDUAL STUDENTS" offset={-40} position="insideBottom" style={{ fontSize: '11px', fontWeight: '900', fill: axisColor, letterSpacing: '0.25em' }} />
              </XAxis>
              <YAxis 
                stroke={axisColor} 
                fontSize={10} 
                tickLine={true} 
                axisLine={true} 
                tick={{ fontWeight: '900', fill: axisColor }}
              >
                <Label value="AVG PASSRATE (%)" angle={-90} position="insideLeft" offset={-10} style={{ fontSize: '11px', fontWeight: '900', fill: axisColor, letterSpacing: '0.25em' }} />
              </YAxis>
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                contentStyle={{ 
                  borderRadius: '0px', 
                  border: '3px solid #000', 
                  backgroundColor: '#fff',
                  fontSize: '11px', 
                  fontWeight: '900',
                  padding: '12px 16px',
                  textTransform: 'uppercase'
                }} 
              />
              <Bar 
                dataKey="growth" 
                fill={theme === 'dark' ? '#3b82f6' : '#1e293b'} 
                radius={0} 
                barSize={50} 
                stroke="#000"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Page Footer */}
      <footer className="pt-24 pb-12 border-t-2 border-slate-200 dark:border-slate-800 text-center">
         <p className="text-[10px] font-black uppercase tracking-[1.5em] text-slate-400 dark:text-slate-600 translate-x-[0.75em]">Page ending</p>
      </footer>
    </div>
  );
};
