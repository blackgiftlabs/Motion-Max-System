
import React from 'react';
import { Student, Staff } from '../../types';

interface Props {
  student: Student;
  isEditing: boolean;
  editForm: Partial<Student>;
  setEditForm: (form: Partial<Student>) => void;
  staff: Staff[];
  settings: any;
  isAdmin: boolean;
}

const Row = ({ label, value, field, isEditing, editForm, setEditForm, options }: any) => (
  <tr className="border-b border-slate-100 dark:border-slate-800/50 group/row">
    <td className="py-4 px-2 w-1/3 text-[10px] font-black uppercase tracking-widest text-slate-950 dark:text-slate-200 group-hover/row:text-blue-600 transition-colors">{label}</td>
    <td className="py-4 px-2">
      {isEditing && field ? (
        options ? (
          <select className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-[#3E6A8A] dark:border-[#9DB6BF] text-black dark:text-white rounded-none text-sm font-bold outline-none" value={(editForm as any)[field] || ''} onChange={e => setEditForm({...editForm, [field]: e.target.value})}>
            <option value="">Select...</option>
            {options.map((opt: any) => <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>)}
          </select>
        ) : (
          <input type="text" className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-[#3E6A8A] dark:border-[#9DB6BF] text-black dark:text-white rounded-none text-sm font-bold outline-none" value={(editForm as any)[field] || ''} onChange={e => setEditForm({...editForm, [field]: e.target.value})} />
        )
      ) : <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{value || '---'}</span>}
    </td>
  </tr>
);

export const PersonalInfo: React.FC<Props> = ({ student, isEditing, editForm, setEditForm, staff, settings, isAdmin }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-500">
    <div className="space-y-8">
      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 border-b border-slate-100 pb-2">Student Identity</h3>
      <table className="w-full">
        <tbody>
          <Row label="First Name" value={student.firstName} field="firstName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
          <Row label="Surname" value={student.lastName} field="lastName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
          <Row label="Birth Date" value={student.dob} field="dob" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
          <Row label="Gender" value={student.gender} field="gender" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={['Male', 'Female']} />
          <Row label="Class Room" value={student.assignedClass} field="assignedClass" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={settings?.classes || []} />
          {isAdmin && <Row label="Primary Teacher" value={staff.find(s => s.id === student.assignedStaffId)?.fullName} field="assignedStaffId" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={staff.map(s => ({ value: s.id, label: s.fullName }))} />}
        </tbody>
      </table>
    </div>
    <div className="space-y-8">
      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 border-b border-slate-100 pb-2">Guardian Contact</h3>
      <table className="w-full">
        <tbody>
          <Row label="Guardian Name" value={student.parentName} field="parentName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
          <Row label="Email Address" value={student.parentEmail} field="parentEmail" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
          <Row label="Contact Number" value={student.parentPhone} field="parentPhone" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
          <Row label="Home Address" value={student.homeAddress} field="homeAddress" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
        </tbody>
      </table>
    </div>
  </div>
);
