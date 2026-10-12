import { useState } from 'react';
import {
  Calendar,
  User,
  Plus,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  X,
  Save,
  ChevronDown,
  Filter,
} from 'lucide-react';
import type { Intervention } from '@/types';
import type { CampusRole } from '@/lib/auth';

interface InterventionsProps {
  interventions: Intervention[];
  onOpenAdd: () => void;
  onUpdateIntervention?: (id: string, updates: Partial<Intervention>) => void;
  onDeleteIntervention?: (id: string) => void;
  userRole?: CampusRole;
}

export default function Interventions({
  interventions,
  onOpenAdd,
  onUpdateIntervention = () => {},
  onDeleteIntervention = () => {},
  userRole = 'Admin',
}: InterventionsProps) {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Scheduled' | 'In Progress' | 'Completed'>('All');
  const [editingItem, setEditingItem] = useState<Intervention | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<Intervention['status']>('Scheduled');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editDate, setEditDate] = useState('');

  const isStudent = userRole === 'Student';

  const scheduledCount = interventions.filter((i) => i.status === 'Scheduled').length;
  const inProgressCount = interventions.filter((i) => i.status === 'In Progress').length;
  const completedCount = interventions.filter((i) => i.status === 'Completed').length;

  const filteredInterventions = interventions.filter((item) => {
    if (filterStatus === 'All') return true;
    return item.status === filterStatus;
  });

  const handleOpenEdit = (item: Intervention) => {
    setEditingItem(item);
    setEditNotes(item.notes || '');
    setEditStatus(item.status);
    setEditAssignedTo(item.assignedTo);
    setEditDate(item.date);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    onUpdateIntervention(editingItem.id, {
      notes: editNotes.trim(),
      status: editStatus,
      assignedTo: editAssignedTo.trim() || editingItem.assignedTo,
      date: editDate || editingItem.date,
    });

    setEditingItem(null);
  };

  const handleQuickStatusChange = (item: Intervention, nextStatus: Intervention['status']) => {
    onUpdateIntervention(item.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Student Interventions</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log and track remedial coaching, attendance counseling, and placement sprints with verified outcomes.
          </p>
        </div>

        {!isStudent && (
          <button
            onClick={onOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>Add Intervention</span>
          </button>
        )}
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl border border-slate-800 bg-[#111827]/60">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(
            [
              { key: 'All', label: 'All Interventions', count: interventions.length },
              { key: 'Scheduled', label: 'Scheduled', count: scheduledCount },
              { key: 'In Progress', label: 'In Progress', count: inProgressCount },
              { key: 'Completed', label: 'Completed', count: completedCount },
            ] as const
          ).map((tab) => {
            const isActive = filterStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-3 text-xs text-slate-400">
          <Filter size={13} className="text-slate-500" />
          <span>Showing {filteredInterventions.length} of {interventions.length}</span>
        </div>
      </div>

      {/* Interventions List */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827]/80 overflow-hidden shadow-xl">
        {filteredInterventions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            {interventions.length === 0
              ? 'No active interventions recorded yet. Click "Add Intervention" to schedule one.'
              : `No interventions currently matching "${filterStatus}".`}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredInterventions.map((item) => {
              const statusColors = {
                Scheduled: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                'In Progress': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                Completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
              };

              return (
                <div key={item.id} className="p-5 hover:bg-slate-800/40 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Student & Department Info */}
                    <div className="flex items-start md:items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-indigo-400 shrink-0 font-bold text-xs">
                        {item.studentName.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-sm">{item.studentName}</span>
                          <span className="text-xs text-slate-400">({item.department})</span>
                          <span className="text-[11px] font-mono text-slate-500">{item.studentId}</span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-slate-500" />
                            <span>{item.date}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={12} className="text-slate-500" />
                            <span>Assigned: <strong className="text-slate-300 font-medium">{item.assignedTo}</strong></span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill & Actions */}
                    <div className="flex items-center gap-2 self-start md:self-auto">
                      {!isStudent ? (
                        <div className="relative group">
                          <select
                            value={item.status}
                            onChange={(e) =>
                              handleQuickStatusChange(item, e.target.value as Intervention['status'])
                            }
                            className={`cursor-pointer appearance-none rounded-xl border px-3 py-1.5 pr-8 text-xs font-semibold focus:outline-none transition ${
                              statusColors[item.status]
                            }`}
                          >
                            <option value="Scheduled" className="bg-[#0e1628] text-white">Scheduled</option>
                            <option value="In Progress" className="bg-[#0e1628] text-white">In Progress</option>
                            <option value="Completed" className="bg-[#0e1628] text-white">Completed</option>
                          </select>
                          <ChevronDown
                            size={13}
                            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70"
                          />
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${
                            statusColors[item.status]
                          }`}
                        >
                          {item.status === 'Completed' ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <Clock size={13} />
                          )}
                          <span>{item.status}</span>
                        </span>
                      )}

                      {!isStudent && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit notes & outcome"
                            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete intervention record for ${item.studentName}?`)) {
                                onDeleteIntervention(item.id);
                              }
                            }}
                            title="Delete intervention"
                            className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-950/20 text-rose-400 hover:bg-rose-900/40 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Intervention Details & Outcome */}
                  <div className="mt-3.5 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 text-xs leading-relaxed">
                    <span className="font-bold text-indigo-300 uppercase tracking-wide text-[10px] block mb-1">
                      {item.type} Plan &amp; Outcome Notes
                    </span>
                    <p className="text-slate-300">
                      {item.notes || 'No notes logged yet. Click edit to record mentorship summary and follow-up tasks.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Outcome & Notes Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-[#0e1628] shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between border-b border-slate-800 bg-[#121c33] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Edit3 size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Update Intervention Outcome</h3>
                  <p className="text-[11px] text-slate-400">{editingItem.studentName} ({editingItem.type})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Intervention['status'])}
                    className="w-full h-9 px-3 rounded-xl bg-[#131b2e] border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Session Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[#131b2e] border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Mentor / Faculty</label>
                <input
                  type="text"
                  value={editAssignedTo}
                  onChange={(e) => setEditAssignedTo(e.target.value)}
                  placeholder="Prof. Sharma"
                  className="w-full h-9 px-3 rounded-xl bg-[#131b2e] border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mentorship Progress &amp; Outcome Notes
                </label>
                <textarea
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record intervention takeaways, student commitment, remedial test score, or next steps..."
                  className="w-full p-3 rounded-xl bg-[#131b2e] border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Save size={13} />
                  <span>Save Outcome</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
