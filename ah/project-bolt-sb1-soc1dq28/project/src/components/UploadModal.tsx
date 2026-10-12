import { useState, type ChangeEvent } from 'react';
import {
  X,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import type { StudentRecord } from '@/types';
import { generateBenchmarkStudents } from '@/lib/studentData';
import { uploadStudentDataFile, reloadBenchmarkFromBackend } from '@/lib/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (students: StudentRecord[]) => void;
}

export default function UploadModal({ isOpen, onClose, onDataLoaded }: UploadModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvHeader =
      'id,name,rollNumber,department,semester,cgpa,backlogs,internalMarks,attendancePercentage,assignmentsLate,lmsCompletionRate,lmsLoginFrequency,aptitudeScore,codingScore,mockInterviewScore\n' +
      'STU1015,Priya Sundaram,CS22-015,Computer Science,6,8.4,0,85,88,0,90,12,78,82,80\n' +
      'STU1016,Karan Malhotra,IT22-088,Information Technology,6,6.1,2,55,68,4,50,4,55,45,40\n';

    const blob = new Blob([csvHeader], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smart_campus_student_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function handleLoadBenchmark() {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const backendStudents = await reloadBenchmarkFromBackend();
      const students =
        backendStudents && backendStudents.length > 0
          ? backendStudents
          : generateBenchmarkStudents();
      onDataLoaded(students);
      setSuccess(true);
      setSuccessMessage(`Loaded ${students.length} benchmark student records with complete dual-risk metrics.`);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch {
      const fallback = generateBenchmarkStudents();
      onDataLoaded(fallback);
      setSuccess(true);
      setSuccessMessage(`Loaded ${fallback.length} benchmark student records.`);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // File type validation
    const validExtensions = ['.csv', '.json'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMessage('Invalid file format. Please upload a .csv or .json file.');
      return;
    }

    // Size check (max 15 MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 15 MB limit.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { students } = await uploadStudentDataFile(file);
      if (!students || students.length === 0) {
        throw new Error('No valid student records could be parsed from the uploaded file.');
      }

      onDataLoaded(students);
      setSuccess(true);
      setSuccessMessage(`Successfully imported ${students.length} student records. Dual-risk engine recalculated.`);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Upload failed. Please check the file headers and formatting.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-indigo-500/20 bg-[#0f172a] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Upload Campus Data</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Integrate academic, attendance, LMS, and placement records.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-5 space-y-4">
          {/* Quick Benchmark Button */}
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-indigo-200">KPMG Benchmark Dataset</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pre-compiled realistic dataset with 5 departments, dual-risk flags, and segmentations.
                </p>
                <button
                  type="button"
                  onClick={handleLoadBenchmark}
                  disabled={loading || success}
                  className="mt-3 flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  {success ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-300" />
                      <span>Data Loaded!</span>
                    </>
                  ) : loading ? (
                    <span>Integrating Data...</span>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Load Full Benchmark Dataset</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 animate-fade-in">
              <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold">Import Error</p>
                <p className="mt-0.5 text-slate-300">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 animate-fade-in">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Drag & drop file area */}
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-2xl p-6 text-center bg-slate-900/40 transition-colors">
            <UploadCloud size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-semibold text-slate-200">
              Upload Custom Student CSV / JSON
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Required headers: <code className="text-indigo-300">name</code>, <code className="text-indigo-300">department</code>, <code className="text-indigo-300">cgpa</code>, <code className="text-indigo-300">attendancePercentage</code>, and <code className="text-indigo-300">codingScore</code>.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <label className="inline-block">
                <span className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer shadow-md transition">
                  Browse Files
                </span>
                <input
                  type="file"
                  accept=".csv,.json"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </label>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                <Download size={13} />
                <span>Download Sample Template</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
