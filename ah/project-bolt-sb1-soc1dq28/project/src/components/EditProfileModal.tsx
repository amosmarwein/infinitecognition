import { useState } from 'react';
import { X, Check, User, Sparkles, Building2, GraduationCap, Shield, Lock } from 'lucide-react';
import type { UserAccount } from '@/lib/auth';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSave: (updated: UserAccount) => void;
}

const AVATAR_GRADIENTS = [
  { label: 'Amber Indigo', value: 'from-amber-500 to-indigo-600' },
  { label: 'Blue Indigo', value: 'from-blue-500 to-indigo-600' },
  { label: 'Emerald Teal', value: 'from-emerald-500 to-teal-600' },
  { label: 'Purple Rose', value: 'from-purple-500 to-rose-500' },
  { label: 'Cyan Sky', value: 'from-cyan-500 to-blue-600' },
  { label: 'Violet Fuchsia', value: 'from-violet-600 to-fuchsia-600' },
];

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSave,
}: EditProfileModalProps) {
  const isStudent = currentUser.role === 'Student';
  const [name, setName] = useState(currentUser.name);
  const [department, setDepartment] = useState(currentUser.department || '');
  const [designation, setDesignation] = useState(currentUser.designation || '');
  const [avatarColor, setAvatarColor] = useState(
    currentUser.avatarColor || 'from-indigo-500 to-indigo-700',
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || currentUser.role.slice(0, 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }

    // Role-enforced updates: students cannot alter academic credentials (ID, Dept, Semester, Role)
    const updated: UserAccount = {
      ...currentUser,
      name: name.trim(),
      avatarColor,
      role: currentUser.role, // strictly preserved
      // If student, preserve registrar-locked fields
      department: isStudent ? currentUser.department : department.trim() || undefined,
      designation: isStudent ? undefined : designation.trim() || undefined,
      studentId: currentUser.studentId,
      semester: currentUser.semester,
    };

    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-[#0e1628] shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#121c33] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <User size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Campus Profile Settings</h2>
              <p className="text-[11px] text-slate-400">
                {isStudent ? 'Student Account Identity' : 'Faculty / Staff Account Settings'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="border-b border-slate-800/80 bg-slate-900/40 p-5 flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColor} text-white font-bold text-lg flex items-center justify-center shadow-lg ring-2 ring-white/10 shrink-0 transition-all duration-300`}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm truncate">{name || 'Your Name'}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {isStudent
                ? `${currentUser.studentId || 'Enrolled'} • Semester ${currentUser.semester || 1}`
                : designation || department || 'Academic Staff'}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-2.5 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                required
                placeholder="Dr. Jane Doe"
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#131b2e] border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* If Student: Locked Academic Credentials Display */}
          {isStudent ? (
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                <Lock size={12} />
                <span>Registrar-Verified Student Credentials (Read-Only)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Student ID / Roll</span>
                  <span className="font-mono font-bold text-slate-200">{currentUser.studentId || 'STU1001'}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Current Term</span>
                  <span className="font-bold text-slate-200">Semester {currentUser.semester || 1}</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <span className="text-[10px] text-slate-500 uppercase block">Department</span>
                <span className="font-medium text-slate-300">{currentUser.department || 'Computer Science & Engineering'}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Academic records and enrollments are managed exclusively by the campus Registrar.
              </p>
            </div>
          ) : (
            <>
              {/* Faculty / Admin Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Department / Academic Unit
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Computer Science & Engineering"
                    className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#131b2e] border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Faculty / Admin Designation */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Designation / Academic Role
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder={
                      currentUser.role === 'Admin'
                        ? 'Dean of Academic Analytics'
                        : 'Associate Professor & Mentor'
                    }
                    className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#131b2e] border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Avatar Color Palette */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              <span>Avatar Theme Accent</span>
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_GRADIENTS.map((item) => {
                const isSelected = avatarColor === item.value;
                return (
                  <button
                    key={item.label}
                    type="button"
                    title={item.label}
                    onClick={() => setAvatarColor(item.value)}
                    className={`h-8 rounded-xl bg-gradient-to-br ${item.value} flex items-center justify-center transition-transform hover:scale-105 ${
                      isSelected ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savedSuccess}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check size={14} className="text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
