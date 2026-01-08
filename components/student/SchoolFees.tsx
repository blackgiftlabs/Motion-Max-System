
import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  DollarSign, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  History,
  Lock,
  Info,
  Loader2,
  Smartphone,
  X,
  Printer,
  FileText,
  BadgeCheck,
  Bell,
  Wallet,
  ArrowLeft,
  ChevronRight,
  ShieldIcon
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PaymentRecord } from '../../types';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";
const GatewayBg = "https://i.ibb.co/JR5Bhxpy/profileher.jpg";

const PAYMENT_METHODS = [
  { id: 'ecocash', name: 'Ecocash', logo: 'https://i.ibb.co/7NQSc15p/ecocash.png' },
  { id: 'omari', name: "O'mari", logo: 'https://i.ibb.co/BDp0pNV/omari.png' },
  { id: 'mukuru', name: 'Mukuru', logo: 'https://i.ibb.co/DPJwkS3x/mukuru.png' },
  { id: 'zimswitch', name: 'ZimSwitch', logo: 'https://i.ibb.co/j9W0Q6Kp/zimswitch.png' },
  { id: 'visamastercard', name: 'Visa / Mastercard', logo: 'https://i.ibb.co/tw59PtJJ/visamastercard.png' }
];

export const SchoolFees: React.FC = () => {
  const { user, students, parents, settings, updateStudent, notify, payments, addPayment, notices } = useStore();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const isParent = user?.role === 'PARENT';

  const studentProfile = useMemo(() => {
    if (user?.role === 'STUDENT') return students.find(s => s.firebaseUid === user.id);
    if (user?.role === 'PARENT') {
      const parent = parents.find(p => p.firebaseUid === user.id);
      return parent ? students.find(s => s.id === parent.studentId) : null;
    }
    return null;
  }, [user, students, parents]);

  const studentPayments = useMemo(() => 
    payments.filter(p => p.studentId === studentProfile?.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [payments, studentProfile]
  );

  const relevantFeeNotices = useMemo(() => {
    return notices.filter(n => (n.target === 'ALL' || n.target === 'PARENT') && n.type === 'Fees');
  }, [notices]);

  const totalFees = settings.feesAmount;
  const paidFees = studentProfile?.totalPaid || 0;
  const balance = Math.max(0, totalFees - paidFees);
  const paymentProgress = Math.min(100, (paidFees / (totalFees || 1)) * 100);

  const handlePayment = async () => {
    if (!selectedMethod || !paymentAmount || !studentProfile || !studentProfile.firebaseUid) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      notify('error', 'Please enter a valid payment amount.');
      return;
    }

    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    
    try {
      await addPayment({
        studentId: studentProfile.id,
        studentName: studentProfile.fullName,
        amount,
        method: PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name || selectedMethod,
        isMock: true,
        timestamp: new Date().toISOString()
      });
      await updateStudent(studentProfile.firebaseUid, { totalPaid: paidFees + amount });
      setShowSuccess(true);
      setSelectedMethod(null);
      setPaymentAmount('');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateStatementPDF = async (title: string, p?: PaymentRecord) => {
    if (!studentProfile) return;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(0, 45, 80);
    doc.text('OFFICIAL PAYMENT RECEIPT', 15, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student Name: ${studentProfile.fullName}`, 15, 35);
    doc.text(`Account ID: ${studentProfile.id}`, 15, 40);
    
    const body = p ? [['School Fees Payment', p.method, `$${p.amount.toLocaleString()}`, new Date(p.timestamp).toLocaleDateString()]] : 
                     studentPayments.map(sp => [
                       'School Fees Payment', 
                       sp.method, 
                       `$${sp.amount.toLocaleString()}`, 
                       new Date(sp.timestamp).toLocaleDateString()
                     ]);
    
    autoTable(doc, {
      startY: 50,
      head: [['Description', 'Payment Method', 'Amount (USD)', 'Date']],
      body,
      theme: 'grid',
      headStyles: { fillColor: [0, 45, 80] }
    });

    doc.save(`${title}_${studentProfile.id}.pdf`);
  };

  if (!studentProfile) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.2em]">Synchronizing account data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Financial Account</h1>
          <p className="text-sm text-slate-500 font-medium mt-3 italic">Manage school fees and view transaction history for {studentProfile.fullName}.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setIsGeneratingAll(true); generateStatementPDF('Statement').finally(()=>setIsGeneratingAll(false)); }} 
            disabled={isGeneratingAll}
            className="flex items-center gap-2 px-6 py-3 bg-slate-950 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50 active:scale-95"
          >
            {isGeneratingAll ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            Print Statement
          </button>
          <button 
            onClick={() => setShowHistory(true)} 
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <History size={16} />
            Full History
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Summary & Methods */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Balance Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-sm">
            <div className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50 dark:bg-slate-950/50 border-b-2 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                  <BadgeCheck size={32} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Current Outstanding Balance</p>
                  <h2 className={`text-5xl font-black font-mono tracking-tighter ${balance <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${balance.toLocaleString()}
                  </h2>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border shadow-sm ${balance <= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                  {balance <= 0 ? 'Account Cleared' : 'Payment Due'}
                </span>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Term: {settings.currentTerm}</p>
              </div>
            </div>
            
            <div className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                     <FileText size={12}/> Total Term Tuition
                   </p>
                   <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">${totalFees.toLocaleString()}</p>
                </div>
                <div className="space-y-2 text-right">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center justify-end gap-2">
                    <CheckCircle2 size={12}/> Total Amount Paid
                  </p>
                  <p className="text-3xl font-black text-emerald-600 font-mono">${paidFees.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                   <span className="text-[10px] font-black uppercase text-slate-400">Payment Coverage</span>
                   <span className="text-xs font-black text-blue-600 font-mono">{Math.round(paymentProgress)}% Complete</span>
                </div>
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700 shadow-inner">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${paymentProgress}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          {isParent && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-10">
                 <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><CreditCard size={18}/></div>
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Secure Payment Methods</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                {PAYMENT_METHODS.map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setSelectedMethod(m.id)} 
                    className="flex flex-col items-center gap-5 p-6 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/30 group transition-all active:scale-95 shadow-sm hover:shadow-xl"
                  >
                    <div className="h-12 w-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <img src={m.logo} className="max-h-full max-w-full object-contain" alt={m.name} />
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-tight">{m.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Notices & Recent */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl border border-white/5">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <Bell className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-125 transition-transform duration-1000" size={160} />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg"><Info size={18} /></div>
                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400">Account Notices</h4>
              </div>
              
              <div className="space-y-4">
                 {relevantFeeNotices.length > 0 ? relevantFeeNotices.map(n => (
                   <div key={n.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                      <p className="text-[9px] font-black uppercase text-blue-400 mb-2">{n.title}</p>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed italic line-clamp-3">"{n.content}"</p>
                   </div>
                 )) : (
                   <p className="text-xs text-slate-400 font-medium leading-relaxed italic border-l-2 border-blue-500/30 pl-4">
                    "Official school receipts are generated automatically upon ledger verification. All transactions are recorded in USD."
                   </p>
                 )}
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                  <Lock size={12} /> Secure Account
                </div>
                <span className="text-[8px] font-mono text-slate-600 uppercase">Ver 3.1.4</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                 <History size={16} /> Recent Payments
               </h3>
            </div>
            <div className="space-y-5">
              {studentPayments.slice(0, 4).length === 0 ? (
                <div className="py-10 text-center space-y-4">
                   <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto"><DollarSign size={20} className="text-slate-200"/></div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No transactions logged</p>
                </div>
              ) : studentPayments.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 border border-slate-100 dark:border-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-all"><DollarSign size={16}/></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white">{p.method}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(p.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono text-emerald-600 group-hover:scale-110 transition-transform">${p.amount.toLocaleString()}</span>
                </div>
              ))}
              <button onClick={() => setShowHistory(true)} className="w-full flex items-center justify-center gap-2 py-4 text-[9px] font-black uppercase text-blue-600 hover:text-blue-700 border-t border-slate-50 dark:border-slate-800 mt-4 group">
                View Full Audit <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-PAGE PAYMENT MODAL (Styled like Login) */}
      {selectedMethod && (
        <div className="fixed inset-0 z-[1000] bg-white dark:bg-slate-950 flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-500">
           {/* Visual Left Section */}
           <div className="flex-1 relative hidden md:block overflow-hidden bg-slate-950 border-r border-slate-100 dark:border-slate-800">
              <img src={GatewayBg} alt="Gateway" className="absolute inset-0 w-full h-full object-cover scale-105 opacity-40 dark:opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              
              <div className="relative h-full flex flex-col justify-between p-16 z-10 text-white">
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="bg-white p-4 rounded-3xl shadow-lg flex items-center justify-center">
                      <img src={LogoImg} alt="Motion Max" className="h-16 w-auto object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-4xl tracking-tight leading-none text-white uppercase">GATEWAY</span>
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200 mt-1">Payment Hub</span>
                    </div>
                  </div>
                  
                  <div className="space-y-8 pt-10">
                     <h2 className="text-6xl font-black tracking-tight leading-[1] uppercase max-w-lg">Complete <br /> <span className="text-blue-400">Secure</span> <br /> Payment.</h2>
                     <div className="h-1.5 w-24 bg-blue-500 rounded-full"></div>
                     
                     <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] space-y-6 max-w-sm">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                           <span className="text-[10px] font-black uppercase text-slate-400">Payment For</span>
                           <span className="text-sm font-black uppercase">{studentProfile.fullName}</span>
                        </div>
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                           <span className="text-[10px] font-black uppercase text-slate-400">Provider Node</span>
                           <span className="text-sm font-black uppercase">{selectedMethod}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase text-slate-400">System Balance</span>
                           <span className="text-sm font-black font-mono text-emerald-400">${balance}</span>
                        </div>
                     </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-widest text-blue-400/60">
                  <ShieldIcon size={16} className="text-blue-500" /> End-to-End Encrypted Registry Sync
                </div>
              </div>
           </div>

           {/* Input Right Section */}
           <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 h-full relative overflow-y-auto">
              <header className="p-8 md:p-12 flex justify-between items-center">
                 <button onClick={() => !isProcessing && setSelectedMethod(null)} className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to account
                 </button>
                 <img src={LogoImg} className="h-8 w-auto md:hidden" />
              </header>

              <div className="flex-1 px-8 md:px-20 flex flex-col justify-center max-w-md w-full mx-auto pb-20">
                 <header className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 mb-4">
                       <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Transaction Details</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Payment Info</h1>
                    <p className="text-slate-500 mt-3 text-sm font-medium italic leading-relaxed">
                       Please enter the amount you wish to pay and your account details.
                    </p>
                 </header>

                 <form onSubmit={(e) => { e.preventDefault(); handlePayment(); }} className="space-y-8">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Amount ($)</label>
                          <div className="relative group">
                             <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
                             <input 
                                required
                                type="number" 
                                value={paymentAmount} 
                                onChange={e => setPaymentAmount(e.target.value)} 
                                placeholder="0.00" 
                                className="w-full pl-16 pr-8 py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-4xl font-black font-mono outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white shadow-sm" 
                             />
                          </div>
                       </div>

                       {(selectedMethod.includes('ecocash') || selectedMethod.includes('omari')) && (
                         <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mobile Wallet Number</label>
                           <div className="relative">
                              <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                required
                                value={phoneNumber} 
                                onChange={e => setPhoneNumber(e.target.value)} 
                                placeholder="07XXXXXXXX" 
                                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold font-mono outline-none focus:border-blue-500 transition-all dark:text-white" 
                              />
                           </div>
                         </div>
                       )}

                       {selectedMethod === 'visamastercard' && (
                         <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Card Number</label>
                              <div className="relative">
                                 <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                 <input 
                                    required
                                    value={cardNumber} 
                                    onChange={e => setCardNumber(e.target.value)} 
                                    placeholder="0000 0000 0000 0000" 
                                    className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold font-mono outline-none focus:border-blue-500 transition-all dark:text-white" 
                                 />
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Expiry</label>
                                 <input required placeholder="MM/YY" className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold font-mono outline-none focus:border-blue-500 transition-all dark:text-white" />
                              </div>
                              <div className="space-y-1">
                                 <label className="text-[9px] font-black uppercase text-slate-400 ml-1">CVC</label>
                                 <input required placeholder="***" type="password" maxLength={3} className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold font-mono outline-none focus:border-blue-500 transition-all dark:text-white" />
                              </div>
                           </div>
                         </div>
                       )}

                       <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl flex items-start gap-4">
                          <Lock size={18} className="text-blue-600 mt-1 shrink-0" />
                          <p className="text-[11px] text-blue-700 dark:text-blue-300 font-bold leading-relaxed italic">
                             "Your payment details are encrypted. This is a secure sandbox environment for terminal verification."
                          </p>
                       </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isProcessing || !paymentAmount}
                      className="group w-full py-5 bg-[#002D50] dark:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 transition-all hover:bg-black dark:hover:bg-blue-700"
                    >
                       {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <>Verify and Finalize Payment <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                 </form>
                 
                 <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
                   <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Powered by Motion Max Secure Gateway v3.1</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Audit Logs History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowHistory(false)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl flex flex-col h-[85vh] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-10 duration-700">
            <header className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-6">
                 <div className="p-4 bg-slate-50 text-blue-600 rounded-[1.5rem] shadow-sm border border-slate-100">
                    <History size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white leading-none">Account Ledger</h3>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Complete payment and procurement audit history</p>
                 </div>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 transition-all"><X size={32}/></button>
            </header>
            <div className="flex-1 overflow-y-auto p-10 sidebar-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b-2 border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-8 py-6">Transaction Date</th>
                    <th className="px-8 py-6">Provider Node</th>
                    <th className="px-8 py-6">Amount (USD)</th>
                    <th className="px-8 py-6 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold divide-y divide-slate-50 dark:divide-slate-800">
                  {studentPayments.length > 0 ? studentPayments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-blue-900/10 transition-colors group">
                      <td className="px-8 py-10 font-mono text-slate-600 dark:text-slate-400">{new Date(p.timestamp).toLocaleDateString()}</td>
                      <td className="px-8 py-10 uppercase text-slate-900 dark:text-white">{p.method}</td>
                      <td className="px-8 py-10 text-blue-600 text-2xl font-black font-mono tracking-tighter">${p.amount.toLocaleString()}</td>
                      <td className="px-8 py-10 text-right">
                        <button 
                          onClick={() => { setIsGeneratingPdf(p.id); generateStatementPDF('Receipt', p).finally(()=>setIsGeneratingPdf(null)); }} 
                          disabled={isGeneratingPdf === p.id}
                          className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                        >
                          {isGeneratingPdf === p.id ? <Loader2 size={20} className="animate-spin" /> : <Download size={20}/>}
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="py-32 text-center text-xs font-black uppercase text-slate-300 italic tracking-widest">No transaction records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <footer className="p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Node Online</span>
               </div>
               <p className="text-[10px] font-black uppercase text-slate-500">{studentPayments.length} Total Records Found</p>
            </footer>
          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowSuccess(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] p-12 text-center space-y-8 border-4 border-white dark:border-slate-800 shadow-2xl animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl ring-8 ring-emerald-50/50">
              <CheckCircle2 size={48} className="animate-bounce" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tight leading-none">Ledger Updated</h3>
              <p className="text-sm font-medium text-slate-400 italic">Your transaction has been verified and recorded successfully.</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="w-full py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Close Terminal</button>
          </div>
        </div>
      )}
    </div>
  );
};
