
export type Role = 'SUPER_ADMIN' | 'SPECIALIST' | 'PARENT' | 'ADMIN_SUPPORT' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface MedicalRecordEntry {
  id: string;
  date: string;
  content: string;
  type: 'DIAGNOSIS' | 'OBSERVATION';
  staffId: string;
  staffName: string;
  pdfUrl?: string;
  pdfName?: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female';
  enrollmentDate: string;
  termEntry?: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  homeAddress: string;
  diagnosis: string;
  diagnosisPdf?: string; 
  medicalRecords: string;
  socialHistory: string;
  targetBehaviors: string;
  uniformSizes: string;
  assignedStaffId: string;
  assignedClass: string;
  imageUrl?: string;
  firebaseUid?: string;
  totalPaid?: number;
  healthHistory?: MedicalRecordEntry[];
}

export interface StudentApplication {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female';
  address: string;
  guardianPhone: string;
  guardianEmail: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  adminReply?: string;
  timestamp: string;
}

export interface NoticeReply {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export interface NoticeView {
  userId: string;
  userName: string;
  timestamp: string;
}

export type NoticeTarget = 'PARENT' | 'SPECIALIST' | 'ADMIN_SUPPORT' | 'ALL';
export type NoticeType = 'General' | 'Fees' | 'Meeting';

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: NoticeType;
  target: NoticeTarget;
  authorId: string;
  authorName: string;
  timestamp: string;
  replies: NoticeReply[];
  views: NoticeView[];
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: string;
  timestamp: string;
  isMock: boolean;
  reference?: string;
  verificationHash: string;
  qrCodeUrl: string;
}

export interface MilestoneItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface MilestoneRecord {
  id: string;
  studentId: string;
  ageCategory: string;
  sections: {
    title: string;
    items: MilestoneItem[];
  }[];
  redFlags: MilestoneItem[];
  overallPercentage: number;
  timestamp: string;
  staffId: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  studentId: string;
  studentFullName: string;
  firebaseUid: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  nationalId?: string;
  passportNumber?: string;
  nationality: string;
  gender: 'Male' | 'Female';
  address: string;
  position: string; 
  email: string;
  phone: string;
  role: Role;
  assignedClasses: string[];
  imageUrl?: string;
}

export interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  coverLetter: string;
  cvBase64?: string;
  cvName?: string;
  status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected';
  timestamp: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  studentId: string;
  studentName: string;
  items: OrderItem[];
  total: number;
  paymentMethod: 'Visa-Mastercard' | 'Ecocash' | 'Omari';
  status: 'Uncollected' | 'Collected';
  timestamp: string;
}

export interface PositionEntry {
  name: string;
  active: boolean;
}

export interface SystemSettings {
  positions: PositionEntry[];
  classes: string[];
  feesAmount: number;
  currentTerm: string;
  nextTermStartDate?: string; 
  defaultTaskSteps?: string[]; 
}

export type PromptLevel = '+' | 'FP' | 'PP' | 'DV' | 'IDV' | 'GP' | 'VP' | '-';

export interface TaskStep {
  id: string;
  description: string;
  trials: PromptLevel[]; 
}

export interface ProgramRequest {
  id: string;
  activity: string;
  echoicTempted: number;
  noVerbalTempted: number;
  noEchoicNoTempting: number;
}

export interface SessionLog {
  id: string;
  studentId: string;
  staffId: string;
  date: string;
  targetBehavior: string;
  method: 'Forward Chaining' | 'Backward Chaining' | 'Total Task';
  steps: TaskStep[];
  programRequests?: ProgramRequest[];
  independenceScore: number;
  goalPerHour?: number;
  actualHour?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'Required' | 'Optional';
  imageUrl: string;
}

export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}
