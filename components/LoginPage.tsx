
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Role, Student, Parent, Staff } from '../types';
import { Mail, Lock, ShieldCheck, Activity, Users, Loader2, ArrowLeft, GraduationCap, ChevronRight, Search, Zap } from 'lucide-react';
import * as THREE from 'three';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";
const LeftBg = "https://i.ibb.co/JR5Bhxpy/profileher.jpg";

export const LoginPage: React.FC = () => {
  const { setView, login, notify, students, parents, staff, initializeData } = useStore();
  const [selectedRole, setSelectedRole] = useState<Role>('SPECIALIST');
  const [step, setStep] = useState<'role' | 'credentials'>('role');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Suggestion specific states
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<Student | null>(null);
  const [selectedParentProfile, setSelectedParentProfile] = useState<Parent | null>(null);
  const [selectedStaffProfile, setSelectedStaffProfile] = useState<Staff | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize data for suggestions on mount
  useEffect(() => {
    initializeData();
  }, []);

  const roles: { id: Role; label: string; icon: any; color: string; bg: string; border: string; desc: string }[] = [
    { 
      id: 'SPECIALIST', 
      label: 'Therapist', 
      icon: Activity, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      desc: 'Teacher Portal' 
    },
    { 
      id: 'PARENT', 
      label: 'Parent', 
      icon: Users, 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800/50',
      desc: 'Family Portal' 
    },
    { 
      id: 'STUDENT', 
      label: 'Student', 
      icon: GraduationCap, 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800/50',
      desc: 'Learning Portal' 
    },
    { 
      id: 'SUPER_ADMIN', 
      label: 'Admin', 
      icon: ShieldCheck, 
      color: 'text-indigo-600 dark:text-indigo-400', 
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-200 dark:border-indigo-800/50',
      desc: 'System Manager' 
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      velocities[i * 3] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      size: 0.06,
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(particleCount * 12 * 3);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    camera.position.z = 4;

    const animate = () => {
      requestAnimationFrame(animate);
      const posArray = geometry.attributes.position.array as Float32Array;
      let lineIdx = 0;

      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i * 3];
        posArray[i * 3 + 1] += velocities[i * 3 + 1];
        posArray[i * 3 + 2] += velocities[i * 3 + 2];

        if (Math.abs(posArray[i * 3]) > 4) velocities[i * 3] *= -1;
        if (Math.abs(posArray[i * 3 + 1]) > 4) velocities[i * 3 + 1] *= -1;
        if (Math.abs(posArray[i * 3 + 2]) > 4) velocities[i * 3 + 2] *= -1;

        for (let j = i + 1; j < particleCount; j++) {
          const dx = posArray[i * 3] - posArray[j * 3];
          const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
          const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
          const dist = dx * dx + dy * dy + dz * dz;

          if (dist < 1.4) {
            linePositions[lineIdx++] = posArray[i * 3];
            linePositions[lineIdx++] = posArray[i * 3 + 1];
            linePositions[lineIdx++] = posArray[i * 3 + 2];
            linePositions[lineIdx++] = posArray[j * 3];
            linePositions[lineIdx++] = posArray[j * 3 + 1];
            linePositions[lineIdx++] = posArray[j * 3 + 2];
          }
        }
      }

      geometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineIdx / 3);
      points.rotation.y += 0.0004;
      lines.rotation.y += 0.0004;
      renderer.render(scene, camera);
    };

    animate();
    
    const handleResize = () => {
      if (!canvas.parentElement) return;
      camera.aspect = canvas.parentElement.clientWidth / canvas.parentElement.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      renderer.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogin = async (e?: React.FormEvent, bypassEmail?: string, bypassPass?: string) => {
    e?.preventDefault();
    setLoading(true);
    
    try {
      let loginEmail = bypassEmail || email;
      let loginPass = bypassPass || password;

      // Handle Lookup from Profiles
      if (selectedRole === 'STUDENT' && selectedStudentProfile) {
        loginEmail = selectedStudentProfile.systemEmail || '';
      } else if (selectedRole === 'PARENT' && selectedParentProfile) {
        loginEmail = selectedParentProfile.systemEmail || '';
      } else if (selectedRole === 'SPECIALIST' && selectedStaffProfile) {
        loginEmail = selectedStaffProfile.systemEmail || selectedStaffProfile.email;
      }

      if (!loginEmail) {
        throw new Error('SYSTEM_EMAIL_NOT_FOUND');
      }

      await login(selectedRole, { email: loginEmail, pass: loginPass });
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Login failed. Please check your details.';
      if (err.message === 'ROLE_MISMATCH') {
        errorMessage = 'Invalid role selected for this account.';
      } else if (err.message === 'SYSTEM_EMAIL_NOT_FOUND') {
        errorMessage = 'System account lookup failed. Please contact administration.';
      }
      notify('error', errorMessage, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleBypass = () => {
    handleLogin(undefined, 'admin@gmail.com', 'pppppp');
  };

  const filteredStudentSuggestions = students.filter(s => {
    const search = searchInput.toLowerCase();
    if (!search) return false;
    return s.fullName.toLowerCase().includes(search) || s.id.toLowerCase().includes(search);
  }).slice(0, 6);

  const filteredParentSuggestions = parents.filter(p => {
    const search = searchInput.toLowerCase();
    if (!search) return false;
    return p.name.toLowerCase().includes(search) || p.studentFullName.toLowerCase().includes(search);
  }).slice(0, 6);

  const filteredStaffSuggestions = staff.filter(s => {
    const search = searchInput.toLowerCase();
    if (!search) return false;
    return s.fullName.toLowerCase().includes(search);
  }).slice(0, 6);

  const currentRoleLabel = roles.find(r => r.id === selectedRole)?.label || 'User';

  const resetSelection = () => {
    setSearchInput('');
    setSelectedStudentProfile(null);
    setSelectedParentProfile(null);
    setSelectedStaffProfile(null);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.search-container')) {
        setShowSuggestions(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-screen w-screen bg-white dark:bg-slate-950 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Visual Left Section */}
      <div className="flex-1 relative hidden md:block overflow-hidden bg-slate-950 border-r border-slate-100 dark:border-slate-800">
        <img src={LeftBg} alt="Visual" className="absolute inset-0 w-full h-full object-cover scale-105 opacity-40 dark:opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0"></canvas>
        <div className="relative h-full flex flex-col justify-between p-16 z-10 text-white">
          <div className="space-y-12">
            <div className="flex items-center gap-6">
              <div className="bg-white p-4 rounded-3xl shadow-lg flex items-center justify-center">
                <img src={LogoImg} alt="Motion Max" className="h-16 w-auto object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-4xl tracking-tight leading-none text-white uppercase">MOTION MAX</span>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200 mt-1">Day Services</span>
              </div>
            </div>
            <div className="space-y-6 pt-10">
              <h2 className="text-6xl font-black tracking-tight leading-[1] uppercase max-w-lg">Simple. <br /> <span className="text-blue-400">Behavioral</span> <br /> Support.</h2>
              <div className="h-1.5 w-24 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400/60">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Secure Login Terminal
          </div>
        </div>
      </div>

      {/* Auth Right Section */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 h-full relative overflow-hidden">
        <div 
          className="flex h-full w-[200%] transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1)"
          style={{ transform: step === 'role' ? 'translateX(0%)' : 'translateX(-50%)' }}
        >
          {/* STEP 1: ROLE SELECTION */}
          <div className="w-1/2 h-full flex flex-col">
            <div className="p-8 md:p-12">
              <button onClick={() => setView('landing')} className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-blue-400 transition-all">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to website
              </button>
            </div>
            <div className="flex-1 px-8 md:px-20 flex flex-col justify-center">
              <div className="max-w-xl w-full mx-auto">
                <header className="mb-10 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 mb-4 mx-auto md:mx-0">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">User Access</span>
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Choose Your Role</h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm font-medium italic">Please select who you are logging in as.</p>
                </header>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => { setSelectedRole(role.id); setStep('credentials'); resetSelection(); }}
                        className={`group flex flex-col items-start gap-3 p-4 ${role.bg} border ${role.border} rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all text-left relative overflow-hidden active:scale-95`}
                      >
                        <div className={`p-2 rounded-xl bg-white dark:bg-slate-900 ${role.color} group-hover:scale-110 transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-800`}>
                          <Icon size={16} />
                        </div>
                        <div className="relative z-10">
                          <p className={`font-black uppercase tracking-tight text-sm ${role.color}`}>{role.label}</p>
                          <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-widest">{role.desc}</p>
                        </div>
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <ChevronRight size={12} className={`${role.color} translate-x-2 group-hover:translate-x-0 transition-transform`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: CREDENTIALS */}
          <div className="w-1/2 h-full flex flex-col">
            <div className="p-8 md:p-12">
              <button onClick={() => { setStep('role'); resetSelection(); }} className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to roles
              </button>
            </div>
            <div className="flex-1 px-8 md:px-20 flex flex-col justify-center">
              <div className="max-w-md w-full mx-auto">
                <header className="mb-10">
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Login Details</h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm font-medium">
                    Logging in as <span className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">{currentRoleLabel}</span>
                  </p>
                </header>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    {(selectedRole === 'STUDENT' || selectedRole === 'PARENT' || selectedRole === 'SPECIALIST') ? (
                      <div className="space-y-2 relative search-container">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {selectedRole === 'STUDENT' ? 'Search Your Name' : selectedRole === 'PARENT' ? 'Search Parent or Student' : 'Search Staff Name'}
                        </label>
                        <div className="relative">
                          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="text" 
                            value={selectedRole === 'STUDENT' 
                               ? (selectedStudentProfile ? selectedStudentProfile.fullName : searchInput)
                               : selectedRole === 'PARENT'
                               ? (selectedParentProfile ? selectedParentProfile.name : searchInput)
                               : (selectedStaffProfile ? selectedStaffProfile.fullName : searchInput)
                            }
                            onChange={(e) => { 
                              setSearchInput(e.target.value); 
                              setSelectedStudentProfile(null); 
                              setSelectedParentProfile(null);
                              setSelectedStaffProfile(null);
                              setShowSuggestions(true); 
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder={selectedRole === 'STUDENT' ? "Type your name..." : "Search database name..."}
                            required
                            autoComplete="off"
                            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold dark:text-white text-sm"
                          />
                        </div>
                        {showSuggestions && searchInput.length > 0 && !selectedStudentProfile && !selectedParentProfile && !selectedStaffProfile && (
                          <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                            {selectedRole === 'STUDENT' ? (
                               filteredStudentSuggestions.length > 0 ? filteredStudentSuggestions.map(s => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => { setSelectedStudentProfile(s); setShowSuggestions(false); }}
                                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b border-slate-50 dark:border-slate-800 last:border-0 text-left"
                                >
                                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black uppercase">{s.fullName[0]}</div>
                                  <div className="flex flex-col items-start">
                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200 leading-none">{s.fullName}</span>
                                    <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-widest">ID: {s.id}</span>
                                  </div>
                                </button>
                              )) : (
                                <div className="px-6 py-4 text-xs font-bold text-slate-400 italic">No student found.</div>
                              )
                            ) : selectedRole === 'PARENT' ? (
                               filteredParentSuggestions.length > 0 ? filteredParentSuggestions.map(p => (
                                <button
                                  key={p.firebaseUid}
                                  type="button"
                                  onClick={() => { setSelectedParentProfile(p); setShowSuggestions(false); }}
                                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b border-slate-50 dark:border-slate-800 last:border-0 text-left"
                                >
                                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-black uppercase">{p.name[0]}</div>
                                  <div className="flex flex-col items-start">
                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200 leading-none">{p.name}</span>
                                    <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-widest">Parent of {p.studentFullName}</span>
                                  </div>
                                </button>
                              )) : (
                                <div className="px-6 py-4 text-xs font-bold text-slate-400 italic">No parent account found.</div>
                              )
                            ) : (
                               filteredStaffSuggestions.length > 0 ? filteredStaffSuggestions.map(st => (
                                <button
                                  key={st.email}
                                  type="button"
                                  onClick={() => { setSelectedStaffProfile(st); setShowSuggestions(false); }}
                                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b border-slate-50 dark:border-slate-800 last:border-0 text-left"
                                >
                                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black uppercase">{st.fullName[0]}</div>
                                  <div className="flex flex-col items-start">
                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200 leading-none">{st.fullName}</span>
                                    <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-widest">{st.position}</span>
                                  </div>
                                </button>
                              )) : (
                                <div className="px-6 py-4 text-xs font-bold text-slate-400 italic">No staff member found.</div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@motionmax.co.zw" 
                            required
                            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold dark:text-white text-sm"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••" 
                          required
                          className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    <button type="submit" disabled={loading || (selectedRole === 'STUDENT' && !selectedStudentProfile) || (selectedRole === 'PARENT' && !selectedParentProfile) || (selectedRole === 'SPECIALIST' && !selectedStaffProfile)} className="group w-full py-4 bg-[#002D50] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-xl shadow-xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-[0.98]">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <>Login Now <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                    
                    {selectedRole === 'SUPER_ADMIN' && (
                      <button 
                        type="button" 
                        onClick={handleBypass}
                        disabled={loading}
                        className="w-full py-3 bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest rounded-xl text-[10px] hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Zap size={14} className="text-amber-500" /> Bypass (Quick Log)
                      </button>
                    )}
                  </div>
                </form>
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Motion Max // Zimbabwe-HRE v3.1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
