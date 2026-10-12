import type { StudentRecord, Intervention } from '@/types';

const STORAGE_KEY_STUDENTS = 'smartcampus_students_v1';
const STORAGE_KEY_INTERVENTIONS = 'smartcampus_interventions_v1';

export function calculateStudentMetrics(data: {
  cgpa: number;
  backlogs: number;
  internalMarks: number;
  attendancePercentage: number;
  lmsCompletionRate: number;
  aptitudeScore: number;
  codingScore: number;
  mockInterviewScore: number;
}): {
  academicScore: number;
  placementScore: number;
  successScore: number;
  riskCategory: 'High Risk' | 'Medium Risk' | 'Low Risk' | 'On Track';
  academicRisk: boolean;
  placementRisk: boolean;
  segment: StudentRecord['segment'];
  keyDrivers: { positive: string[]; negative: string[] };
} {
  // 1. Academic Normalized Score (0 - 100)
  // CGPA * 10 minus backlog penalty (15 pts per backlog)
  const rawAcademic = (data.cgpa / 10) * 100 - data.backlogs * 15;
  const academicScore = Math.max(0, Math.min(100, Math.round(rawAcademic)));

  // 2. Placement Normalized Score (0 - 100)
  const placementScore = Math.round(
    data.aptitudeScore * 0.35 + data.codingScore * 0.45 + data.mockInterviewScore * 0.2,
  );

  // 3. Overall Student Success Score (Weighted Composite Index):
  // Academic: 35%, Attendance: 25%, LMS: 15%, Placement: 25%
  const successScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        academicScore * 0.35 +
          data.attendancePercentage * 0.25 +
          data.lmsCompletionRate * 0.15 +
          placementScore * 0.25,
      ),
    ),
  );

  // 4. Dual-Risk Identification (KPMG Core Scope)
  // Academic Risk: low attendance (<75%), backlogs > 0, or low CGPA (<6.5)
  const academicRisk =
    data.attendancePercentage < 75 || data.backlogs > 0 || data.cgpa < 6.5;

  // Placement Risk: placement score < 60 or coding score < 50
  const placementRisk = placementScore < 60 || data.codingScore < 50;

  // Multi-tier Risk Category
  let riskCategory: 'High Risk' | 'Medium Risk' | 'Low Risk' | 'On Track';
  if (successScore < 50 || (academicRisk && placementRisk)) {
    riskCategory = 'High Risk';
  } else if (successScore < 68 || academicRisk || placementRisk) {
    riskCategory = 'Medium Risk';
  } else if (successScore < 82) {
    riskCategory = 'Low Risk';
  } else {
    riskCategory = 'On Track';
  }

  // 5. Bonus: Segmentation
  let segment: StudentRecord['segment'];
  const highAcademic = data.cgpa >= 7.5 && data.backlogs === 0;
  const highPlacement = placementScore >= 70;

  if (highAcademic && highPlacement) {
    segment = 'Scholars (High Academics & Placement)';
  } else if (highAcademic && !highPlacement) {
    segment = 'Academic Focus (High CGPA, Low Placement)';
  } else if (!highAcademic && highPlacement) {
    segment = 'Tech Coders (Low CGPA, High Placement)';
  } else {
    segment = 'Critical Intervention (Dual Risk)';
  }

  // 6. Bonus: Explainable Score Drivers
  const positive: string[] = [];
  const negative: string[] = [];

  if (data.cgpa >= 8.0) positive.push(`High CGPA (${data.cgpa})`);
  else if (data.cgpa < 6.5) negative.push(`Low CGPA (${data.cgpa})`);

  if (data.backlogs === 0) positive.push('Clear academic record (0 Backlogs)');
  else negative.push(`${data.backlogs} Active Backlog(s)`);

  if (data.attendancePercentage >= 85) positive.push(`Strong Attendance (${data.attendancePercentage}%)`);
  else if (data.attendancePercentage < 75) negative.push(`Critical Attendance Deficit (${data.attendancePercentage}%)`);

  if (data.codingScore >= 75) positive.push(`High Coding Proficiency (${data.codingScore}%)`);
  else if (data.codingScore < 50) negative.push(`Low Coding Readiness (${data.codingScore}%)`);

  if (data.lmsCompletionRate >= 80) positive.push(`Active LMS Engagement (${data.lmsCompletionRate}%)`);
  else if (data.lmsCompletionRate < 60) negative.push(`Low LMS Task Completion (${data.lmsCompletionRate}%)`);

  return {
    academicScore,
    placementScore,
    successScore,
    riskCategory,
    academicRisk,
    placementRisk,
    segment,
    keyDrivers: { positive, negative },
  };
}

