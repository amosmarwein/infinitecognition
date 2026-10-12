import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import UploadModal from '@/components/UploadModal';
import DataSchemaModal from '@/components/DataSchemaModal';
import PresentationModal from '@/components/PresentationModal';
import AddInterventionModal from '@/components/AddInterventionModal';
import Dashboard, { type CampusRole, type UserAccount } from '@/views/Dashboard';
import { getSessionUser, setSessionUser, updateUserAccount } from '@/lib/auth';
import {
  fetchStudentsFromBackend,
  fetchBackendInterventions,
  reloadBenchmarkFromBackend,
  createBackendIntervention,
  updateBackendIntervention,
  deleteBackendIntervention,
} from '@/lib/api';
import Overview from '@/views/Overview';
import Students from '@/views/Students';
import RiskAnalysis from '@/views/RiskAnalysis';
import Segments from '@/views/Segments';
import InterventionsView from '@/views/Interventions';
import LLMInsights from '@/views/LLMInsights';
import LMSEngagement from '@/views/LMSEngagement';
import ReportsView from '@/views/Reports';
import type { ViewKey, StudentRecord, Intervention } from '@/types';
import {
  calculateStudentMetrics,
  generateBenchmarkInterventions,
  generateBenchmarkStudents,
  loadSavedInterventions,
  loadSavedStudents,
  saveInterventions,
  saveStudents,
} from '@/lib/studentData';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    if (record[key] === undefined) continue;
    const value = typeof record[key] === 'number' ? record[key] : Number(record[key]);
    if (!Number.isFinite(value)) throw new Error(`Student field "${key}" must be numeric.`);
    return value;
  }
  return undefined;
}

