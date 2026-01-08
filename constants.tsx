
import React from 'react';
import { LayoutDashboard, Users, HeartPulse, ShoppingCart, Calendar, Settings, FileText, ClipboardList, ShieldCheck } from 'lucide-react';

export const PROMPT_LEVELS = [
  { key: '+', label: 'Correct', color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'FP', label: 'Full Physical', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'PP', label: 'Partial Physical', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'DV', label: 'Direct Visual', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { key: 'IDV', label: 'Indirect Verbal', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { key: 'GP', label: 'Gesture', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { key: 'VP', label: 'Visual', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { key: '-', label: 'Incorrect', color: 'bg-red-100 text-red-700 border-red-200' },
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['SUPER_ADMIN', 'SPECIALIST', 'PARENT', 'ADMIN_SUPPORT'] },
  { id: 'admin', label: 'Admin Portal', icon: <ShieldCheck size={20} />, roles: ['SUPER_ADMIN'] },
  { id: 'students', label: 'Students', icon: <Users size={20} />, roles: ['SUPER_ADMIN', 'SPECIALIST', 'ADMIN_SUPPORT'] },
  { id: 'clinical', label: 'Check Progress', icon: <HeartPulse size={20} />, roles: ['SUPER_ADMIN', 'SPECIALIST'] },
  { id: 'milestones', label: 'Milestones', icon: <ClipboardList size={20} />, roles: ['SUPER_ADMIN', 'SPECIALIST', 'PARENT'] },
  { id: 'shop', label: 'Uniform Shop', icon: <ShoppingCart size={20} />, roles: ['SUPER_ADMIN', 'PARENT', 'ADMIN_SUPPORT'] },
  { id: 'reports', label: 'Reports', icon: <FileText size={20} />, roles: ['SUPER_ADMIN', 'SPECIALIST'] },
  { id: 'settings', label: 'System Settings', icon: <Settings size={20} />, roles: ['SUPER_ADMIN'] },
];

export const MOCK_USER = {
  id: 'staff-1',
  name: 'Kevin Muzangaza',
  email: 'kevin@motionmax.com',
  role: 'SUPER_ADMIN' as const,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin'
};