export function generateBenchmarkStudents(): StudentRecord[] {
  const departments = ['Computer Science', 'Information Technology', 'Electronics & Comm.', 'Mechanical Eng.', 'Data Science & AI'];
  
  const rawList: Omit<
    StudentRecord,
    | 'academicScore'
    | 'placementScore'
    | 'successScore'
    | 'riskCategory'
    | 'academicRisk'
    | 'placementRisk'
    | 'segment'
    | 'keyDrivers'
    | 'clubsEvents'
    | 'softSkillScore'
    | 'facultyFeedback'
    | 'studentSatisfaction'
  >[] = [
    {
      id: 'st-01',
      name: 'Aarav Sharma',
      rollNumber: 'CS21-042',
      department: 'Computer Science',
      semester: 7,
      email: 'aarav.sharma@campus.edu',
      cgpa: 9.3,
      backlogs: 0,
      internalMarks: 94,
      attendancePercentage: 92,
      lmsCompletionRate: 95,
      lmsLoginFrequency: 14,
      aptitudeScore: 88,
      codingScore: 92,
      mockInterviewScore: 90,
      technicalAssessment: 91,
      certificationsCount: 4,
      hackathonParticipation: 3,
    },
    {
      id: 'st-02',
      name: 'Diya Patel',
      rollNumber: 'IT21-104',
      department: 'Information Technology',
      semester: 7,
      email: 'diya.patel@campus.edu',
      cgpa: 8.8,
      backlogs: 0,
      internalMarks: 86,
      attendancePercentage: 88,
      lmsCompletionRate: 85,
      lmsLoginFrequency: 11,
      aptitudeScore: 54,
      codingScore: 48,
      mockInterviewScore: 50,
      technicalAssessment: 52,
      certificationsCount: 1,
      hackathonParticipation: 0,
    },
    {
      id: 'st-03',
      name: 'Rohan Verma',
      rollNumber: 'CS21-089',
      department: 'Computer Science',
      semester: 7,
      email: 'rohan.verma@campus.edu',
      cgpa: 6.2,
      backlogs: 1,
      internalMarks: 68,
      attendancePercentage: 71,
      lmsCompletionRate: 70,
      lmsLoginFrequency: 8,
      aptitudeScore: 85,
      codingScore: 94,
      mockInterviewScore: 82,
      technicalAssessment: 90,
      certificationsCount: 3,
      hackathonParticipation: 4,
    },
    {
      id: 'st-04',
      name: 'Ananya Iyer',
      rollNumber: 'EC21-015',
      department: 'Electronics & Comm.',
      semester: 7,
      email: 'ananya.iyer@campus.edu',
      cgpa: 5.4,
      backlogs: 2,
      internalMarks: 52,
      attendancePercentage: 64,
      lmsCompletionRate: 45,
      lmsLoginFrequency: 4,
      aptitudeScore: 42,
      codingScore: 38,
      mockInterviewScore: 40,
      technicalAssessment: 45,
      certificationsCount: 0,
      hackathonParticipation: 0,
    },
    {
      id: 'st-05',
      name: 'Vikram Sengupta',
      rollNumber: 'DS21-031',
      department: 'Data Science & AI',
      semester: 5,
      email: 'vikram.s@campus.edu',
      cgpa: 8.1,
      backlogs: 0,
      internalMarks: 82,
      attendancePercentage: 84,
      lmsCompletionRate: 80,
      lmsLoginFrequency: 10,
      aptitudeScore: 78,
      codingScore: 82,
      mockInterviewScore: 76,
      technicalAssessment: 80,
      certificationsCount: 2,
      hackathonParticipation: 2,
    },
    {
      id: 'st-06',
      name: 'Sneha Reddy',
      rollNumber: 'CS21-118',
      department: 'Computer Science',
      semester: 7,
      email: 'sneha.reddy@campus.edu',
      cgpa: 7.9,
      backlogs: 0,
      internalMarks: 78,
      attendancePercentage: 74,
      lmsCompletionRate: 65,
      lmsLoginFrequency: 6,
      aptitudeScore: 62,
      codingScore: 58,
      mockInterviewScore: 60,
      technicalAssessment: 65,
      certificationsCount: 1,
      hackathonParticipation: 1,
    },
    {
      id: 'st-07',
      name: 'Kabir Mehta',
      rollNumber: 'ME21-055',
      department: 'Mechanical Eng.',
      semester: 7,
      email: 'kabir.mehta@campus.edu',
      cgpa: 5.8,
      backlogs: 3,
      internalMarks: 58,
      attendancePercentage: 61,
      lmsCompletionRate: 40,
      lmsLoginFrequency: 3,
      aptitudeScore: 48,
      codingScore: 35,
      mockInterviewScore: 45,
      technicalAssessment: 40,
      certificationsCount: 0,
      hackathonParticipation: 0,
    },
    {
      id: 'st-08',
      name: 'Pooja Kulkarni',
      rollNumber: 'IT21-073',
      department: 'Information Technology',
      semester: 5,
      email: 'pooja.k@campus.edu',
      cgpa: 9.1,
      backlogs: 0,
      internalMarks: 90,
      attendancePercentage: 94,
      lmsCompletionRate: 92,
      lmsLoginFrequency: 15,
      aptitudeScore: 86,
      codingScore: 88,
      mockInterviewScore: 85,
      technicalAssessment: 88,
      certificationsCount: 3,
      hackathonParticipation: 2,
    },
    {
      id: 'st-09',
      name: 'Arjun Nair',
      rollNumber: 'EC21-082',
      department: 'Electronics & Comm.',
      semester: 7,
      email: 'arjun.nair@campus.edu',
      cgpa: 8.5,
      backlogs: 0,
      internalMarks: 84,
      attendancePercentage: 86,
      lmsCompletionRate: 82,
      lmsLoginFrequency: 9,
      aptitudeScore: 50,
      codingScore: 45,
      mockInterviewScore: 48,
      technicalAssessment: 50,
      certificationsCount: 1,
      hackathonParticipation: 0,
    },
    {
      id: 'st-10',
      name: 'Ishaan Joshi',
      rollNumber: 'CS21-012',
      department: 'Computer Science',
      semester: 7,
      email: 'ishaan.joshi@campus.edu',
      cgpa: 6.8,
      backlogs: 0,
      internalMarks: 72,
      attendancePercentage: 80,
      lmsCompletionRate: 75,
      lmsLoginFrequency: 9,
      aptitudeScore: 76,
      codingScore: 85,
      mockInterviewScore: 80,
      technicalAssessment: 82,
      certificationsCount: 2,
      hackathonParticipation: 3,
    },
  ];

  // Generate 40 total realistic students for realistic distribution
  const extendedNames = [
    'Priya Deshmukh', 'Aditya Rao', 'Meera Nambiar', 'Manish Pandey', 'Tara Choudhury',
    'Sameer Ghosh', 'Neha Bhatt', 'Karan Singhania', 'Rhea Kapoor', 'Devendra Yadav',
    'Siddharth Jain', 'Tanvi Mathur', 'Varun Goswami', 'Anjali Saxena', 'Kunal Tiwari',
    'Shreya Sen', 'Harsh Vardhan', 'Bhavna Menon', 'Gaurav Mukherjee', 'Swati Das'
  ];

  extendedNames.forEach((name, idx) => {
    const isHighPerformer = idx % 4 === 0;
    const isAcademicOnly = idx % 4 === 1;
    const isTechCoder = idx % 4 === 2;
    // Critical is idx % 4 === 3

    let cgpa = 7.0;
    let backlogs = 0;
    let attendance = 80;
    let lms = 75;
    let coding = 65;
    let aptitude = 65;

    if (isHighPerformer) {
      cgpa = +(8.4 + (idx % 10) * 0.14).toFixed(1);
      attendance = 88 + (idx % 10);
      lms = 85 + (idx % 12);
      coding = 80 + (idx % 15);
      aptitude = 82 + (idx % 12);
    } else if (isAcademicOnly) {
      cgpa = +(8.2 + (idx % 8) * 0.12).toFixed(1);
      attendance = 85 + (idx % 8);
      lms = 82 + (idx % 10);
      coding = 42 + (idx % 12);
      aptitude = 48 + (idx % 10);
    } else if (isTechCoder) {
      cgpa = +(6.1 + (idx % 5) * 0.15).toFixed(1);
      attendance = 68 + (idx % 8);
      lms = 65 + (idx % 8);
      coding = 84 + (idx % 12);
      aptitude = 80 + (idx % 10);
      backlogs = idx % 2 === 0 ? 1 : 0;
    } else {
      cgpa = +(5.2 + (idx % 8) * 0.15).toFixed(1);
      attendance = 58 + (idx % 14);
      lms = 42 + (idx % 15);
      coding = 35 + (idx % 15);
      aptitude = 40 + (idx % 15);
      backlogs = 1 + (idx % 3);
    }

    rawList.push({
      id: `st-${idx + 11}`,
      name,
      rollNumber: `CS21-${120 + idx}`,
      department: departments[idx % departments.length],
      semester: 7,
      email: `${name.toLowerCase().replace(' ', '.')}@campus.edu`,
      cgpa,
      backlogs,
      internalMarks: Math.round(cgpa * 9.5),
      attendancePercentage: Math.min(100, attendance),
      lmsCompletionRate: Math.min(100, lms),
      lmsLoginFrequency: Math.round(lms / 8),
      aptitudeScore: Math.min(100, aptitude),
      codingScore: Math.min(100, coding),
      mockInterviewScore: Math.min(100, Math.round((aptitude + coding) / 2)),
      technicalAssessment: Math.min(100, coding),
      certificationsCount: isHighPerformer ? 3 : isTechCoder ? 2 : 0,
      hackathonParticipation: isTechCoder ? 3 : isHighPerformer ? 2 : 0,
    });
  });

  return rawList.map((st) => {
    const metrics = calculateStudentMetrics(st);
    const softSkillScore = Math.min(100, Math.round((st.mockInterviewScore || 65) * 0.85 + 12));
    const studentSatisfaction = Math.min(5.0, +(3.2 + (st.cgpa / 10) * 1.6).toFixed(1));
    const clubsEvents =
      st.hackathonParticipation > 1
        ? 'ACM Chapter, Coding Club'
        : st.hackathonParticipation === 1
        ? 'Robotics Society, Tech Fest'
        : 'Cultural Club, Literary Society';
    const facultyFeedback =
      st.backlogs > 0
        ? `Active backlog risk in ${st.backlogs} core course(s). Requires faculty remedial coaching and lab makeup sessions.`
        : st.attendancePercentage < 75
        ? `Attendance at ${st.attendancePercentage}% is below the 75% university eligibility cutoff. Attendance counseling recommended.`
        : st.codingScore < 50
        ? 'Excellent academic discipline and exam grades, but requires hands-on technical coding and interview practice.'
        : 'Proactive learner with exemplary classroom participation and strong collaborative project leadership.';

    return {
      ...st,
      softSkillScore,
      studentSatisfaction,
      clubsEvents,
      facultyFeedback,
      ...metrics,
    };
  });
}

