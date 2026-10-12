import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, RefreshCw, Upload } from 'lucide-react';
import { uploadStudentDataFile } from '@/lib/api';
import type { StudentRecord } from '@/types';

interface LMSStudent {
  student_id: string;
  name: string;
  cgpa: number;
  backlogs: number;
  attendance: number;
  lms_logins: number;
  assignments_late: number;
  placement_mock_score: number;
  technical_skill_score: number;
  student_satisfaction: number;
  academic_risk_flag: boolean;
  placement_risk_flag: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLMSStudent(value: unknown): value is LMSStudent {
  if (!isRecord(value)) return false;
  return (
    typeof value.student_id === 'string' &&
    value.student_id.trim() !== '' &&
    typeof value.name === 'string' &&
    value.name.trim() !== '' &&
    typeof value.cgpa === 'number' &&
    Number.isFinite(value.cgpa) &&
    typeof value.backlogs === 'number' &&
    Number.isFinite(value.backlogs) &&
    typeof value.attendance === 'number' &&
    Number.isFinite(value.attendance) &&
    typeof value.lms_logins === 'number' &&
    Number.isFinite(value.lms_logins) &&
    typeof value.assignments_late === 'number' &&
    Number.isFinite(value.assignments_late) &&
    typeof value.placement_mock_score === 'number' &&
    Number.isFinite(value.placement_mock_score) &&
    typeof value.technical_skill_score === 'number' &&
    Number.isFinite(value.technical_skill_score) &&
    typeof value.student_satisfaction === 'number' &&
    Number.isFinite(value.student_satisfaction) &&
    typeof value.academic_risk_flag === 'boolean' &&
    typeof value.placement_risk_flag === 'boolean'
  );
}

function readUploadedStudents(payload: unknown): LMSStudent[] {
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new Error('The upload response must contain a data student array.');
  }
  if (payload.status !== 'success') {
    throw new Error('The upload response did not report a successful import.');
  }

  const students: LMSStudent[] = [];
  for (const [index, student] of payload.data.entries()) {
    const normalizedStudent: unknown = isRecord(student)
      ? {
          ...student,
          academic_risk_flag:
            student.academic_risk_flag === 1
              ? true
              : student.academic_risk_flag === 0
                ? false
                : student.academic_risk_flag,
          placement_risk_flag:
            student.placement_risk_flag === 1
              ? true
              : student.placement_risk_flag === 0
                ? false
                : student.placement_risk_flag,
        }
      : student;

    if (!isLMSStudent(normalizedStudent)) {
      throw new Error(`Uploaded student record ${index + 1} does not match the required data model.`);
    }
    students.push(normalizedStudent);
  }
  return students;
}

function readLlmInsight(payload: unknown): string {
  return isRecord(payload) && typeof payload.llm_insight === 'string'
    ? payload.llm_insight
    : '';
}

function generateMockStudents(): LMSStudent[] {
  const firstNames = [
    'Aarav', 'Diya', 'Rohan', 'Ananya', 'Vikram',
    'Sneha', 'Kabir', 'Pooja', 'Arjun', 'Ishaan',
  ];
  const lastNames = [
    'Sharma', 'Patel', 'Verma', 'Iyer', 'Sengupta',
    'Reddy', 'Mehta', 'Kulkarni', 'Nair', 'Joshi',
  ];
  const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  return Array.from({ length: 100 }, (_, index) => {
    const cgpa = +(5 + Math.random() * 5).toFixed(1);
    const backlogs = randomInt(0, 3);
    const attendance = randomInt(55, 100);
    const lms_logins = randomInt(20, 100);
    const assignments_late = randomInt(0, 6);
    const placement_mock_score = randomInt(35, 100);
    const technical_skill_score = randomInt(35, 100);
    const student_satisfaction = +(1 + Math.random() * 4).toFixed(1);

    const placementScore = Math.round(
      (technical_skill_score * 0.45 + placement_mock_score * 0.2) / 0.65,
    );
    const academic_risk_flag = attendance < 75 || backlogs > 0 || cgpa < 6.5;
    const placement_risk_flag = placementScore < 60 || technical_skill_score < 50;
    return {
      student_id: `STU-${String(index + 1).padStart(3, '0')}`,
      name: `${firstNames[Math.floor(index / lastNames.length)]} ${lastNames[index % lastNames.length]}`,
      cgpa,
      backlogs,
      attendance,
      lms_logins,
      assignments_late,
      placement_mock_score,
      technical_skill_score,
      student_satisfaction,
      academic_risk_flag,
      placement_risk_flag,
    };
  });
}