function readString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    if (record[key] === undefined) continue;
    if (typeof record[key] !== 'string') throw new Error(`Student field "${key}" must be text.`);
    return record[key];
  }
  return undefined;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<CampusRole>('Admin');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [view, setView] = useState<ViewKey>('overview');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [llmInsight, setLlmInsight] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [interventionOpen, setInterventionOpen] = useState(false);
  const [interventionDefaultStudentId, setInterventionDefaultStudentId] = useState<string | undefined>();
  const [interventionDefaultType, setInterventionDefaultType] = useState<Intervention['type'] | undefined>();

  function handleOpenAddIntervention(studentId?: string, type?: Intervention['type']) {
    setInterventionDefaultStudentId(studentId);
    setInterventionDefaultType(type);
    setInterventionOpen(true);
  }

  useEffect(() => {
    const savedStudents = loadSavedStudents();
    const savedInterventions = loadSavedInterventions();
    if (savedStudents.length) setStudents(savedStudents);
    if (savedInterventions.length) setInterventions(savedInterventions);

    // Sync with backend API if available
    fetchStudentsFromBackend().then((apiStudents) => {
      if (apiStudents && apiStudents.length > 0) {
        setStudents(apiStudents);
        saveStudents(apiStudents);
      }
    });

    fetchBackendInterventions().then((apiInterventions) => {
      if (apiInterventions && apiInterventions.length > 0) {
        setInterventions(apiInterventions);
        saveInterventions(apiInterventions);
      }
    });

    const session = getSessionUser();
    if (session) {
      setCurrentUser(session);
      setUserRole(session.role);
      setIsAuthenticated(true);
    }
  }, []);

  function handleLogin(role: CampusRole, user?: UserAccount) {
    setUserRole(role);
    if (user) {
      setCurrentUser(user);
    }
    setView('overview');
    setIsAuthenticated(true);
  }

  function handleLogout() {
    setSessionUser(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
  }

  function handleUpdateUser(updated: UserAccount) {
    const saved = updateUserAccount(updated);
    if (saved) {
      setCurrentUser(saved);
      setUserRole(saved.role);
    } else {
      setCurrentUser(updated);
      setUserRole(updated.role);
      setSessionUser(updated);
    }
  }

  function handleDataLoaded(loadedStudents: StudentRecord[]) {
    setStudents(loadedStudents);
    saveStudents(loadedStudents);
    const benchmarkInterventions = generateBenchmarkInterventions();
    setInterventions(benchmarkInterventions);
    saveInterventions(benchmarkInterventions);
  }

  async function handleLoadBenchmark() {
    try {
      const apiStudents = await reloadBenchmarkFromBackend();
      if (apiStudents && apiStudents.length > 0) {
        handleDataLoaded(apiStudents);
        return;
      }
    } catch {
      // Fallback
    }
    handleDataLoaded(generateBenchmarkStudents());
  }

  function handleResetData() {
    setStudents([]);
    saveStudents([]);
    setInterventions([]);
    saveInterventions([]);
  }

  function handleAddIntervention(intervention: Intervention) {
    const updated = [intervention, ...interventions];
    setInterventions(updated);
    saveInterventions(updated);
    createBackendIntervention(intervention).catch(() => {});
  }

  async function handleUpdateIntervention(id: string, updates: Partial<Intervention>) {
    const updated = interventions.map((item) =>
      item.id === id ? { ...item, ...updates } : item,
    );
    setInterventions(updated);
    saveInterventions(updated);
    await updateBackendIntervention(id, updates);
  }

  async function handleDeleteIntervention(id: string) {
    const updated = interventions.filter((item) => item.id !== id);
    setInterventions(updated);
    saveInterventions(updated);
    await deleteBackendIntervention(id);
  }

  function handleNaturalEntryResult(records: unknown[]): number {
    if (!records.every(isRecord)) {
      throw new Error('Natural-entry response contains an invalid student record.');
    }

    const mappedStudents = records.map((record): StudentRecord => {
      const id = readString(record, ['id', 'student_id', 'studentId']);
      if (!id) throw new Error('A student record is missing its ID.');
      const existing = students.find(
        (student) => student.id === id || student.rollNumber === id,
      );
      const cgpa = readNumber(record, ['cgpa']) ?? existing?.cgpa ?? 0;
      const backlogs = readNumber(record, ['backlogs']) ?? existing?.backlogs ?? 0;
      const internalMarks =
        readNumber(record, ['internalMarks', 'internal_marks']) ?? existing?.internalMarks ?? 0;
      const attendancePercentage =
        readNumber(record, ['attendancePercentage', 'attendance_percentage', 'attendance']) ??
        existing?.attendancePercentage ?? 0;
      const lmsCompletionRate =
        readNumber(record, ['lmsCompletionRate', 'lms_completion_rate']) ??
        existing?.lmsCompletionRate ?? 0;
      const aptitudeScore =
        readNumber(record, ['aptitudeScore', 'aptitude_score']) ?? existing?.aptitudeScore ?? 0;
      const codingScore =
        readNumber(record, ['codingScore', 'coding_score', 'technical_skill_score']) ??
        existing?.codingScore ?? 0;
      const mockInterviewScore =
        readNumber(record, ['mockInterviewScore', 'mock_interview_score', 'placement_mock_score']) ??
        existing?.mockInterviewScore ?? 0;

      return {
        id,
        name: readString(record, ['name', 'student_name']) ?? existing?.name ?? id,
        rollNumber:
          readString(record, ['rollNumber', 'roll_number', 'student_id']) ??
          existing?.rollNumber ?? id,
        department:
          readString(record, ['department', 'dept']) ?? existing?.department ?? 'Unassigned',
        semester: readNumber(record, ['semester']) ?? existing?.semester ?? 1,
        email: readString(record, ['email']) ?? existing?.email ?? '',
        cgpa,
        backlogs,
        internalMarks,
        attendancePercentage,
        assignmentsLate:
          readNumber(record, ['assignmentsLate', 'assignments_late']) ??
          existing?.assignmentsLate ?? 0,
        lmsCompletionRate,
        lmsLoginFrequency:
          readNumber(record, ['lmsLoginFrequency', 'lms_login_frequency', 'lms_logins']) ??
          existing?.lmsLoginFrequency ?? 0,
        certificationsCount:
          readNumber(record, ['certificationsCount', 'certifications_count']) ??
          existing?.certificationsCount ?? 0,
        hackathonParticipation:
          readNumber(record, ['hackathonParticipation', 'hackathon_participation']) ??
          existing?.hackathonParticipation ?? 0,
        clubsEvents:
          readString(record, ['clubsEvents', 'clubs_events']) ?? existing?.clubsEvents ?? '',
        aptitudeScore,
        codingScore,
        mockInterviewScore,
        technicalAssessment:
          readNumber(record, ['technicalAssessment', 'technical_assessment']) ??
          existing?.technicalAssessment ?? codingScore,
        softSkillScore: readNumber(record, ['softSkillScore', 'soft_skill_score']) ??
          existing?.softSkillScore ?? 0,
        facultyFeedback:
          readString(record, ['facultyFeedback', 'faculty_feedback']) ??
          existing?.facultyFeedback ?? '',
        studentSatisfaction:
          readNumber(record, ['studentSatisfaction', 'student_satisfaction']) ??
          existing?.studentSatisfaction ?? 0,
        ...calculateStudentMetrics({
          cgpa,
          backlogs,
          internalMarks,
          attendancePercentage,
          lmsCompletionRate,
          aptitudeScore,
          codingScore,
          mockInterviewScore,
        }),
      };
    });

    setStudents(mappedStudents);
    saveStudents(mappedStudents);
    return mappedStudents.length;
  }

  if (!isAuthenticated) {
    return <Dashboard onLogin={handleLogin} />;
  }

  const allowedViews: ViewKey[] =
    userRole === 'Teacher'
      ? ['overview', 'lms-engagement', 'risk-analysis']
      : userRole === 'Student'
        ? ['overview']
      : [
          'overview',
          'students',
          'risk-analysis',
          'segments',
          'interventions',
          'llm-insights',
          'lms-engagement',
        ];
  const filteredStudents =
    userRole === 'Student'
      ? students.filter((student) => {
          if (currentUser?.studentId) {
            const idUpper = currentUser.studentId.toUpperCase();
            if (
              student.id.toUpperCase().includes(idUpper) ||
              student.rollNumber.toUpperCase().includes(idUpper)
            ) {
              return true;
            }
          }
          return (
            student.id.toUpperCase().includes('STU1001') ||
            student.rollNumber.toUpperCase().includes('STU1001')
          );
        })
      : students;

  const visibleStudents =
    userRole === 'Student' && filteredStudents.length === 0 && students.length > 0
      ? students.slice(0, 1)
      : filteredStudents;

  return (
    <div className="flex min-h-screen w-full bg-[#0b0f19] font-sans text-slate-100">
      <Sidebar
        active={view}
        onNavigate={setView}
        onOpenUpload={() => setUploadOpen(true)}
        onOpenSchema={() => setSchemaOpen(true)}
        onOpenPresentation={() => setPresentationOpen(true)}
        allowedViews={allowedViews}
      />
      <div className="flex min-w-0 flex-1 flex-col bg-[#0b0f19]">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          hasData={visibleStudents.length > 0}
          onLoadBenchmark={handleLoadBenchmark}
          onResetData={handleResetData}
          userRole={userRole}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          students={students}
          interventions={interventions}
          onNavigate={setView}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto p-6 md:p-8">
          {view === 'overview' && (
            <Overview
              students={visibleStudents}
              interventions={interventions}
              onNavigate={setView}
              onOpenUpload={() => setUploadOpen(true)}
              onOpenSchema={() => setSchemaOpen(true)}
              onOpenAddIntervention={() => handleOpenAddIntervention()}
              onApplyNaturalEntry={handleNaturalEntryResult}
              userRole={userRole}
            />
          )}
          {view === 'students' && <Students students={visibleStudents} searchQuery={searchQuery} />}
          {view === 'risk-analysis' && (
            <RiskAnalysis
              students={visibleStudents}
              interventions={interventions}
              onNavigate={setView}
              onOpenAddIntervention={handleOpenAddIntervention}
            />
          )}
          {view === 'segments' && <Segments students={visibleStudents} />}
          {view === 'interventions' && (
            <InterventionsView
              interventions={interventions}
              onOpenAdd={() => handleOpenAddIntervention()}
              onUpdateIntervention={handleUpdateIntervention}
              onDeleteIntervention={handleDeleteIntervention}
              userRole={userRole}
            />
          )}
          {view === 'llm-insights' && (
            <LLMInsights students={visibleStudents} llmInsight={llmInsight} />
          )}
          {view === 'lms-engagement' && (
            <LMSEngagement
              students={visibleStudents}
              onLlmInsight={setLlmInsight}
              onDataLoaded={handleDataLoaded}
            />
          )}
          {view === 'reports' && (
            <ReportsView students={visibleStudents} />
          )}
        </main>
      </div>

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
      />
      <DataSchemaModal isOpen={schemaOpen} onClose={() => setSchemaOpen(false)} />
      <PresentationModal
        isOpen={presentationOpen}
        onClose={() => setPresentationOpen(false)}
      />
      <AddInterventionModal
        isOpen={interventionOpen}
        onClose={() => setInterventionOpen(false)}
        students={visibleStudents}
        onAdd={handleAddIntervention}
        defaultStudentId={interventionDefaultStudentId}
        defaultType={interventionDefaultType}
      />
    </div>
  );
}
