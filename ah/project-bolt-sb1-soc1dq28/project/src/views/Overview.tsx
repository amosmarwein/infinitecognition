import { useState, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Target,
  BarChart3,
  LineChart as LineChartIcon,
  ClipboardList,
  Upload,
  FileText,
  Info,
  ChevronDown,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import type { StudentRecord, Intervention, ViewKey } from '@/types';
import SmartEntryConsole from '@/components/SmartEntryConsole';

interface OverviewProps {
  students: StudentRecord[];
  interventions: Intervention[];
  onNavigate: (view: ViewKey) => void;
  onOpenUpload: () => void;
  onOpenSchema: () => void;
  onOpenAddIntervention: () => void;
  onApplyNaturalEntry: (students: unknown[]) => number;
  userRole?: 'Admin' | 'Teacher' | 'Student';
}

export default function Overview({
  students,
  interventions,
  onNavigate,
  onOpenUpload,
  onOpenSchema,
  onOpenAddIntervention,
  onApplyNaturalEntry,
  userRole = 'Admin',
}: OverviewProps) {
  const [trendViewMode, setTrendViewMode] = useState<'By Department' | 'By Semester'>('By Department');
  const hasData = students.length > 0;

  // Computed metrics
  const totalStudents = students.length;
  const avgScore = hasData
    ? Math.round(students.reduce((acc, s) => acc + s.successScore, 0) / totalStudents)
    : null;
  const atRiskCount = hasData
    ? students.filter((s) => s.riskCategory === 'High Risk' || s.riskCategory === 'Medium Risk').length
    : null;
  const activeInterventionsCount = interventions.filter(
    (i) => i.status === 'Scheduled' || i.status === 'In Progress',
  ).length;

  // Donut chart data for Risk Categories
  const highRiskCount = students.filter((s) => s.riskCategory === 'High Risk').length;
  const medRiskCount = students.filter((s) => s.riskCategory === 'Medium Risk').length;
  const lowRiskCount = students.filter((s) => s.riskCategory === 'Low Risk').length;
  const onTrackCount = students.filter((s) => s.riskCategory === 'On Track').length;

  const riskPieData = [
    { name: 'High Risk', value: highRiskCount || (hasData ? 0 : 25), color: '#ef4444' },
    { name: 'Medium Risk', value: medRiskCount || (hasData ? 0 : 25), color: '#f59e0b' },
    { name: 'Low Risk', value: lowRiskCount || (hasData ? 0 : 25), color: '#3b82f6' },
    { name: 'On Track', value: onTrackCount || (hasData ? 0 : 25), color: '#10b981' },
  ];

  // Score distribution histogram buckets
  const scoreBuckets = [
    { range: '< 50', count: students.filter((s) => s.successScore < 50).length },
    { range: '50-65', count: students.filter((s) => s.successScore >= 50 && s.successScore < 65).length },
    { range: '65-80', count: students.filter((s) => s.successScore >= 65 && s.successScore < 80).length },
    { range: '80-90', count: students.filter((s) => s.successScore >= 80 && s.successScore < 90).length },
    { range: '90+', count: students.filter((s) => s.successScore >= 90).length },
  ];

  // Dynamic Cohort Performance Trends derived from active student records
  const trendData = useMemo(() => {
    if (!hasData) return [];

    if (trendViewMode === 'By Department') {
      const depts = Array.from(new Set(students.map((s) => s.department)));
      return depts.map((d) => {
        const cohort = students.filter((s) => s.department === d);
        const count = cohort.length || 1;
        const shortName = d
          .replace('Computer Science', 'CSE')
          .replace('Information Technology', 'IT')
          .replace('Electronics & Comm.', 'ECE')
          .replace('Mechanical Eng.', 'ME')
          .replace('Civil Eng.', 'Civil');
        return {
          month: shortName,
          fullName: d,
          Academic: Math.round(cohort.reduce((acc, s) => acc + s.academicScore, 0) / count),
          Attendance: Math.round(cohort.reduce((acc, s) => acc + s.attendancePercentage, 0) / count),
          Placement: Math.round(cohort.reduce((acc, s) => acc + s.placementScore, 0) / count),
        };
      });
    } else {
      const semesters = Array.from(new Set(students.map((s) => s.semester))).sort((a, b) => a - b);
      return semesters.map((sem) => {
        const cohort = students.filter((s) => s.semester === sem);
        const count = cohort.length || 1;
        return {
          month: `Sem ${sem}`,
          fullName: `Semester ${sem}`,
          Academic: Math.round(cohort.reduce((acc, s) => acc + s.academicScore, 0) / count),
          Attendance: Math.round(cohort.reduce((acc, s) => acc + s.attendancePercentage, 0) / count),
          Placement: Math.round(cohort.reduce((acc, s) => acc + s.placementScore, 0) / count),
        };
      });
    }
  }, [students, hasData, trendViewMode]);

  // Top at-risk students requiring attention
  const criticalStudents = students
    .filter((s) => s.riskCategory === 'High Risk' || s.academicRisk || s.placementRisk)
    .slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Hero Campus Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-[#171738] via-[#241e4d] to-[#161734] p-6 md:p-8 shadow-xl">
        {/* Background artwork: Sunset / dusk sky & campus architecture silhouette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-35 pointer-events-none hidden md:block">
          <svg viewBox="0 0 400 160" preserveAspectRatio="none" className="w-full h-full text-indigo-400 fill-current">
            <path d="M400,160 L400,50 L340,50 L340,30 L310,10 L280,30 L280,50 L220,50 L220,160 Z" opacity="0.6" />
            <path d="M240,160 L240,70 L190,70 L190,40 L165,20 L140,40 L140,70 L90,70 L90,160 Z" opacity="0.3" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Smart Campus Analytics
            </h2>
            <p className="mt-1 text-sm md:text-base font-semibold text-indigo-200">
              Predict, Optimize &amp; Improve Student Success
            </p>
            <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
              Unified analytics and AI-powered insights to help students succeed.
            </p>
          </div>

          <div className="shrink-0">
            <div className="rounded-2xl border border-white/10 bg-indigo-950/60 p-4 backdrop-blur-md shadow-lg max-w-xs">
              <p className="text-xs text-indigo-200 font-medium italic leading-snug">
                &ldquo;Data-driven decisions.<br />
                Brighter student futures.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {userRole !== 'Student' && (
        <SmartEntryConsole onApply={onApplyNaturalEntry} />
      )}

      {/* 2. Metrics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#111827]/70 p-5 backdrop-blur-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-600/30">
            <Users size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">Total Students</p>
            <h3 className="text-2xl font-bold text-white mt-0.5 tracking-tight">
              {hasData ? totalStudents : '—'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {hasData ? 'Active cohort records' : 'No data uploaded yet'}
            </p>
          </div>
        </div>

        {/* Card 2: Average Success Score */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#111827]/70 p-5 backdrop-blur-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/30">
            <TrendingUp size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">Average Success Score</p>
            <h3 className="text-2xl font-bold text-white mt-0.5 tracking-tight">
              {hasData ? `${avgScore}%` : '—'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {hasData ? 'Weighted 4-factor composite' : 'Upload data to view'}
            </p>
          </div>
        </div>

        {/* Card 3: At-Risk Students */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#111827]/70 p-5 backdrop-blur-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-rose-500/30">
            <AlertTriangle size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">At-Risk Students</p>
            <h3 className="text-2xl font-bold text-white mt-0.5 tracking-tight">
              {hasData ? atRiskCount : '—'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {hasData ? 'Require intervention' : 'Upload data to analyze'}
            </p>
          </div>
        </div>

        {/* Card 4: Active Interventions */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#111827]/70 p-5 backdrop-blur-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-fuchsia-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-fuchsia-600/30">
            <Target size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">Active Interventions</p>
            <h3 className="text-2xl font-bold text-white mt-0.5 tracking-tight">
              {hasData ? activeInterventionsCount : '—'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {hasData ? 'Mentoring & remedial active' : 'No interventions yet'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Row 1: Distribution, Risk Categories, Key Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Student Success Score Distribution */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#111827]/70 p-5 backdrop-blur-sm shadow-sm flex flex-col min-h-[310px]">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-sm">
            <span>Student Success Score Distribution</span>
            <span title="Distribution across normalized 0-100 score bands">
              <Info size={14} className="text-slate-500 cursor-pointer" />
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            {hasData ? (
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreBuckets}>
                    <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-slate-800/70 flex items-center justify-center text-slate-500 mb-3">
                  <BarChart3 size={24} />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">No student data available</h4>
                <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
                  Upload student data to see success score distribution, risk categories and key trends.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Card 2: Risk Categories Donut */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#111827]/70 p-5 backdrop-blur-sm shadow-sm flex flex-col min-h-[310px]">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-sm">
            <span>Risk Categories</span>
            <span title="Dual-risk categorized into 4 tiers">
              <Info size={14} className="text-slate-500 cursor-pointer" />
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-2">
            <div className="flex items-center justify-center gap-6 w-full">
              {/* Donut Chart */}
              <div className="w-36 h-36 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskPieData}
                      dataKey="value"
                      innerRadius={42}
                      outerRadius={58}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {riskPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={hasData ? entry.color : index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : index === 2 ? '#3b82f6' : '#10b981'}
                          opacity={hasData ? 1 : 0.8}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-slate-400">High Risk</span>
                  <span className="font-semibold text-slate-200 ml-auto pl-2">
                    {hasData ? `${Math.round((highRiskCount / totalStudents) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-slate-400">Medium Risk</span>
                  <span className="font-semibold text-slate-200 ml-auto pl-2">
                    {hasData ? `${Math.round((medRiskCount / totalStudents) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-slate-400">Low Risk</span>
                  <span className="font-semibold text-slate-200 ml-auto pl-2">
                    {hasData ? `${Math.round((lowRiskCount / totalStudents) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-400">On Track</span>
                  <span className="font-semibold text-slate-200 ml-auto pl-2">
                    {hasData ? `${Math.round((onTrackCount / totalStudents) * 100)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center mt-3">
              <p className="text-xs font-semibold text-slate-300">
                {hasData ? `${atRiskCount} students requiring active intervention` : 'No data available'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {hasData ? 'Calculated from combined academic and placement indicators.' : 'Risk analysis will appear here after uploading data.'}
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Key Trends */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#111827]/70 p-5 backdrop-blur-sm shadow-sm flex flex-col min-h-[310px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-sm">
              <span>Key Trends</span>
              <Info size={14} className="text-slate-500 cursor-pointer" />
            </div>
            <div className="relative">
              <button
                className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                onClick={() => setTrendViewMode(trendViewMode === 'By Department' ? 'By Semester' : 'By Department')}
                title="Toggle between Department and Semester cohort trends"
              >
                <span>{trendViewMode}</span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            {hasData ? (
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[50, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="Academic" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Attendance" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Placement" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-slate-800/70 flex items-center justify-center text-slate-500 mb-3">
                  <LineChartIcon size={24} />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">No trend data available</h4>
                <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
                  Upload student data to view academic, attendance, placement and engagement trends.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. Row 2: Attention, Segments, Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Students Requiring Attention */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#111827]/70 p-5 backdrop-blur-sm shadow-sm flex flex-col min-h-[310px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-sm">
              <span>Students Requiring Attention</span>
              <Info size={14} className="text-slate-500 cursor-pointer" />
            </div>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View All
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {hasData && criticalStudents.length > 0 ? (
              <div className="space-y-2.5 mt-2">
                {criticalStudents.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => onNavigate('students')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{st.name}</p>
                      <p className="text-[11px] text-slate-400">{st.department} • CGPA {st.cgpa}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          st.riskCategory === 'High Risk'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {st.academicRisk && st.placementRisk
                          ? 'Dual Risk'
                          : st.academicRisk
                          ? 'Academic Risk'
                          : 'Placement Risk'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/70 flex items-center justify-center text-slate-500 mb-3">
                  <Users size={24} />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">No at-risk students to display</h4>
                <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
                  Upload student data to identify students who may require academic or placement interventions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Student Segments */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#111827]/70 p-5 backdrop-blur-sm shadow-sm flex flex-col min-h-[310px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-sm">
              <span>Student Segments</span>
              <Info size={14} className="text-slate-500 cursor-pointer" />
            </div>
            <button
              onClick={() => onNavigate('segments')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View All
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {hasData ? (
              <div className="space-y-2 mt-2">
                {[
                  {
                    title: 'Scholars',
                    desc: 'High Academics & Placement Readiness',
                    count: students.filter((s) => s.segment === 'Scholars (High Academics & Placement)').length,
                    color: 'text-emerald-400 border-emerald-500/30',
                  },
                  {
                    title: 'Academic Focus',
                    desc: 'High CGPA, Low Placement Readiness',
                    count: students.filter((s) => s.segment === 'Academic Focus (High CGPA, Low Placement)').length,
                    color: 'text-indigo-400 border-indigo-500/30',
                  },
                  {
                    title: 'Tech Coders',
                    desc: 'Low CGPA, High Placement Readiness',
                    count: students.filter((s) => s.segment === 'Tech Coders (Low CGPA, High Placement)').length,
                    color: 'text-amber-400 border-amber-500/30',
                  },
                  {
                    title: 'Critical Intervention',
                    desc: 'Dual Academic & Placement Deficit',
                    count: students.filter((s) => s.segment === 'Critical Intervention (Dual Risk)').length,
                    color: 'text-rose-400 border-rose-500/30',
                  },
                ].map((seg, i) => (
                  <div
                    key={i}
                    onClick={() => onNavigate('segments')}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{seg.title}</p>
                      <p className="text-[10px] text-slate-400">{seg.desc}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${seg.color}`}>
                      {seg.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/70 flex items-center justify-center text-slate-500 mb-3">
                  <div className="w-6 h-6 border-2 border-slate-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-500 rounded-full" />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-slate-200">No segment data available</h4>
                <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
                  Student segmentation will appear here after uploading data to identify groups for targeted interventions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Recent Interventions */}
        <div className="rounded-2xl border border-[#1e293b] bg-[#111827]/70 p-5 backdrop-blur-sm shadow-sm flex flex-col min-h-[310px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-sm">
              <span>Recent Interventions</span>
              <Info size={14} className="text-slate-500 cursor-pointer" />
            </div>
            {userRole !== 'Student' && (
              <button
                onClick={onOpenAddIntervention}
                className="flex items-center gap-1 text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Plus size={13} />
                <span>Add Intervention</span>
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {interventions.length > 0 ? (
              <div className="space-y-2 mt-2">
                {interventions.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate('interventions')}
                    className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white">{item.studentName}</p>
                      <span className="text-[10px] text-slate-400">{item.date}</span>
                    </div>
                    <p className="text-[11px] text-indigo-300 font-medium mt-0.5">{item.type}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.notes}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/70 flex items-center justify-center text-slate-500 mb-3">
                  <ClipboardList size={24} />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">No interventions recorded</h4>
                <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
                  Track meetings, mentoring sessions, and support actions to help students succeed.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Bottom Banner "Get Started" */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-[#11172a] via-[#1a1f3d] to-[#11172a] p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Get Started</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your institution&apos;s student data to unlock powerful analytics and AI-driven insights.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
            >
              <Upload size={14} />
              <span>Upload Data</span>
            </button>
            <button
              onClick={onOpenSchema}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors"
            >
              <FileText size={14} />
              <span>View Data Schema</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
