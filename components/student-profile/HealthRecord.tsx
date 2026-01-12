
import React from 'react';
import { Student } from '../../types';
import { FileText } from 'lucide-react';

interface Props {
  student: Student;
  isEditing: boolean;
  editForm: Partial<Student>;
  setEditForm: (form: Partial<Student>) => void;
  onViewPdf: (url: string) => void;
  onUploadPdf: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const HealthRecord: React.FC<Props> = ({ student, isEditing, editForm, setEditForm, onViewPdf, onUploadPdf }) => (
  <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-rose-600 border-b border-slate-100 pb-2">Medical Profile</h3>
    <div className="grid grid-cols-1 gap-6">
      <div className={`p-8 bg-slate-50 dark:bg-slate-900 border-2 border-[#3E6A8A] dark:border-[#9DB6BF] rounded-none shadow-inner`}>
        <div className="flex items-center justify-between mb-4">
          <label className="text-[10px] font-black uppercase text-slate-900 dark:text-white">Professional Diagnosis</label>
          {student.diagnosisPdf && (
            <button onClick={() => onViewPdf(student.diagnosisPdf!)} className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700">
              <FileText size={14} /> View Report
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-4">
            <textarea value={editForm.diagnosis || ''} onChange={e => setEditForm({...editForm, diagnosis: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-950 border-2 border-[#3E6A8A] dark:border-[#9DB6BF] rounded-none font-bold text-sm text-black dark:text-white" />
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-900 dark:text-white">Update PDF Record</label>
              <input type="file" accept="application/pdf" onChange={onUploadPdf} className="block w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>
        ) : <p className="text-lg font-black uppercase text-slate-900 dark:text-white">{student.diagnosis || 'No diagnosis recorded'}</p>}
      </div>
      <div className={`p-8 bg-slate-50 dark:bg-slate-900 border-2 border-[#3E6A8A] dark:border-[#9DB6BF] rounded-none shadow-inner`}>
        <label className="text-[10px] font-black uppercase text-slate-900 dark:text-white mb-4 block">Teacher Observations</label>
        {isEditing ? (
          <textarea value={editForm.targetBehaviors || ''} onChange={e => setEditForm({...editForm, targetBehaviors: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-950 border-2 border-[#3E6A8A] dark:border-[#9DB6BF] rounded-none font-bold text-sm text-black dark:text-white" />
        ) : <p className="text-sm font-medium leading-relaxed italic text-slate-900 dark:text-white">"{student.targetBehaviors || 'No observations added.'}"</p>}
      </div>
    </div>
  </div>
);
