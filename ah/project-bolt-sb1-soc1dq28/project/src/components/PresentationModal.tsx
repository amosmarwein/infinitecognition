import { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Database,
  ShieldAlert,
  Award,
  Layers,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  Download,
} from 'lucide-react';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PresentationModal({ isOpen, onClose }: PresentationModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: '1. Executive Problem & Solution Architecture',
      subtitle: 'From Disconnected Campus Silos to Unified Early Warning Intelligence',
      badge: 'Challenge Statement',
      badgeColor: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/25 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                The Campus Dilemma (Before Infinite Cognition)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Higher education institutions collect massive data streams—attendance, LMS logins, exam marks, placement tests, and clubs—yet they sit locked in fragmented silos.
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                <li>Academics and placement cells never communicate proactively.</li>
                <li>At-risk students are identified only after semester exam failures.</li>
                <li>One-size-fits-all remedial actions fail to address specific root causes.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/25 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Infinite Cognition Decision Intelligence
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                A unified, real-time AI platform that brings together 7 core student data streams into a 360° profile, predicting academic and placement risks before they materialize.
              </p>
              <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                <li>Transparent, explainable Student Success Index (0–100).</li>
                <li>Early Dual-Risk detection separating academic vs career deficits.</li>
                <li>Closed-loop intervention management and placement audit compliance.</li>
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span className="font-semibold text-white">Target Beneficiaries:</span>
            <span className="text-slate-400">Deans • HODs • Faculty Mentors • Placement Cells • Enrolled Students</span>
          </div>
        </div>
      ),
    },
    {
      title: '2. Multi-Source 7-Domain Data Integration',
      subtitle: '360° Comprehensive Student Success Data Model',
      badge: 'Data Integration (30% Weight)',
      badgeColor: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Infinite Cognition harmonizes 7 disparate institutional data pipelines into a single source of truth:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/20">
              <span className="font-bold text-indigo-400 block mb-1">1. Academic (35%)</span>
              <p className="text-[11px] text-slate-300">CGPA, active backlogs, internal assessment marks, semester trends.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/20">
              <span className="font-bold text-emerald-400 block mb-1">2. Attendance (25%)</span>
              <p className="text-[11px] text-slate-300">Overall attendance %, regulatory 75% cutoff triggers, exam eligibility.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-sky-500/20">
              <span className="font-bold text-sky-400 block mb-1">3. LMS (15%)</span>
              <p className="text-[11px] text-slate-300">Assignment completion rate %, weekly login frequency, continuous effort.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/20">
              <span className="font-bold text-amber-400 block mb-1">4. Placement (25%)</span>
              <p className="text-[11px] text-slate-300">Aptitude test score, coding readiness, mock technical interview score.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-500/20">
              <span className="font-bold text-purple-400 block mb-1">5. Engagement</span>
              <p className="text-[11px] text-slate-300">Technical certifications, hackathon participations, student clubs.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-teal-500/20">
              <span className="font-bold text-teal-400 block mb-1">6. Skills Assessment</span>
              <p className="text-[11px] text-slate-300">Hands-on coding assessments, soft skills communication evaluations.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-pink-500/20 col-span-2 sm:col-span-1 lg:col-span-2">
              <span className="font-bold text-pink-400 block mb-1">7. Qualitative Feedback & Sentiment</span>
              <p className="text-[11px] text-slate-300">Student course satisfaction ratings (1–5) and faculty mentor counseling notes.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-[11px] text-slate-400">
            <strong>Ingestion Flexibility:</strong> Supports drag-and-drop CSV uploads, schema validation, natural language entry parser, and RESTful SQLite persistent storage.
          </div>
        </div>
      ),
    },
    {
      title: '3. Student Success Score & Dual-Risk Engine',
      subtitle: 'Mathematical Transparency with Explainable AI Drivers',
      badge: 'Scoring Logic (25% Weight)',
      badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
      content: (
        <div className="space-y-4">
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-3.5 space-y-2">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Composite Success Index Formula (0 – 100)
            </h4>
            <div className="font-mono text-xs text-white bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
              Success Score = (0.35 × Academic) + (0.25 × Attendance) + (0.15 × LMS) + (0.25 × Placement)
            </div>
            <p className="text-[11px] text-slate-400">
              Where <code className="text-indigo-300">Academic = (CGPA × 10) − (Backlogs × 15)</code>; <code className="text-indigo-300">Placement = (Aptitude × 0.35 + Coding × 0.45 + Mock × 0.20)</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
              <span className="font-bold text-rose-400 block mb-1">Academic Risk Cutoff</span>
              <p className="text-slate-300 text-[11px]">
                Triggered if Attendance &lt; 75%, active backlogs &gt; 0, or CGPA &lt; 6.5. Signals curriculum disengagement or examination failure risk.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30">
              <span className="font-bold text-amber-400 block mb-1">Placement Risk Cutoff</span>
              <p className="text-slate-300 text-[11px]">
                Triggered if Placement Score &lt; 60% or Coding Readiness &lt; 50%. Isolates technical deficiencies early before campus placement drives.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/25 text-xs text-slate-300">
            <strong className="text-emerald-400">Bonus Explainability (XAI):</strong> Each student profile details the exact point contribution of every component (+18.2 pts from CGPA, +21.5 pts from Attendance) and lists visible positive strengths and negative risk triggers.
          </div>
        </div>
      ),
    },
    {
      title: '4. Student Segmentation & Closed-Loop Interventions',
      subtitle: 'Targeted Remedial Actions Rather Than Generic Broad Advice',
      badge: 'Bonus Features (10 Points)',
      badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Infinite Cognition automatically segments cohorts into 4 distinct quadrants for precision faculty action:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300">1. Scholars</span>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">High Acad / High Place</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Target: Fast-track honor electives, competitive hackathons, and tier-1 corporate interviews.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-sky-500/30">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-300">2. Academic Focus</span>
                <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">High CGPA / Low Placement</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Target: Placement coding bootcamps, DSA problem solving, and soft-skills mock interviews.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">3. Tech Coders</span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Low CGPA / High Placement</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Target: Academic remedial coaching, backlog clearance sprints, and attendance counseling.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/30">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-300">4. Critical Dual-Risk</span>
                <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">Dual Deficit</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Target: Immediate 1-on-1 faculty mentorship, parental involvement, and mandatory remedial track.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
            <strong>Lifecycle Tracking:</strong> Faculty can assign interventions, track live status (<em>Scheduled &rarr; In Progress &rarr; Completed</em>), log outcomes, and monitor institutional intervention coverage % in real-time.
          </div>
        </div>
      ),
    },
    {
      title: '5. AI Synthesis, Institutional Impact & Audit Readiness',
      subtitle: 'Generative AI Insights + Complete Corporate Governance Compliance',
      badge: 'Strategic Vision (10% Weight)',
      badgeColor: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/25 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <BrainCircuit size={15} />
                <span>AI Insights Engine (Groq LLaMA 3.3)</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Synthesizes institutional-wide trends into executive summaries, identifying high-risk departments, underlying root causes, and proactive remedial plans in seconds.
              </p>
              <p className="text-[11px] text-slate-400">
                Distinguishes evidence-based findings from recommendations with high-speed inference.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={15} />
                <span>Placement Audit &amp; Reports Center</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Institutional compliance engine that cross-verifies students against placement eligibility criteria (CGPA &ge; 6.0, 0 active backlogs, attendance &ge; 75%).
              </p>
              <p className="text-[11px] text-slate-400">
                1-click CSV &amp; JSON exports for placement officers and accreditation audits (NAAC / NBA).
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span><strong>Ready for Production Deployment:</strong> FastAPI + SQLite + Vite React + TypeScript</span>
            <span className="font-semibold text-emerald-400">100% KPMG Challenge Rubric Alignment</span>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slides.length, onClose]);

  if (!isOpen) return null;

  const current = slides[currentSlide];

  function handleDownloadNotes() {
    const noteContent = `# Infinite Cognition — Smart Campus Analytics & Student Success Platform
## KPMG in India Challenge — Executive Presentation & Methodology Note

### 1. Executive Summary & Problem Understanding
Higher education campuses generate vast amounts of disaggregated data across LMS, attendance registers, examination databases, and placement assessments. Infinite Cognition integrates these into a unified early-warning system to identify academic and placement risks before students fail or miss corporate placements.

### 2. Multi-Source 7-Pillar Data Model
1. Academic: CGPA (0-10), Active Backlogs, Internal Marks.
2. Attendance: Overall Attendance %, Subject-wise Attendance.
3. LMS Engagement: Course Completion %, Login Frequency.
4. Extracurricular Engagement: Technical Certifications, Hackathon Participations, Clubs.
5. Placement Readiness: Aptitude Score, Coding Readiness, Mock Technical Interview Score.
6. Skills Assessment: Technical Assessment, Soft-Skill Communication.
7. Feedback & Sentiment: Student Satisfaction Rating (1-5), Faculty Qualitative Feedback.

### 3. Student Success Index & Scoring Formula
Success Score = (0.35 × Academic) + (0.25 × Attendance) + (0.15 × LMS) + (0.25 × Placement)
- Academic Component = max(0, min(100, (CGPA / 10) * 100 - Backlogs * 15))
- Placement Component = (Aptitude * 0.35 + Coding * 0.45 + MockInterview * 0.20)
- Risk Thresholds:
  - Academic Risk: Attendance < 75% OR Backlogs > 0 OR CGPA < 6.5
  - Placement Risk: Placement Readiness < 60% OR Coding Proficiency < 50%
  - Dual Critical Risk: Both criteria violated simultaneously.

### 4. Student Segmentation (Bonus Feature)
- Scholars: High Academics (CGPA >= 7.5, 0 backlogs) + High Placement (>= 70%)
- Academic Focus: High Academics + Low Placement (< 70%)
- Tech Coders: Low Academics + High Placement (>= 70%)
- Critical Intervention: Dual Academic & Placement Deficit

### 5. Explainable AI & Score Drivers (Bonus Feature)
Every profile details the exact mathematical point attribution and identifies active risk triggers.

### 6. AI Insights & Interventions
Powered by FastAPI + SQLite + Groq LLaMA 3.3 for real-time institutional synthesis.
`;

    const blob = new Blob([noteContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Infinite_Cognition_Executive_Presentation_Note.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl flex flex-col rounded-3xl border border-indigo-500/20 bg-[#0d1424] shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Infinite Cognition Executive Presentation
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Slide {currentSlide + 1} of {slides.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">KPMG Challenge Deck &amp; Approach Walkthrough</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadNotes}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              title="Download Presentation Notes"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export Note</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Slide Body */}
        <div className="p-6 md:p-8 flex-1 min-h-[380px] overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
            <div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${current.badgeColor}`}>
                {current.badge}
              </span>
              <h2 className="text-lg font-bold text-white mt-1.5">{current.title}</h2>
              <p className="text-xs text-slate-400">{current.subtitle}</p>
            </div>
          </div>

          <div className="pt-2 animate-fade-in">{current.content}</div>
        </div>

        {/* Navigation Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'w-6 bg-indigo-500'
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            {currentSlide < slides.length - 1 ? (
              <button
                onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 transition-colors"
              >
                <span>Done</span>
                <CheckCircle2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