export function generateBenchmarkInterventions(): Intervention[] {
  return [
    {
      id: 'int-01',
      studentId: 'st-04',
      studentName: 'Ananya Iyer',
      department: 'Electronics & Comm.',
      type: 'Academic Remedial',
      assignedTo: 'Prof. R. Sharma (HOD ECE)',
      date: '14 Oct 2026',
      status: 'Scheduled',
      notes: 'Remedial coaching for 2 active backlogs in Signals & Systems. Bi-weekly attendance check-in.',
    },
    {
      id: 'int-02',
      studentId: 'st-02',
      studentName: 'Diya Patel',
      department: 'Information Technology',
      type: 'Coding Bootcamp',
      assignedTo: 'Placement Cell - Tech Track',
      date: '12 Oct 2026',
      status: 'In Progress',
      notes: 'High CGPA (8.8) but low coding readiness (48%). Enrolled in 4-week Data Structures sprint.',
    },
    {
      id: 'int-03',
      studentId: 'st-07',
      studentName: 'Kabir Mehta',
      department: 'Mechanical Eng.',
      type: 'Attendance Counseling',
      assignedTo: 'Student Welfare Dean',
      date: '10 Oct 2026',
      status: 'In Progress',
      notes: 'Critical attendance at 61%. Parent-faculty counseling completed. Warning issued.',
    },
    {
      id: 'int-04',
      studentId: 'st-03',
      studentName: 'Rohan Verma',
      department: 'Computer Science',
      type: 'Faculty Mentorship',
      assignedTo: 'Dr. S. Nair',
      date: '08 Oct 2026',
      status: 'Completed',
      notes: 'Excellent coding acumen (94%). Mentored to clear 1 backlog and keep attendance above 75%.',
    },
  ];
}

export function loadSavedStudents(): StudentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStudents(students: StudentRecord[]): void {
  localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
}

export function loadSavedInterventions(): Intervention[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INTERVENTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveInterventions(interventions: Intervention[]): void {
  localStorage.setItem(STORAGE_KEY_INTERVENTIONS, JSON.stringify(interventions));
}

