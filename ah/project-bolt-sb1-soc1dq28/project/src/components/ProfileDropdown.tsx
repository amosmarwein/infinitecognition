import { useState } from 'react';
import {
  User,
  Sparkles,
  Database,
  LogOut,
  Sliders,
  ChevronRight,
  Command,
  Activity,
  HelpCircle,
  Shield,
  GraduationCap,
} from 'lucide-react';
import type { UserAccount } from '@/lib/auth';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onOpenEditProfile: () => void;
  onLogout: () => void;
}

export default function ProfileDropdown({
  isOpen,
  onClose,
  currentUser,
  onOpenEditProfile,
  onLogout,
}: ProfileDropdownProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  if (!isOpen) return null;

  const role = currentUser?.role || 'Admin';

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : role.slice(0, 1);

  const roleLabel =
    currentUser?.designation ||
    (role === 'Admin'
      ? 'College Administrator'
      : role === 'Teacher'
        ? 'Faculty Member & Mentor'
        : 'Enrolled Learner');

  const RoleIcon = role === 'Admin' ? Shield : role === 'Teacher' ? User : GraduationCap;

  return (
    <>
      {/* Invisible backdrop to dismiss on click outside */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Dropdown Container */}
      <div className="absolute right-0 top-full mt-3 z-50 w-80 sm:w-88 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0e1628] shadow-2xl shadow-black/95 animate-fade-in text-slate-100 ring-1 ring-white/10">
        {/* User Card */}
        <div className="border-b border-slate-800 bg-[#121c33] p-4.5">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                currentUser?.avatarColor || 'from-indigo-500 to-indigo-700'
              } text-white font-bold text-base flex items-center justify-center shadow-lg ring-2 ring-white/10 shrink-0`}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h3 className="text-sm font-bold text-white truncate">
                  {currentUser?.name || role}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {currentUser?.email || `${role.toLowerCase()}@smartcampus.edu`}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  <RoleIcon size={11} />
                  <span>{roleLabel}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs">
            <span className="text-slate-400">
              Department: <span className="font-medium text-slate-200">{currentUser?.department || 'Engineering'}</span>
            </span>
            {currentUser?.studentId && (
              <span className="text-slate-400 font-mono text-[11px]">
                ID: <span className="font-semibold text-slate-200">{currentUser.studentId}</span>
              </span>
            )}
          </div>
        </div>

        {/* Shortcuts popover overlay if toggled */}
        {showShortcuts ? (
          <div className="p-4 bg-slate-900/95 text-xs space-y-2 border-b border-slate-800">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Command size={14} className="text-indigo-400" />
                <span>Keyboard Shortcuts</span>
              </span>
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
            </div>
            <div className="flex items-center justify-between text-slate-300 py-0.5">
              <span>Quick Student Search</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]">
                / or Ctrl+K
              </kbd>
            </div>
            <div className="flex items-center justify-between text-slate-300 py-0.5">
              <span>Close Menus & Dialogs</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]">
                Esc
              </kbd>
            </div>
          </div>
        ) : null}

        {/* Menu Actions */}
        <div className="p-2.5 space-y-1">
          {/* Edit Profile */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenEditProfile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800/80 hover:text-white transition group"
          >
            <div className="flex items-center gap-2.5">
              <Sliders size={15} className="text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Edit Campus Profile</span>
            </div>
            <ChevronRight size={14} className="text-slate-500 group-hover:text-slate-300" />
          </button>

          {/* Keyboard Shortcuts */}
          <button
            type="button"
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800/80 hover:text-white transition group"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle size={15} className="text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Keyboard Shortcuts</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 border border-slate-700/60 px-1.5 py-0.5 rounded">
              Ctrl+K
            </span>
          </button>
        </div>

        {/* System Telemetry & Health */}
        <div className="border-t border-slate-800/80 bg-slate-950/40 p-3.5">
          <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Activity size={11} className="text-emerald-400" />
            <span>Telemetry & Infrastructure</span>
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-indigo-400" />
                <span>Groq AI Service</span>
              </span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <Database size={12} className="text-blue-400" />
                <span>SQLite Database</span>
              </span>
              <span className="text-slate-300 font-mono text-[11px]">Synced (v3.45)</span>
            </div>
          </div>
        </div>

        {/* Sign Out Action */}
        <div className="border-t border-slate-800 bg-[#121c33] p-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
          >
            <LogOut size={14} />
            <span>Sign Out of Portal</span>
          </button>
        </div>
      </div>
    </>
  );
}
