import { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  ShieldCheck,
  AlertTriangle,
  Award,
  Filter,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import type { StudentRecord } from '@/types';

interface ReportsProps {
  students: StudentRecord[];
}

export default function Reports({ students }: ReportsProps) {
  const [filterType, setFilterType] = useState<'All' | 'Eligible' | 'AtRisk' | 'Honors'>('All');
  const [selectedDept, setSelectedDept] = useState('All');

  const departments = ['All', ...Array.from(new Set(students.map((s) => s.department)))];

  // Derived audit metrics
  const total = students.length;
  const placementEligible = students.filter(
    (s) => s.placementScore >= 60 && s.backlogs === 0 && s.attendancePercentage >= 75,
  );
  const honorsStudents = students.filter((s) => s.cgpa >= 8.5 && s.backlogs === 0);
  const criticalIntervention = students.filter((s) => s.academicRisk && s.placementRisk);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchDept = selectedDept === 'All' || s.department === selectedDept;
      if (!matchDept) return false;

      if (filterType === 'Eligible') {
        return s.placementScore >= 60 && s.backlogs === 0 && s.attendancePercentage >= 75;
      }
      if (filterType === 'AtRisk') {
        return s.academicRisk || s.placementRisk;
      }
      if (filterType === 'Honors') {
        return s.cgpa >= 8.5 && s.backlogs === 0;
      }
      return true;
    });
  }, [students, filterType, selectedDept]);

  // Export CSV
  const handleExportCSV = () => {
    if (students.length === 0) return;

    const headers = [
      'Student ID',
      'Roll Number',
      'Full Name',
      'Department',
      'Semester',
      'CGPA',
      'Backlogs',
      'Attendance %',
      'LMS Logins/Wk',
      'Academic Score',
      'Placement Score',
      'Success Score',
      'Risk Category',
      'Placement Eligible',
      'Segment',
    ];

    const rows = filtered.map((s) => [
      s.id,
      s.rollNumber || s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.department}"`,
      s.semester,
      s.cgpa,
      s.backlogs,
      s.attendancePercentage,
      s.lmsLoginFrequency,
      s.academicScore,
      s.placementScore,
      s.successScore,
      `"${s.riskCategory}"`,
      s.placementScore >= 60 && s.backlogs === 0 && s.attendancePercentage >= 75 ? 'YES' : 'NO',
      `"${s.segment}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Campus_Institutional_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    if (students.length === 0) return;
    const jsonContent = JSON.stringify(
      {
        institution: 'Cognitive Smart Campus Analytics',
        auditDate: new Date().toISOString(),
        totalStudents: filtered.length,
        auditSummary: {
          placementEligible: placementEligible.length,
          honorsCohort: honorsStudents.length,
          criticalDualRisk: criticalIntervention.length,
        },
        records: filtered,
      },
      null,
      2,
    );
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Institutional_Dossier_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText size={22} className="text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Institutional Audit &amp; Outcome Reports</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Accreditation-ready placement eligibility audits, academic backlog verification, and exportable data dossiers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={students.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            <FileSpreadsheet size={14} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={students.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition"
          >
            <FileCode size={14} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/70 p-4.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audited Cohort</span>
            <FileText size={16} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{total}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Active institutional student records</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Placement Eligible</span>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{placementEligible.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {total ? `${Math.round((placementEligible.length / total) * 100)}%` : '0%'} clear of backlogs &amp; attendance benchmark
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/10 p-4.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Academic Honors</span>
            <Award size={16} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{honorsStudents.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">CGPA &ge; 8.5 with pristine course completion</p>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-4.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Dual-Risk Flagged</span>
            <AlertTriangle size={16} className="text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{criticalIntervention.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Failing both attendance and placement criteria</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-slate-800 bg-[#111827]/60">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: 'All', label: 'All Records' },
              { key: 'Eligible', label: 'Placement Eligible' },
              { key: 'AtRisk', label: 'At-Risk Candidates' },
              { key: 'Honors', label: 'Honors Track' },
            ] as const
          ).map((tab) => {
            const isActive = filterType === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterType(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={13} className="text-slate-500" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-8 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827]/80 overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No student records match the selected audit criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1628] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Academics</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Placement Rating</th>
                  <th className="py-3 px-4">Overall Score</th>
                  <th className="py-3 px-4">Placement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map((s) => {
                  const isEligible = s.placementScore >= 60 && s.backlogs === 0 && s.attendancePercentage >= 75;
                  const isCritical = s.academicRisk && s.placementRisk;

                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{s.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{s.rollNumber || s.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>{s.department}</div>
                        <div className="text-[11px] text-slate-500">Semester {s.semester}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">CGPA: {s.cgpa.toFixed(1)}</div>
                        <div className="text-[11px]">
                          {s.backlogs > 0 ? (
                            <span className="text-rose-400 font-semibold">{s.backlogs} Backlog(s)</span>
                          ) : (
                            <span className="text-emerald-400">0 Backlogs</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            s.attendancePercentage < 75 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {s.attendancePercentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{s.placementScore}/100</div>
                        <div className="text-[11px] text-slate-500">Coding: {s.codingScore}%</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-black text-indigo-300 text-sm">{s.successScore}</span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle size={12} />
                            <span>Eligible</span>
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            <XCircle size={12} />
                            <span>Dual Risk Ineligible</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <AlertTriangle size={12} />
                            <span>Review Needed</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

