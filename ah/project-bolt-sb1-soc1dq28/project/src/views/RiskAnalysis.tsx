import { useState } from 'react';
import {
  BookOpen,
  Briefcase,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import type { StudentRecord, Intervention, ViewKey } from '@/types';

interface RiskAnalysisProps {
  students: StudentRecord[];
  interventions?: Intervention[];
  onNavigate?: (view: ViewKey) => void;
  onOpenAddIntervention: (studentId?: string, type?: Intervention['type']) => void;
}

export default function RiskAnalysis({
  students,
  interventions = [],
  onNavigate,
  onOpenAddIntervention,
}: RiskAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'dual' | 'academic' | 'placement' | 'all'>('dual');

  const academicRiskStudents = students.filter((s) => s.academicRisk);
  const placementRiskStudents = students.filter((s) => s.placementRisk);
  const dualRiskStudents = students.filter((s) => s.academicRisk && s.placementRisk);
  const allFlaggedStudents = students.filter((s) => s.academicRisk || s.placementRisk);

  // Determine which list to show based on active tab
  const displayedStudents =
    activeTab === 'dual'
      ? dualRiskStudents
      : activeTab === 'academic'
        ? academicRiskStudents
        : activeTab === 'placement'
          ? placementRiskStudents
          : allFlaggedStudents;

  // Calculate intervention coverage across at-risk students
  const coveredStudentsCount = allFlaggedStudents.filter((st) =>
    interventions.some(
      (inv) =>
        (inv.studentId === st.id || inv.studentName.toLowerCase() === st.name.toLowerCase()) &&
        inv.status !== 'Completed',
    ),
  ).length;

  const coveragePercent =
    allFlaggedStudents.length > 0
      ? Math.round((coveredStudentsCount / allFlaggedStudents.length) * 100)
      : 100;

  function getRecommendedInterventionType(st: StudentRecord): Intervention['type'] {
    if (st.academicRisk && st.placementRisk) return 'Academic Remedial';
    if (st.academicRisk) {
      return st.attendancePercentage < 75 ? 'Attendance Counseling' : 'Academic Remedial';
    }
    if (st.placementRisk) {
      return st.codingScore < 50 ? 'Coding Bootcamp' : 'Mock Interview Prep';
    }
    return 'Faculty Mentorship';
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">At-Risk Student Identification</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Proactive dual-risk detection isolating Academic Performance Deficits vs Placement Readiness Gaps.
          </p>
        </div>

        <button
          onClick={() => onOpenAddIntervention()}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
        >
          <Plus size={14} />
          <span>New Intervention</span>
        </button>
      </div>

      {/* Intervention Coverage Metric Banner */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827]/80 p-4 backdrop-blur-sm shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Active Intervention Coverage
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {coveragePercent}% Covered
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              <strong className="text-white">{coveredStudentsCount}</strong> of{' '}
              <strong className="text-white">{allFlaggedStudents.length}</strong> flagged students currently have active remedial sessions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="w-36 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60 hidden sm:block">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('interventions')}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              <span>Manage All ({interventions.length})</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 3 Overview Risk Cards - Clickable to switch cohorts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Academic Risk Card */}
        <div
          onClick={() => setActiveTab('academic')}
          className={`cursor-pointer rounded-2xl border p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between min-h-[160px] transition-all duration-200 ${
            activeTab === 'academic'
              ? 'border-rose-400 ring-2 ring-rose-500/30 bg-gradient-to-br from-[#271420]/95 to-[#160d1b]/95'
              : 'border-rose-500/25 bg-gradient-to-br from-[#1c121e]/90 to-[#120d18]/90 hover:border-rose-500/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Academic Risk
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <BookOpen size={20} />
              </div>
            </div>

            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight leading-none">
                {academicRiskStudents.length}
              </span>
              <span className="text-xs font-medium text-slate-400">students flagged</span>
            </div>
          </div>

          <div className="pt-3 border-t border-rose-500/15 flex items-center justify-between text-[11px] text-slate-400">
            <span>Attendance &lt; 75%, backlogs, or CGPA &lt; 6.5</span>
            <span className="text-rose-400 font-medium">Filter &rarr;</span>
          </div>
        </div>

        {/* Placement Risk Card */}
        <div
          onClick={() => setActiveTab('placement')}
          className={`cursor-pointer rounded-2xl border p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between min-h-[160px] transition-all duration-200 ${
            activeTab === 'placement'
              ? 'border-amber-400 ring-2 ring-amber-500/30 bg-gradient-to-br from-[#272115]/95 to-[#18130d]/95'
              : 'border-amber-500/25 bg-gradient-to-br from-[#1c1912]/90 to-[#15120d]/90 hover:border-amber-500/40'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Placement Risk
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Briefcase size={20} />
              </div>
            </div>

            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight leading-none">
                {placementRiskStudents.length}
              </span>
              <span className="text-xs font-medium text-slate-400">students flagged</span>
            </div>
          </div>

          <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between text-[11px] text-slate-400">
            <span>Placement Score &lt; 60% or Coding &lt; 50%</span>
            <span className="text-amber-400 font-medium">Filter &rarr;</span>
          </div>
        </div>

        {/* Dual Critical Risk Card */}
        <div
          onClick={() => setActiveTab('dual')}
          className={`cursor-pointer rounded-2xl border p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between min-h-[160px] sm:col-span-2 lg:col-span-1 transition-all duration-200 ${
            activeTab === 'dual'
              ? 'border-red-400 ring-2 ring-red-500/40 bg-gradient-to-br from-[#30151a]/95 to-[#1c0c0f]/95'
              : 'border-red-500/35 bg-gradient-to-br from-[#241215]/90 to-[#180a0d]/90 hover:border-red-500/50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
                Dual Critical Risk
              </span>
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/35 text-red-400 flex items-center justify-center shrink-0">
                <ShieldAlert size={20} />
              </div>
            </div>

            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight leading-none">
                {dualRiskStudents.length}
              </span>
              <span className="text-xs font-medium text-red-300/80">urgent intervention</span>
            </div>
          </div>

          <div className="pt-3 border-t border-red-500/15 flex items-center justify-between text-[11px] text-slate-400">
            <span>Failing both academic &amp; placement benchmarks</span>
            <span className="text-red-400 font-medium">Filter &rarr;</span>
          </div>
        </div>
      </div>

      {/* Cohort Explorer Section with Filter Tabs */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827]/80 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Cohort Risk Action Center</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {displayedStudents.length} students
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review individual risk drivers and active remedial action statuses.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dual')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'dual'
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dual Risk ({dualRiskStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('academic')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'academic'
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Academic ({academicRiskStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('placement')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'placement'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Placement ({placementRiskStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Flagged ({allFlaggedStudents.length})
            </button>
          </div>
        </div>

        {displayedStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No students found matching this risk filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-800 text-xs">
            {displayedStudents.map((st) => {
              const studentInterventions = interventions.filter(
                (i) =>
                  i.studentId === st.id ||
                  (i.studentName && i.studentName.trim().toLowerCase() === st.name.trim().toLowerCase()),
              );
              const activeIntervention = studentInterventions.find((i) => i.status !== 'Completed');
              const completedInterventions = studentInterventions.filter((i) => i.status === 'Completed');
              const recommendedType = getRecommendedInterventionType(st);

              return (
                <div
                  key={st.id}
                  className="py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-800/20 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">{st.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({st.rollNumber})</span>
                      <span className="text-[10px] text-slate-400">{st.department} • Sem {st.semester}</span>

                      {/* Risk Badges */}
                      {st.academicRisk && st.placementRisk ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Dual Risk
                        </span>
                      ) : st.academicRisk ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Academic Deficit
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Placement Gap
                        </span>
                      )}

                      {/* Success Score Pill */}
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        Score: {st.successScore}%
                      </span>
                    </div>

                    {/* Risk Indicators / Root Causes */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      <span className={st.cgpa < 6.5 ? 'text-rose-400 font-medium' : ''}>
                        CGPA: {st.cgpa} {st.cgpa < 6.5 && '(Deficit)'}
                      </span>
                      <span>•</span>
                      <span className={st.backlogs > 0 ? 'text-rose-400 font-medium' : ''}>
                        Backlogs: {st.backlogs} {st.backlogs > 0 && `(${st.backlogs} active)`}
                      </span>
                      <span>•</span>
                      <span className={st.attendancePercentage < 75 ? 'text-amber-400 font-medium' : ''}>
                        Attendance: {st.attendancePercentage}% {st.attendancePercentage < 75 && '(Low)'}
                      </span>
                      <span>•</span>
                      <span className={st.codingScore < 50 ? 'text-amber-400 font-medium' : ''}>
                        Coding: {st.codingScore}% {st.codingScore < 50 && '(Unprepared)'}
                      </span>
                      <span>•</span>
                      <span>LMS: {st.lmsCompletionRate}%</span>
                    </div>
                  </div>

                  {/* Intervention Status & Action Controls */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
                    {activeIntervention ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                          {activeIntervention.status === 'In Progress' ? (
                            <Clock size={12} className="text-emerald-400 animate-pulse" />
                          ) : (
                            <CheckCircle2 size={12} className="text-emerald-400" />
                          )}
                          <span className="font-semibold">{activeIntervention.type}</span>
                          <span className="text-[10px] text-emerald-400/80">({activeIntervention.status})</span>
                        </div>

                        {/* View in Interventions Button */}
                        {onNavigate && (
                          <button
                            onClick={() => onNavigate('interventions')}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors"
                            title="View intervention details"
                          >
                            Track &rarr;
                          </button>
                        )}

                        {/* Additional Action Button */}
                        <button
                          onClick={() => onOpenAddIntervention(st.id, recommendedType)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                          title="Schedule an additional support session"
                        >
                          + Add Action
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {completedInterventions.length > 0 && (
                          <span className="text-[11px] text-slate-400 italic">
                            ({completedInterventions.length} past completed)
                          </span>
                        )}
                        <button
                          onClick={() => onOpenAddIntervention(st.id, recommendedType)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all hover:shadow-indigo-500/20"
                        >
                          <Plus size={13} />
                          <span>Assign Remedial Action</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