function EngagementChart({ students }: { students: LMSStudent[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!host || !canvas || !context) return;

    const draw = () => {
      const width = host.clientWidth;
      const height = 320;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const margin = { top: 16, right: 16, bottom: 42, left: 42 };
      const plotWidth = width - margin.left - margin.right;
      const plotHeight = height - margin.top - margin.bottom;
      const maxLogins = Math.max(50, Math.ceil(Math.max(...students.map((s) => s.lms_logins), 0) / 10) * 10);
      const maxLate = Math.max(5, Math.ceil(Math.max(...students.map((s) => s.assignments_late), 0)));
      const x = (value: number) => margin.left + (value / maxLogins) * plotWidth;
      const y = (value: number) => margin.top + plotHeight - (value / maxLate) * plotHeight;

      context.font = '11px sans-serif';
      context.textAlign = 'right';
      context.textBaseline = 'middle';
      for (let tick = 0; tick <= 4; tick += 1) {
        const value = (maxLate * tick) / 4;
        const tickY = y(value);
        context.strokeStyle = '#263244';
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(margin.left, tickY);
        context.lineTo(width - margin.right, tickY);
        context.stroke();
        context.fillStyle = '#94a3b8';
        context.fillText(value.toFixed(value % 1 === 0 ? 0 : 1), margin.left - 8, tickY);
      }

      context.textAlign = 'center';
      context.textBaseline = 'top';
      for (let tick = 0; tick <= 4; tick += 1) {
        const value = (maxLogins * tick) / 4;
        const tickX = x(value);
        context.strokeStyle = '#263244';
        context.beginPath();
        context.moveTo(tickX, margin.top);
        context.lineTo(tickX, margin.top + plotHeight);
        context.stroke();
        context.fillStyle = '#94a3b8';
        context.fillText(value.toFixed(0), tickX, margin.top + plotHeight + 9);
      }

      context.save();
      context.setLineDash([5, 5]);
      context.strokeStyle = '#f59e0b';
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(x(50), margin.top);
      context.lineTo(x(50), margin.top + plotHeight);
      context.stroke();
      context.beginPath();
      context.moveTo(margin.left, y(3));
      context.lineTo(width - margin.right, y(3));
      context.stroke();
      context.restore();

      for (const student of students) {
        const isAtRisk = student.lms_logins < 50 || student.assignments_late > 3;
        context.beginPath();
        context.arc(x(student.lms_logins), y(student.assignments_late), isAtRisk ? 5 : 4, 0, Math.PI * 2);
        context.fillStyle = isAtRisk ? '#fb7185' : '#22d3ee';
        context.fill();
        context.strokeStyle = '#0f172a';
        context.lineWidth = 2;
        context.stroke();
      }

      context.fillStyle = '#94a3b8';
      context.textAlign = 'center';
      context.textBaseline = 'bottom';
      context.fillText('LMS logins', margin.left + plotWidth / 2, height - 2);
      context.save();
      context.translate(12, margin.top + plotHeight / 2);
      context.rotate(-Math.PI / 2);
      context.fillText('Late assignments', 0, 0);
      context.restore();
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(host);
    return () => observer.disconnect();
  }, [students]);

  if (students.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-slate-500">
        No student records to chart yet.
      </div>
    );
  }

  return (
    <div ref={hostRef} className="w-full">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Scatter chart for ${students.length} students comparing LMS logins with late assignments. Pink points are disengagement watchlist students.`}
        className="block h-80 w-full"
      />
    </div>
  );
}

interface LMSEngagementProps {
  students?: StudentRecord[];
  onLlmInsight: (insight: string) => void;
  onDataLoaded?: (students: StudentRecord[]) => void;
}

export default function LMSEngagement({
  students: propStudents,
  onLlmInsight,
  onDataLoaded,
}: LMSEngagementProps) {
  const [localStudents, setLocalStudents] = useState<LMSStudent[]>(() => {
    if (propStudents && propStudents.length > 0) {
      return propStudents.map((s) => ({
        student_id: s.id || s.rollNumber,
        name: s.name,
        cgpa: s.cgpa,
        backlogs: s.backlogs,
        attendance: s.attendancePercentage,
        lms_logins: s.lmsLoginFrequency,
        assignments_late: s.assignmentsLate ?? 0,
        placement_mock_score: s.mockInterviewScore,
        technical_skill_score: s.codingScore,
        student_satisfaction: s.studentSatisfaction ?? 4,
        academic_risk_flag: s.academicRisk,
        placement_risk_flag: s.placementRisk,
      }));
    }
    return generateMockStudents();
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Active student records: synchronized with application-wide cohort
  const students: LMSStudent[] = useMemo(() => {
    if (propStudents && propStudents.length > 0) {
      return propStudents.map((s) => ({
        student_id: s.id || s.rollNumber,
        name: s.name,
        cgpa: s.cgpa,
        backlogs: s.backlogs,
        attendance: s.attendancePercentage,
        lms_logins: s.lmsLoginFrequency,
        assignments_late: s.assignmentsLate ?? 0,
        placement_mock_score: s.mockInterviewScore,
        technical_skill_score: s.codingScore,
        student_satisfaction: s.studentSatisfaction ?? 4,
        academic_risk_flag: s.academicRisk,
        placement_risk_flag: s.placementRisk,
      }));
    }
    return localStudents;
  }, [propStudents, localStudents]);

  async function uploadFile() {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const { students: uploadedStudents, llmInsight } = await uploadStudentDataFile(selectedFile);
      const mappedLmsStudents: LMSStudent[] = uploadedStudents.map((s) => ({
        student_id: s.id || s.rollNumber,
        name: s.name,
        cgpa: s.cgpa,
        backlogs: s.backlogs,
        attendance: s.attendancePercentage,
        lms_logins: s.lmsLoginFrequency,
        assignments_late: s.assignmentsLate ?? 0,
        placement_mock_score: s.mockInterviewScore,
        technical_skill_score: s.codingScore,
        student_satisfaction: s.studentSatisfaction ?? 4,
        academic_risk_flag: s.academicRisk,
        placement_risk_flag: s.placementRisk,
      }));
      setLocalStudents(mappedLmsStudents);
      onDataLoaded?.(uploadedStudents);
      onLlmInsight(llmInsight);
      setSelectedFile(null);
      setUploadMessage(`Loaded and synchronized ${mappedLmsStudents.length} student records across the platform.`);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not upload student data.');
    } finally {
      setUploading(false);
    }
  }

  const watchlist = useMemo(
    () => students.filter((student) => student.lms_logins < 50 || student.assignments_late > 3),
    [students],
  );
  const averageLogins = students.length
    ? students.reduce((total, student) => total + student.lms_logins, 0) / students.length
    : 0;
  const totalLateAssignments = students.reduce((total, student) => total + student.assignments_late, 0);
  const engagementOnTrack = students.length > 0 && averageLogins >= 50;

  return (
    <section className="space-y-6 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">LMS Core Scope</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">LMS Engagement Analytics</h2>
          <p className="mt-1 text-sm text-slate-400">
            Login activity and late submissions across the active student cohort.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-300 ${uploading ? 'cursor-wait opacity-50' : ''}`}>
            <Upload size={14} aria-hidden="true" />
            {selectedFile ? selectedFile.name : 'Choose CSV'}
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              disabled={uploading}
              onChange={(event) => {
                setSelectedFile(event.currentTarget.files?.[0] ?? null);
                setUploadError(null);
                setUploadMessage(null);
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => void uploadFile()}
            disabled={!selectedFile || uploading}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:border-cyan-500/50 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={14} aria-hidden="true" />
            {uploading ? 'Uploading…' : 'Upload CSV'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (propStudents && propStudents.length > 0) {
                setLocalStudents(
                  propStudents.map((s) => ({
                    student_id: s.id || s.rollNumber,
                    name: s.name,
                    cgpa: s.cgpa,
                    backlogs: s.backlogs,
                    attendance: s.attendancePercentage,
                    lms_logins: s.lmsLoginFrequency,
                    assignments_late: s.assignmentsLate ?? 0,
                    placement_mock_score: s.mockInterviewScore,
                    technical_skill_score: s.codingScore,
                    student_satisfaction: s.studentSatisfaction ?? 4,
                    academic_risk_flag: s.academicRisk,
                    placement_risk_flag: s.placementRisk,
                  })),
                );
              } else {
                setLocalStudents(generateMockStudents());
              }
            }}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-500/50 hover:text-cyan-300 disabled:cursor-wait disabled:opacity-50"
          >
            <RefreshCw size={14} className={uploading ? 'animate-spin' : ''} aria-hidden="true" />
            Refresh data
          </button>
        </div>
      </header>
      {uploadError && (
        <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {uploadError}
        </p>
      )}
      {uploadMessage && (
        <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {uploadMessage}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-300">Cohort Login Frequency</p>
                <p className="mt-3 text-4xl font-bold tabular-nums text-cyan-300">{averageLogins.toFixed(1)}</p>
                <p className="mt-1 text-xs text-slate-500">average logins per student</p>
              </div>
              <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                engagementOnTrack
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                  : 'border-amber-400/30 bg-amber-400/10 text-amber-300'
              }`}>
                {engagementOnTrack
                  ? <ArrowUpRight size={14} aria-hidden="true" />
                  : <ArrowDownRight size={14} aria-hidden="true" />}
                {students.length === 0 ? 'No cohort data' : engagementOnTrack ? 'On track' : 'Needs attention'}
              </div>
            </div>
            <div className="mt-5 border-t border-slate-800 pt-3 text-xs text-slate-500">
              Cohort signal against the 50-login watchlist threshold · {students.length} students
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6">
            <p className="text-sm font-semibold text-slate-300">Assignment Submission Health</p>
            <div className="mt-3 flex items-baseline gap-2">
              <p className={`text-4xl font-bold tabular-nums ${totalLateAssignments > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                {totalLateAssignments}
              </p>
              <span className="text-sm text-slate-400">late assignments</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">total missed deadlines across the cohort</p>
            <div className="mt-5 flex items-center gap-2 border-t border-slate-800 pt-3 text-xs text-slate-500">
              <Activity size={14} className="text-cyan-400" aria-hidden="true" />
              <span>Across {students.length} active students</span>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 p-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Critical Disengagement Watchlist</h3>
                <p className="mt-1 text-xs text-slate-500">Fewer than 50 logins or more than 3 late assignments</p>
              </div>
              <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 text-xs font-bold text-rose-300">
                {watchlist.length} flagged
              </span>
            </div>
            {watchlist.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                {students.length === 0 ? 'No student records returned.' : 'No students currently meet the watchlist criteria.'}
              </p>
            ) : (
              <div className="max-h-72 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-900 text-[11px] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Student</th>
                      <th className="px-3 py-3 text-right font-medium">Logins</th>
                      <th className="px-5 py-3 text-right font-medium">Late</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {watchlist.map((student) => (
                      <tr key={student.student_id} className="hover:bg-slate-800/40">
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-2 font-medium text-white">
                            <AlertTriangle size={14} className="shrink-0 text-rose-400" aria-hidden="true" />
                            {student.name}
                            <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-300">
                              Alert
                            </span>
                          </span>
                        </td>
                        <td className={`px-3 py-3 text-right tabular-nums ${student.lms_logins < 50 ? 'text-rose-300' : 'text-slate-300'}`}>
                          {student.lms_logins}
                        </td>
                        <td className={`px-5 py-3 text-right tabular-nums ${student.assignments_late > 3 ? 'text-rose-300' : 'text-slate-300'}`}>
                          {student.assignments_late}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Engagement Distribution</h3>
                <p className="mt-1 text-xs text-slate-500">Each point represents one student</p>
              </div>
              <div className="flex gap-3 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-cyan-400" />On track</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-rose-400" />Watchlist</span>
              </div>
            </div>
            <EngagementChart students={students} />
            <p className="mt-2 text-[11px] text-slate-500">
              Dashed lines mark 50 logins and 3 late assignments.
            </p>
          </article>
        </div>
    </section>
  );
}
