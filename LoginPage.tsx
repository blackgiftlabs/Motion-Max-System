
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Role } from '../types';
import { ChevronLeft, Mail, Lock, CheckCircle2, ShieldCheck, Activity, AlertCircle } from 'lucide-react';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const LoginPage: React.FC = () => {
  const { setView, login } = useStore();
  const [selectedRole, setSelectedRole] = useState<Role>('SPECIALIST');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles: { id: Role; label: string; desc: string }[] = [
    { id: 'SUPER_ADMIN', label: 'Administrator', desc: 'System control & financials' },
    { id: 'SPECIALIST', label: 'Teacher / Therapist', desc: 'Data entry & session logging' },
    { id: 'PARENT', label: 'Student / Parent', desc: 'View reports & progress' },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate a slightly more realistic auth delay (Firebase logic simulation)
    setTimeout(() => {
      const success = login(selectedRole, { email, pass: password });
      if (!success) {
        setError('Invalid terminal credentials. Please verify and retry.');
        setLoading(false);
      } else {
        setLoading(false);
      }
    }, 1500);
  };

  const BrandLogo = ({ light }: { light?: boolean }) => (
    <div className="flex flex-col items-center gap-2">
      <img src={LogoImg} alt="Motion Max" className={`h-24 w-auto ${light ? 'brightness-0 invert' : ''} transition-transform duration-700 hover:rotate-3`} />
      <span 
        className={`font-black text-3xl tracking-tighter uppercase ${light ? 'text-white' : 'text-slate-900'}`}
        style={{ fontFamily: '"Arial Black", "Franklin Gothic Heavy", sans-serif' }}
      >
        MOTION MAX
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col md:flex-row transition-colors">
      {/* Mobile Logo Header */}
      <div className="md:hidden flex flex-col items-center justify-center py-12 px-6 bg-slate-900 border-b border-blue-500/20">
         <BrandLogo light />
         <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            <h2 className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.2em]">Management System</h2>
         </div>
      </div>

      {/* Left Section: Form */}
      <div className="flex-1 flex flex-col p-8 md:p-16 lg:p-24 overflow-y-auto relative">
        <button 
          onClick={() => setView('landing')}
          className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all mb-12 self-start"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="border-b border-transparent group-hover:border-current">Back to home</span>
        </button>

        <div className="max-w-md w-full mx-auto relative z-10">
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Secure Access</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight uppercase leading-none">Welcome back</h1>
            <p className="text-slate-500 mt-3 font-medium text-sm leading-relaxed">Identity verification required to access the Motion Max terminal and clinical databases.</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
                Access Role
                <span className="text-blue-500 lowercase font-mono">/v3.1.4</span>
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {roles.map(role => (
                  <button
                    key={role.id}
                    type="button"
                    disabled={loading}
                    onClick={() => { setSelectedRole(role.id); setError(''); }}
                    className={`
                      relative flex items-center gap-4 p-4 rounded-xl border transition-all text-left group
                      ${selectedRole === role.id 
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 shadow-md ring-1 ring-blue-500/20' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedRole === role.id ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-700 group-hover:border-blue-400'}`}>
                      {selectedRole === role.id && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <div>
                      <p className={`text-[13px] font-bold uppercase tracking-tight ${selectedRole === role.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{role.label}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{role.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@motionmax.co.zw" 
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all outline-none font-medium placeholder:text-slate-400/70"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all outline-none font-medium placeholder:text-slate-400/70"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-3 animate-in shake duration-300">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`
                w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all duration-300
                flex items-center justify-center gap-3 relative overflow-hidden group
                ${loading 
                  ? 'bg-slate-800 dark:bg-blue-800 cursor-not-allowed border-slate-700' 
                  : 'bg-slate-900 dark:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20 active:scale-[0.98]'
                }
                text-white
              `}
            >
              <div className={`flex items-center gap-3 transition-all duration-300 ${loading ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100'}`}>
                <span>Sign In to Dashboard</span>
                <ChevronLeft size={16} className="rotate-180" />
              </div>

              {loading && (
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-slate-900 dark:bg-blue-700 animate-in fade-in zoom-in duration-300">
                  <div className="relative">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-5 h-5 border-2 border-blue-400/20 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-[11px] font-black tracking-widest animate-pulse">Authenticating...</span>
                </div>
              )}
            </button>
          </form>

          <div className="mt-12 flex items-center justify-between py-6 border-t border-slate-100 dark:border-slate-900">
             <div className="flex items-center gap-2">
               <Activity size={14} className="text-green-500" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network: Stable</span>
             </div>
             <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
               <a href="#" className="hover:text-blue-600 transition-colors">Forgot Password?</a>
             </p>
          </div>
        </div>
      </div>

      {/* Right Section: Visual (Desktop Only) */}
      <div className="hidden md:flex flex-1 bg-slate-900 items-center justify-center p-12 relative overflow-hidden border-l border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-indigo-900/30"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10 text-center space-y-8 animate-in zoom-in duration-1000">
          <BrandLogo light />
          <div className="space-y-3">
            <h2 className="text-xl font-black text-white uppercase tracking-[0.4em] mb-1">Management System</h2>
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-blue-400 font-mono text-[10px] tracking-widest uppercase">Node-24-HRE // Operational</p>
            </div>
          </div>
          <div className="pt-12 grid grid-cols-2 gap-4 max-w-sm mx-auto">
             <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl group hover:bg-white/10 transition-all cursor-default">
                <p className="text-white font-black text-3xl mb-1">Terminal</p>
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">Secure Shell</p>
             </div>
             <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl group hover:bg-white/10 transition-all cursor-default">
                <p className="text-white font-black text-3xl mb-1">99.8%</p>
                <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">Uptime SLI</p>
             </div>
          </div>
        </div>
        
        {/* Terminal decoration */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between text-[9px] font-mono text-slate-600 uppercase tracking-widest">
          <span>&copy; {new Date().getFullYear()} MOTION MAX TERMINAL</span>
          <span>BRANCH: STABLE-V3</span>
        </div>
      </div>
    </div>
  );
};
