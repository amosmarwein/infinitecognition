export interface StudentRecord {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  semester: number;
  email: string;

  // 1. Academic
  cgpa: number; // 0.0 - 10.0
  backlogs: number; // 0, 1, 2...
  internalMarks: number; // 0 - 100

  // 2. Attendance
  attendancePercentage: number; // 0 - 100%
  assignmentsLate?: number;

  // 3. LMS Engagement
  lmsCompletionRate: number; // 0 - 100%
  lmsLoginFrequency: number; // logins per week

  // 4. Engagement (Events, Clubs, Hackathons, Certifications)
  certificationsCount: number;
  hackathonParticipation: number;
  clubsEvents: string;

  // 5. Placement (Aptitude, Coding, Mock Interviews)
  aptitudeScore: number; // 0 - 100
  codingScore: number; // 0 - 100
  mockInterviewScore: number; // 0 - 100

  // 6. Skills (Technical and Soft-skill assessments)
  technicalAssessment: number; // 0 - 100
  softSkillScore: number; // 0 - 100

  // 7. Feedback (Student satisfaction, Faculty feedback)
  facultyFeedback: string;
  studentSatisfaction: number; // 1.0 - 5.0

  // Calculated Metrics
  academicScore: number; // 0 - 100
  placementScore: number; // 0 - 100
  successScore: number; // 0 - 100
  riskCategory: 'High Risk' | 'Medium Risk' | 'Low Risk' | 'On Track';
  
  // Dual-risk flags (KPMG Core Scope)
  academicRisk: boolean;
  placementRisk: boolean;

  // Bonus: Segmentation
  segment:
    | 'Scholars (High Academics & Placement)'
    | 'Academic Focus (High CGPA, Low Placement)'
    | 'Tech Coders (Low CGPA, High Placement)'
    | 'Critical Intervention (Dual Risk)';

  // Bonus: Explainable Score Drivers
  keyDrivers: {
    positive: string[];
    negative: string[];
  };
}

export interface Intervention {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  type: 'Academic Remedial' | 'Coding Bootcamp' | 'Attendance Counseling' | 'Faculty Mentorship' | 'Mock Interview Prep';
  assignedTo: string;
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  notes: string;
}

export type ViewKey =
  | 'overview'
  | 'students'
  | 'risk-analysis'
  | 'segments'
  | 'interventions'
  | 'llm-insights'
  | 'reports'
  | 'lms-engagement'
  | 'upload-data'
  | 'data-schema'
  | 'dashboard'
  | 'analytics'
  | 'input-logs';

export interface LogEntry {
  id: string;
  studentName: string;
  studyHours: number;
  stressLevel: number;
  successScore: number;
  timestamp: number;
}
