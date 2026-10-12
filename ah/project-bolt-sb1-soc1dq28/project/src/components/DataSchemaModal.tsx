import { X, Database, Download } from 'lucide-react';

interface DataSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataSchemaModal({ isOpen, onClose }: DataSchemaModalProps) {
  if (!isOpen) return null;

  function handleDownloadNote() {
    const noteText = `# Infinite Cognition — Student Success Score Methodology Note
## KPMG in India Challenge Deliverable

### 1. Indicators Used & Mathematical Composition
The Student Success Score is a composite index (0–100) reflecting a student's holistically evaluated health across curriculum mastery, engagement regularity, and career placement readiness.

#### Weights & Normalization:
- **Academic Component (35% Weight):**
  - CGPA normalized: (CGPA / 10) * 100
  - Backlog penalty: 15 points deducted per active backlog
  - Internal marks: Corroborates continuous assessment performance
  - Formula: \`AcademicScore = max(0, min(100, (CGPA / 10) * 100 - Backlogs * 15))\`

- **Attendance Component (25% Weight):**
  - Raw lecture attendance percentage
  - Crucial regulatory benchmark: < 75% marks immediate academic risk

- **LMS Engagement Component (15% Weight):**
  - Assignment completion rate (%) + weekly portal login frequency
  - Serves as the primary leading indicator of upcoming academic decline

- **Placement Readiness Component (25% Weight):**
  - Weighted combination: \`Aptitude (35%) + Coding Proficiency (45%) + Mock Technical Interview (20%)\`

#### Final Composite Equation:
\`Success Score = (0.35 × AcademicScore) + (0.25 × Attendance) + (0.15 × LMS) + (0.25 × PlacementScore)\`

### 2. At-Risk Identification (Dual-Risk Isolation)
- **Academic Risk:** Triggered if Attendance < 75%, Active Backlogs > 0, or CGPA < 6.5
- **Placement Risk:** Triggered if Placement Readiness < 60% or Coding Score < 50%
- **Critical Dual-Risk:** Both Academic AND Placement criteria violated simultaneously

### 3. Student Segmentation (Bonus Feature)
- **Scholars:** High Academic (CGPA >= 7.5, 0 backlogs) & High Placement (>= 70%)
- **Academic Focus:** High Academic & Low Placement (< 70%)
- **Tech Coders:** Low Academic & High Placement (>= 70%)
- **Critical Intervention:** Dual Academic & Placement deficit

### 4. Explainable AI (Bonus Feature)
Every profile explicitly presents exact mathematical point attribution for each component (+X pts) alongside positive drivers and negative penalty flags.
`;

    const blob = new Blob([noteText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Student_Success_Score_Methodology_Note.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const categories = [
    {
      category: '1. Academic (35% Weight)',
      fields: 'CGPA (0-10), Active Backlogs, Internal Assessment Marks',
      role: 'Captures curriculum mastery and backlog risk; steep penalty per backlog.',
    },
    {
      category: '2. Attendance (25% Weight)',
      fields: 'Overall Attendance %, Subject-wise Attendance',
      role: 'Monitors minimum eligibility threshold (<75% triggers immediate risk flag).',
    },
    {
      category: '3. LMS Engagement (15% Weight)',
      fields: 'Assignment Completion %, Weekly Login Frequency',
      role: 'Leading indicator of continuous student engagement and coursework effort.',
    },
    {
      category: '4. Placement Readiness (25% Weight)',
      fields: 'Aptitude Score %, Coding Score %, Mock Interview Score %',
      role: 'Identifies employability gaps early before company hiring drives.',
    },
    {
      category: '5. Skills & Extracurriculars',
      fields: 'Technical Certifications, Hackathon Participations',
      role: 'Used for bonus profile enrichment and segmentation tagging.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-indigo-500/20 bg-[#0f172a] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">KPMG Smart Campus Data Schema</h3>
              <p className="text-xs text-slate-400">Multi-source unified data model &amp; scoring weights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadNote}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              title="Download scoring methodology documentation note"
            >
              <Download size={13} />
              <span>Export Note</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Formula Callout */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-4">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Composite Success Score Formula
            </h4>
            <div className="mt-2 font-mono text-xs text-slate-200 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              Success Score = (0.35 × Academic) + (0.25 × Attendance) + (0.15 × LMS) + (0.25 × Placement)
            </div>
            <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
              Where Academic = (CGPA × 10) − (Backlogs × 15); Attendance = Raw %; LMS = Assignment %; Placement = (Aptitude × 0.35 + Coding × 0.45 + Mock × 0.20).
            </p>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Data Domain</th>
                  <th className="py-2.5 px-3">Indicators / Metrics</th>
                  <th className="py-2.5 px-3">Predictive Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {categories.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">{c.category}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-indigo-300">{c.fields}</td>
                    <td className="py-2.5 px-3 text-slate-400">{c.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Dual-Risk Rules */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
            <h4 className="text-xs font-bold text-white">Dual-Risk Classification Rules</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 text-slate-300">
                <span className="font-semibold text-rose-400">Academic Risk:</span> Triggered if Attendance &lt; 75%, Active Backlogs &gt; 0, or CGPA &lt; 6.5.
              </div>
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-slate-300">
                <span className="font-semibold text-amber-400">Placement Risk:</span> Triggered if Placement Readiness &lt; 60% or Coding Proficiency &lt; 50%.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/40 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
