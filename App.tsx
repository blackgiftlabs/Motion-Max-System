
import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { AppShell } from './components/common/AppShell';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { TherapistDashboard } from './components/TherapistDashboard';
import { StaffManagement } from './components/StaffManagement';
import { StudentDirectory } from './components/StudentDirectory';
import { ClinicalABA } from './components/ClinicalABA';
import { LessonLogs } from './components/LessonLogs';
import { AdminClinicalLogs } from './components/AdminClinicalLogs';
import { UniformShop } from './components/UniformShop';
import { SystemSettings } from './components/SystemSettings';
import { StudentDashboard } from './components/student/StudentDashboard';
import { SchoolFees } from './components/student/SchoolFees';
import { ApplicationsManagement } from './components/ApplicationsManagement';
import { StudentApplications } from './components/admin/StudentApplications';
import { TransactionsManagement } from './components/TransactionsManagement';
import { OrderHistory } from './components/OrderHistory';
import { ReceiptVerification } from './components/student/ReceiptVerification';
import { OnlineApplication } from './components/landing/OnlineApplication';
import { CareersPage } from './components/landing/CareersPage';
import { NoticesSlideOver } from './components/common/NoticesSlideOver';
import { AdminNotices } from './components/AdminNotices';
import { SystemLogs } from './components/SystemLogs';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { autoSeed } from './utils/seeder';

const NotificationHost = () => {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="fixed top-6 right-6 z-[700] flex flex-col gap-3 pointer-events-none">
      {(notifications || []).map((n) => (
        <div 
          key={n.id} 
          className={`
            pointer-events-auto min-w-[320px] max-w-md p-5 rounded-none shadow-2xl flex items-center justify-between gap-4 border-l-4 animate-notification-in
            ${n.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : ''}
            ${n.type === 'error' ? 'bg-rose-50 border-rose-500 text-rose-800' : ''}
            ${n.type === 'info' ? 'bg-blue-50 border-blue-500 text-blue-800' : ''}
          `}
        >
          <div className="flex items-center gap-3">
            {n.type === 'success' && <CheckCircle2 size={24} />}
            {n.type === 'error' && <AlertCircle size={24} />}
            {n.type === 'info' && <Info size={24} />}
            <p className="text-sm font-black uppercase tracking-tight">{n.message}</p>
          </div>
          <button onClick={() => removeNotification(n.id)} className="opacity-40 hover:opacity-100 transition-opacity">
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const { view, setView, activeTab, setActiveTab, isLoggedIn, theme, user, initializeData } = useStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    initializeData();
    autoSeed(); 
    
    const params = new URLSearchParams(window.location.search);
    if (params.has('v')) {
      setView('verify');
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        if (event.state.view) setView(event.state.view, true);
        if (event.state.activeTab) setActiveTab(event.state.activeTab, true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [theme]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, activeTab]);

  const renderContent = () => {
    if (view === 'verify') return <ReceiptVerification />;
    if (view === 'apply') return <OnlineApplication />;
    if (view === 'careers') return <CareersPage />;

    if (!isLoggedIn) {
      if (view === 'login') {
        return (
          <div className="relative w-screen h-screen overflow-hidden animate-notification-in">
            <LoginPage />
          </div>
        );
      }
      return <LandingPage />;
    }

    const role = user?.role;

    if (role === 'STUDENT' || role === 'PARENT') {
      if (activeTab === 'dashboard' || activeTab === 'progress') return <StudentDashboard />;
      if (activeTab === 'clinical-history') return <AdminClinicalLogs />;
      if (activeTab === 'order-history') return <OrderHistory />;
      if (activeTab === 'shop') return <UniformShop />;
      if (activeTab === 'settings') return <SystemSettings />;
      if (activeTab === 'fees') return <SchoolFees />;
    }

    if (role === 'SPECIALIST') {
      if (activeTab === 'dashboard') return <TherapistDashboard />;
      if (activeTab === 'my-students' || activeTab === 'students') return <StudentDirectory />;
      if (activeTab === 'clinical') return <ClinicalABA />;
      if (activeTab === 'clinical-logs') return <LessonLogs />;
      if (activeTab === 'settings') return <SystemSettings />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'staff':
      case 'admin':
        return <StaffManagement />;
      case 'applications':
        return <ApplicationsManagement />;
      case 'student-applications':
        return <StudentApplications />;
      case 'orders':
        return <TransactionsManagement />;
      case 'order-history':
        return <OrderHistory />;
      case 'students':
      case 'my-students':
        return <StudentDirectory />;
      case 'clinical':
        return <ClinicalABA />;
      case 'clinical-logs':
        return <LessonLogs />;
      case 'shop': return <UniformShop />;
      case 'settings': return <SystemSettings />;
      case 'notices': return <AdminNotices />;
      case 'system-logs': return <SystemLogs />;
      
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800 p-12">
             <div className="w-20 h-20 rounded-none bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
               <span className="text-4xl">⚙️</span>
             </div>
             <h2 className="text-2xl font-black uppercase tracking-tight">Module Loading</h2>
             <p className="text-slate-500 mt-2 max-w-sm">The <b>{activeTab}</b> module is being configured for your account.</p>
          </div>
        );
    }
  };

  return (
    <>
      <NotificationHost />
      <NoticesSlideOver />
      {isLoggedIn && view !== 'verify' && view !== 'apply' && view !== 'careers' ? (
        <AppShell>
          {renderContent()}
        </AppShell>
      ) : (
        renderContent()
      )}
    </>
  );
};

export default App;
