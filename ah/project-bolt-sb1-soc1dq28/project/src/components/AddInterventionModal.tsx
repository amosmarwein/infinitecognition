import { useState, useEffect } from 'react';
import { X, Target, Calendar } from 'lucide-react';
import type { StudentRecord, Intervention } from '@/types';

interface AddInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
  onAdd: (intervention: Intervention) => void;
  defaultStudentId?: string;
  defaultType?: Intervention['type'];
}

export default function AddInterventionModal({
  isOpen,
  onClose,
  students,
  onAdd,
  defaultStudentId,
  defaultType,
}: AddInterventionModalProps) {
  const [studentId, setStudentId] = useState(defaultStudentId || students[0]?.id || '');
  const [type, setType] = useState<Intervention['type']>(defaultType || 'Academic Remedial');
  const [assignedTo, setAssignedTo] = useState('Faculty Advisor');
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<Intervention['status']>('Scheduled');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (defaultStudentId) {
        setStudentId(defaultStudentId);
      } else if (students.length > 0 && (!studentId || !students.some((s) => s.id === studentId))) {
        setStudentId(students[0].id);
      }
      if (defaultType) {
        setType(defaultType);
      }
      setScheduledDate(new Date().toISOString().slice(0, 10));
      setStatus('Scheduled');
      setNotes('');
    }
  }, [isOpen, defaultStudentId, defaultType, students]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const targetStudent = students.find((s) => s.id === studentId) || {
      id: studentId || 'custom',
      name: 'Selected Student',
      department: 'Engineering',
    };

    const formattedDate = scheduledDate
      ? new Date(scheduledDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newIntervention: Intervention = {
      id: `int-${Date.now()}`,
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      department: targetStudent.department,
      type,
      assignedTo: assignedTo.trim() || 'Faculty Advisor',
      date: formattedDate,
      status,
      notes: notes.trim() || 'Scheduled support intervention session.',
    };

    onAdd(newIntervention);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-indigo-500/20 bg-[#0f172a] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Target size={16} />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Add Student Intervention</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Student</label>
            {students.length > 0 ? (
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.rollNumber} - {st.department}) - {st.riskCategory}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Student Name or Roll Number"
                required
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Intervention Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Intervention['type'])}
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Academic Remedial">Academic Remedial Coaching</option>
              <option value="Coding Bootcamp">Placement Coding Bootcamp</option>
              <option value="Attendance Counseling">Attendance Counseling Session</option>
              <option value="Faculty Mentorship">1-on-1 Faculty Mentorship</option>
              <option value="Mock Interview Prep">Mock Technical Interview Prep</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Counselor / Mentor</label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="e.g. Prof. Sharma / Placement Cell"
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Scheduled Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Intervention['status'])}
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Intervention Plan &amp; Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe remedial plan, goals, and follow-up checkpoints..."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
            >
              Schedule Intervention
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

