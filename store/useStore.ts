
import { create } from 'zustand';
import { User, Role, Student, Staff, Parent, SystemSettings, SystemLog, SessionLog, Application, ShopItem, Order, MilestoneRecord, PaymentRecord, Notice, NoticeTarget, NoticeType, StudentApplication } from '../types';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot,
  query,
  orderBy,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  limit,
  arrayUnion
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBQZSWdzzx1IJWGGbxPZH7GxudX5zNYHbw",
  authDomain: "nhaurwa-70692.firebaseapp.com",
  projectId: "nhaurwa-70692",
  storageBucket: "nhaurwa-70692.firebasestorage.app",
  messagingSenderId: "448641589213",
  appId: "1:448641589213:web:bd18d8220f571f8fe7a034"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const secondaryApp = getApps().length > 1 ? getApp("Secondary") : initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

type View = 'landing' | 'login' | 'app' | 'careers' | 'shop' | 'verify' | 'apply' | 'tour';

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface CartItem extends ShopItem {
  cartId: string;
  quantity: number;
}

export interface MilestoneTemplate {
  id: string;
  label: string;
  minAge: number; // in months
  maxAge: number; // in months
  sections: {
    title: string;
    items: string[];
  }[];
  redFlags: string[];
}

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: User | null;
  isLoggedIn: boolean;
  view: View;
  setView: (view: View) => void;
  login: (role: Role, credentials: { email: string; pass: string }) => Promise<void>;
  logout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: (open?: boolean) => void;
  isNoticesOpen: boolean;
  toggleNotices: (open?: boolean) => void;
  notifications: AppNotification[];
  notify: (type: 'success' | 'error' | 'info', message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  students: Student[];
  staff: Staff[];
  parents: Parent[];
  clinicalLogs: SessionLog[];
  systemLogs: SystemLog[];
  applications: Application[];
  studentApplications: StudentApplication[];
  shopItems: ShopItem[];
  cart: CartItem[];
  orders: Order[];
  payments: PaymentRecord[];
  milestoneRecords: MilestoneRecord[];
  milestoneTemplates: MilestoneTemplate[];
  notices: Notice[];
  settings: SystemSettings;
  selectedStudentIdForLog: string | null;
  setSelectedStudentIdForLog: (id: string | null) => void;
  initializeData: () => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (uid: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (uid: string) => Promise<void>;
  addStaff: (staff: Staff) => Promise<void>;
  updateStaff: (id: string, data: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  updateUserProfile: (data: { name?: string; password?: string }) => Promise<void>;
  addSystemLog: (action: string, details: string) => Promise<void>;
  addClinicalLog: (log: Omit<SessionLog, 'id'>) => Promise<void>;
  submitApplication: (app: Omit<Application, 'id' | 'status' | 'timestamp'>) => Promise<void>;
  updateApplicationStatus: (id: string, status: Application['status']) => Promise<void>;
  submitStudentApplication: (app: Omit<StudentApplication, 'id' | 'status' | 'timestamp'>) => Promise<void>;
  updateStudentApplicationStatus: (id: string, status: StudentApplication['status'], reply?: string) => Promise<void>;
  addShopItem: (item: Omit<ShopItem, 'id'>) => Promise<void>;
  deleteShopItem: (id: string) => Promise<void>;
  addToCart: (item: ShopItem) => void;
  updateCartQuantity: (cartId: string, delta: number) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  placeOrder: (orderData: Omit<Order, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  saveMilestoneRecord: (record: Omit<MilestoneRecord, 'id' | 'timestamp' | 'staffId'>) => Promise<void>;
  saveMilestoneTemplate: (template: MilestoneTemplate) => Promise<void>;
  deleteMilestoneTemplate: (id: string) => Promise<void>;
  addPayment: (payment: Omit<PaymentRecord, 'id' | 'qrCodeUrl' | 'verificationHash'>) => Promise<void>;
  addNotice: (title: string, content: string, type: NoticeType, target: NoticeTarget) => Promise<void>;
  replyToNotice: (noticeId: string, message: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => {
  onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          set({ user: userData, isLoggedIn: true, view: 'app', activeTab: 'dashboard' });
          get().addSystemLog('Login', `User ${userData.name} logged in.`);
        }
      } catch (err) {
        console.error("Auth sync error:", err);
      }
    } else {
      set({ user: null, isLoggedIn: false });
    }
  });

  return {
    theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    }),
    user: null,
    isLoggedIn: false,
    view: 'landing',
    setView: (view) => set({ view }),
    isMobileMenuOpen: false,
    toggleMobileMenu: (open) => set((state) => ({ isMobileMenuOpen: open !== undefined ? open : !state.isMobileMenuOpen })),
    isNoticesOpen: false,
    toggleNotices: (open) => set((state) => ({ isNoticesOpen: open !== undefined ? open : !state.isNoticesOpen })),
    notifications: [],
    notify: (type, message, duration = 5000) => {
      const id = Math.random().toString(36).substring(7);
      set(state => ({ notifications: [...state.notifications, { id, type, message }] }));
      setTimeout(() => get().removeNotification(id), duration);
    },
    removeNotification: (id) => set(state => ({ notifications: state.notifications.filter(n => n.id !== id) })),
    settings: { positions: ['Teacher', 'Assistant', 'Admin'], classes: [], feesAmount: 500, currentTerm: 'Term 1' },
    selectedStudentIdForLog: null,
    setSelectedStudentIdForLog: (id) => set({ selectedStudentIdForLog: id }),
    students: [],
    staff: [],
    parents: [],
    clinicalLogs: [],
    systemLogs: [],
    applications: [],
    studentApplications: [],
    shopItems: [],
    cart: [],
    orders: [],
    payments: [],
    milestoneRecords: [],
    milestoneTemplates: [],
    notices: [],
    login: async (role, credentials) => {
      const { email, pass } = credentials;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const fbUser = userCredential.user;
        const userDocRef = doc(db, 'users', fbUser.uid);
        let userDoc = await getDoc(userDocRef);
        if (!userDoc.exists() && email === 'admin@gmail.com') {
          const profile: User = { id: fbUser.uid, name: 'Admin', email: email, role: 'SUPER_ADMIN', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin` };
          await setDoc(userDocRef, profile);
          userDoc = await getDoc(userDocRef);
        }
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (userData.role !== role) { await signOut(auth); throw new Error('ROLE_MISMATCH'); }
          set({ user: userData, isLoggedIn: true, view: 'app', activeTab: 'dashboard' });
          get().notify('success', 'Logged in successfully.');
        } else { await signOut(auth); throw new Error('PROFILE_NOT_FOUND'); }
      } catch (error: any) { throw error; }
    },
    logout: async () => {
      const u = get().user;
      if (u) await get().addSystemLog('Logout', `User ${u.name} logged out.`);
      await signOut(auth);
      set({ isLoggedIn: false, view: 'landing', user: null, isMobileMenuOpen: false, cart: [] });
      get().notify('info', 'Logged out.');
    },
    activeTab: 'dashboard',
    setActiveTab: (activeTab) => set({ activeTab, isMobileMenuOpen: false }),
    initializeData: () => {
      onSnapshot(query(collection(db, 'students'), orderBy('fullName')), (snapshot) => {
        set({ students: snapshot.docs.map(doc => ({ ...doc.data() } as Student)) });
      });
      onSnapshot(query(collection(db, 'staff'), orderBy('fullName')), (snapshot) => {
        set({ staff: snapshot.docs.map(doc => ({ ...doc.data() } as Staff)) });
      });
      onSnapshot(query(collection(db, 'parents'), orderBy('name')), (snapshot) => {
        set({ parents: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Parent)) });
      });
      onSnapshot(query(collection(db, 'clinical_logs'), orderBy('date', 'desc'), limit(100)), (snapshot) => {
        set({ clinicalLogs: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SessionLog)) });
      });
      onSnapshot(query(collection(db, 'shop_items'), orderBy('name')), (snapshot) => {
        set({ shopItems: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ShopItem)) });
      });
      onSnapshot(query(collection(db, 'milestone_records'), orderBy('timestamp', 'desc')), (snapshot) => {
        set({ milestoneRecords: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as MilestoneRecord)) });
      });
      onSnapshot(query(collection(db, 'milestone_templates'), orderBy('label')), (snapshot) => {
        set({ milestoneTemplates: snapshot.docs.map(doc => ({ ...doc.data() } as MilestoneTemplate)) });
      });
      onSnapshot(query(collection(db, 'payments'), orderBy('timestamp', 'desc')), (snapshot) => {
        set({ payments: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as PaymentRecord)) });
      });
      onSnapshot(query(collection(db, 'notices'), orderBy('timestamp', 'desc')), (snapshot) => {
        set({ notices: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notice)) });
      });
      onSnapshot(query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(200)), (snapshot) => {
        set({ systemLogs: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SystemLog)) });
      });
      onSnapshot(query(collection(db, 'orders'), orderBy('timestamp', 'desc')), (snapshot) => {
        set({ orders: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order)) });
      });
      onSnapshot(query(collection(db, 'applications'), orderBy('timestamp', 'desc')), (snapshot) => {
        set({ applications: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Application)) });
      });
      onSnapshot(query(collection(db, 'student_applications'), orderBy('timestamp', 'desc')), (snapshot) => {
        set({ studentApplications: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StudentApplication)) });
      });
      onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
        if (snapshot.exists()) set({ settings: snapshot.data() as SystemSettings });
      });
    },
    updateSettings: async (newSettings) => {
      try {
        const settingsRef = doc(db, 'settings', 'global');
        await setDoc(settingsRef, { ...get().settings, ...newSettings }, { merge: true });
        get().notify('success', 'Settings saved.');
        get().addSystemLog('Update', `System settings updated.`);
      } catch (err) {
        get().notify('error', 'Update failed.');
      }
    },
    addStudent: async (studentData) => {
      try {
        const fullName = `${studentData.firstName} ${studentData.lastName}`;
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef);
        const snapshot = await getDocs(q);
        const count = snapshot.size + 1;
        const formattedId = `MM${count.toString().padStart(3, '0')}`;
        const email = `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase()}@motionmax.com`;
        const studentUserCredential = await createUserWithEmailAndPassword(secondaryAuth, email, "000000");
        const studentUid = studentUserCredential.user.uid;
        const finalStudent = { ...studentData, fullName, id: formattedId, firebaseUid: studentUid, totalPaid: 0 };
        await setDoc(doc(db, 'students', studentUid), finalStudent);
        await setDoc(doc(db, 'users', studentUid), { id: studentUid, name: fullName, email: email, role: 'STUDENT', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}` });
        
        const parentUserCredential = await createUserWithEmailAndPassword(secondaryAuth, studentData.parentEmail, "000000");
        const parentUid = parentUserCredential.user.uid;
        const parentRecord: Parent = { id: parentUid, name: studentData.parentName, email: studentData.parentEmail, phone: studentData.parentPhone, address: studentData.homeAddress, studentId: formattedId, studentFullName: fullName, firebaseUid: parentUid };
        await setDoc(doc(db, 'parents', parentUid), parentRecord);
        await setDoc(doc(db, 'users', parentUid), { id: parentUid, name: studentData.parentName, email: studentData.parentEmail, role: 'PARENT', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentData.parentName}` });
        
        await signOut(secondaryAuth);
        get().addSystemLog('Creation', `Added student: ${fullName}.`);
        get().notify('success', `Student added.`);
      } catch (err: any) { get().notify('error', err.message); }
    },
    updateStudent: async (uid, data) => {
      try {
        await updateDoc(doc(db, 'students', uid), data);
        get().addSystemLog('Update', `Updated info for student ${uid}.`);
        get().notify('success', 'Information updated.');
      } catch (err: any) { get().notify('error', err.message); }
    },
    deleteStudent: async (uid) => {
      try {
        const studentDoc = await getDoc(doc(db, 'students', uid));
        if (studentDoc.exists()) {
          const sData = studentDoc.data() as Student;
          await deleteDoc(doc(db, 'students', uid));
          await deleteDoc(doc(db, 'users', uid));
          get().addSystemLog('Deletion', `Deleted student: ${sData.fullName}.`);
          get().notify('success', 'Student removed.');
        }
      } catch (err: any) { get().notify('error', err.message); }
    },
    addStaff: async (staffData) => {
      try {
        const fullName = `${staffData.firstName} ${staffData.lastName}`;
        const email = staffData.email;
        const staffCredential = await createUserWithEmailAndPassword(secondaryAuth, email, "000000");
        const staffUid = staffCredential.user.uid;
        await setDoc(doc(db, 'staff', staffUid), { ...staffData, fullName, id: staffUid, firebaseUid: staffUid });
        await setDoc(doc(db, 'users', staffUid), { id: staffUid, name: fullName, email: email, role: staffData.role, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}` });
        await signOut(secondaryAuth);
        get().addSystemLog('Creation', `Added staff member: ${fullName}.`);
        get().notify('success', `Staff member added.`);
      } catch (err: any) { get().notify('error', err.message); }
    },
    updateStaff: async (id, data) => {
      try {
        await updateDoc(doc(db, 'staff', id), data);
        get().addSystemLog('Update', `Updated staff record for ${id}.`);
        get().notify('success', 'Staff details updated.');
      } catch (err: any) { get().notify('error', err.message); }
    },
    deleteStaff: async (id) => {
      try {
        const staffDoc = await getDoc(doc(db, 'staff', id));
        if (staffDoc.exists()) {
          const sData = staffDoc.data() as Staff;
          await deleteDoc(doc(db, 'staff', id));
          await deleteDoc(doc(db, 'users', id));
          get().addSystemLog('Deletion', `Deleted staff member: ${sData.fullName}.`);
          get().notify('success', 'Staff member removed.');
        }
      } catch (err: any) { get().notify('error', err.message); }
    },
    updateUserProfile: async ({ name, password }) => {
      const fbUser = auth.currentUser;
      if (!fbUser) return;
      try {
        if (name) {
          await updateProfile(fbUser, { displayName: name });
          await updateDoc(doc(db, 'users', fbUser.uid), { name });
          set(state => ({ user: state.user ? { ...state.user, name } : null }));
          get().addSystemLog('Update', `User changed name to ${name}.`);
        }
        if (password) {
          await updatePassword(fbUser, password);
          get().addSystemLog('Update', `User changed password.`);
        }
        get().notify('success', 'Profile updated.');
      } catch (err: any) { get().notify('error', err.message); }
    },
    addSystemLog: async (action, details) => {
      const u = get().user;
      try {
        await addDoc(collection(db, 'logs'), { userId: u?.id || 'system', userName: u?.name || 'System', action, details, timestamp: new Date().toISOString() });
      } catch (err) { console.error(err); }
    },
    addClinicalLog: async (logData) => {
      const u = get().user;
      try {
        await addDoc(collection(db, 'clinical_logs'), { ...logData, staffId: u?.id || 'unknown' });
        get().addSystemLog('Growth', `Recorded growth for student ${logData.studentId}.`);
        get().notify('success', 'Progress saved.');
      } catch (err: any) { get().notify('error', err.message); }
    },
    submitApplication: async (appData) => {
      try {
        await addDoc(collection(db, 'applications'), { ...appData, status: 'Pending', timestamp: new Date().toISOString() });
        get().addSystemLog('Application', `Job application from ${appData.fullName}.`);
        get().notify('success', 'Application sent successfully.');
      } catch (err: any) { get().notify('error', err.message); }
    },
    updateApplicationStatus: async (id, status) => {
      try {
        await updateDoc(doc(db, 'applications', id), { status });
        get().addSystemLog('Application', `Application status: ${status} for ${id}.`);
        get().notify('success', `Status updated: ${status}`);
      } catch (err: any) { get().notify('error', err.message); }
    },
    submitStudentApplication: async (appData) => {
      try {
        await addDoc(collection(db, 'student_applications'), { ...appData, status: 'Pending', timestamp: new Date().toISOString() });
        get().addSystemLog('Admission', `New online student application: ${appData.firstName} ${appData.lastName}.`);
        get().notify('success', 'Your application has been submitted to the admin office.');
      } catch (err: any) { get().notify('error', err.message); }
    },
    updateStudentApplicationStatus: async (id, status, reply) => {
      try {
        await updateDoc(doc(db, 'student_applications', id), { status, adminReply: reply });
        get().addSystemLog('Admission', `Student application ${id} status updated to ${status}.`);
        get().notify('success', `Application ${status.toLowerCase()}. Notification prepared.`);
      } catch (err: any) { get().notify('error', err.message); }
    },
    addShopItem: async (item) => {
      try {
        await addDoc(collection(db, 'shop_items'), item);
        get().addSystemLog('Inventory', `Added item: ${item.name}.`);
        get().notify('success', 'Item added.');
      } catch (err: any) { get().notify('error', err.message); }
    },
    deleteShopItem: async (id) => {
      try {
        await deleteDoc(doc(db, 'shop_items', id));
        get().addSystemLog('Inventory', `Removed item: ${id}.`);
        get().notify('success', 'Item removed.');
      } catch (err: any) { get().notify('error', err.message); }
    },
    addToCart: (item) => {
      const existing = get().cart.find(i => i.id === item.id);
      if (existing) {
        get().updateCartQuantity(existing.cartId, 1);
        return;
      }
      const cartId = Math.random().toString(36).substring(7);
      set(state => ({ cart: [...state.cart, { ...item, cartId, quantity: 1 }] }));
    },
    updateCartQuantity: (cartId, delta) => {
      set(state => ({ cart: state.cart.map(i => i.cartId === cartId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i) }));
    },
    removeFromCart: (cartId) => {
      set(state => ({ cart: state.cart.filter(i => i.cartId !== cartId) }));
    },
    clearCart: () => set({ cart: [] }),
    placeOrder: async (orderData) => {
      try {
        await addDoc(collection(db, 'orders'), { ...orderData, status: 'Uncollected', timestamp: new Date().toISOString() });
        get().addSystemLog('Purchase', `Order for ${orderData.studentName}. Total: $${orderData.total}.`);
        get().clearCart();
        get().notify('success', 'Purchase completed successfully.');
      } catch (err: any) { get().notify('error', err.message); }
    },
    updateOrderStatus: async (orderId, status) => {
      try {
        await updateDoc(doc(db, 'orders', orderId), { status });
        get().addSystemLog('Order', `Order ${orderId} is ${status}.`);
        get().notify('success', `Order status: ${status}`);
      } catch (err: any) { get().notify('error', err.message); }
    },
    saveMilestoneRecord: async (record) => {
      try {
        await addDoc(collection(db, 'milestone_records'), {
          ...record,
          staffId: get().user?.id || 'system',
          timestamp: new Date().toISOString()
        });
        get().addSystemLog('Growth', `Milestone saved for student ${record.studentId}.`);
        get().notify('success', 'Record saved.');
      } catch (err: any) { get().notify('error', err.message); }
    },
    saveMilestoneTemplate: async (template) => {
      try {
        await setDoc(doc(db, 'milestone_templates', template.id), template);
      } catch (err: any) { get().notify('error', err.message); }
    },
    deleteMilestoneTemplate: async (id) => {
      try {
        await deleteDoc(doc(db, 'milestone_templates', id));
        get().notify('success', 'Checklist removed.');
      } catch (err: any) { get().notify('error', err.message); }
    },
    addPayment: async (payment) => {
      try {
        const hash = Math.random().toString(36).substring(2, 15);
        const qrCodeUrl = `https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(hash)}`;
        await addDoc(collection(db, 'payments'), { ...payment, verificationHash: hash, qrCodeUrl: qrCodeUrl, timestamp: new Date().toISOString() });
        get().addSystemLog('Payment', `Payment received: $${payment.amount} for ${payment.studentName}.`);
      } catch (err: any) { get().notify('error', err.message); }
    },
    addNotice: async (title, content, type, target) => {
      const u = get().user;
      if (!u) return;
      try {
        await addDoc(collection(db, 'notices'), {
          title, content, type, target,
          authorId: u.id, authorName: u.name,
          timestamp: new Date().toISOString(),
          replies: []
        });
        get().addSystemLog('Notice', `New announcement: ${title}.`);
      } catch (err: any) { get().notify('error', 'Notice failed.'); }
    },
    replyToNotice: async (noticeId, message) => {
      const u = get().user;
      if (!u) return;
      try {
        const reply = {
          id: Math.random().toString(36).substring(7),
          userId: u.id, userName: u.name,
          message, timestamp: new Date().toISOString()
        };
        await updateDoc(doc(db, 'notices', noticeId), { replies: arrayUnion(reply) });
      } catch (err: any) { get().notify('error', 'Reply failed.'); }
    }
  };
});
