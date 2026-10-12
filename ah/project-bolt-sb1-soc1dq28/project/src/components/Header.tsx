import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  RefreshCw,
  ChevronDown,
  X,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { CampusRole, UserAccount } from '@/lib/auth';
import type { StudentRecord, Intervention, ViewKey } from '@/types';
import NotificationsPopover from '@/components/NotificationsPopover';
import ProfileDropdown from '@/components/ProfileDropdown';
import EditProfileModal from '@/components/EditProfileModal';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  hasData: boolean;
  onLoadBenchmark: () => void;
  onResetData: () => void;
  userRole?: CampusRole;
  currentUser?: UserAccount | null;
  onUpdateUser?: (updated: UserAccount) => void;
  onLogout?: () => void;
  students?: StudentRecord[];
  interventions?: Intervention[];
  onNavigate?: (view: ViewKey) => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  hasData,
  onLoadBenchmark,
  onResetData,
  userRole = 'Admin',
  currentUser,
  onUpdateUser = () => {},
  onLogout = () => {},
  students = [],
  interventions = [],
  onNavigate = () => {},
}: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts (Ctrl+K or / to search, Esc to close menus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setNotificationsOpen(false);
        setProfileOpen(false);
        setSearchFocused(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live quick search matching students
  const matchingStudents = useMemo(() => {
    if (!students || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return students
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
          s.department.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [students, searchQuery]);

  const roleLabel =
    currentUser?.designation ||
    (userRole === 'Admin'
      ? 'College Administrator'
      : userRole === 'Teacher'
        ? 'Faculty Member'
        : 'Enrolled Learner');

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : userRole.slice(0, 1);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0c101c]/95 backdrop-blur-md border-b border-[#1e293b] px-6 flex items-center justify-between gap-4">
      {/* Search Input with Live Dropdown */}
      <div className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onFocus={() => setSearchFocused(true)}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search students by name, ID, department... (/)"
          className="w-full h-10 pl-10 pr-9 rounded-xl bg-[#131b2e] border border-[#1e293b] text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              searchInputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        ) : (
          <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono border border-slate-700/80 px-1.5 py-0.5 rounded bg-slate-800/40">
            /
          </span>
        )}

        {/* Live Search Results Dropdown */}
        {searchFocused && searchQuery.trim().length >= 2 && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setSearchFocused(false)}
            />
            <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-2xl border border-slate-800 bg-[#0e1628] shadow-2xl shadow-black/90">
              <div className="p-2 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Quick Search Results</span>
                <span>{matchingStudents.length} match{matchingStudents.length === 1 ? '' : 'es'}</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                {matchingStudents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No students found matching "{searchQuery}"
                  </div>
                ) : (
                  matchingStudents.map((st) => {
                    const isDualRisk = st.academicRisk && st.placementRisk;
                    return (
                      <div
                        key={st.id}
                        onClick={() => {
                          onSearchChange(st.name);
                          onNavigate('students');
                          setSearchFocused(false);
                        }}
                        className="flex items-center justify-between p-3 hover:bg-slate-800/60 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                            <GraduationCap size={15} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{st.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {st.rollNumber || st.id}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">{st.department}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isDualRisk ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <AlertTriangle size={11} />
                              Dual Risk
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <ShieldCheck size={11} />
                              On Track
                            </span>
                          )}
                          <ArrowRight size={13} className="text-slate-500" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-2 border-t border-slate-800 bg-[#121c33] text-center">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('students');
                    setSearchFocused(false);
                  }}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  View full results in Students directory &rarr;
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0 relative">
        {/* Toggle between Empty State & Loaded Data */}
        {userRole !== 'Student' &&
          (hasData ? (
            <button
              onClick={onResetData}
              title="Reset to empty state to view initial dashboard view"
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-300 shrink-0 whitespace-nowrap transition-colors"
            >
              <RefreshCw size={13} className="text-slate-400" />
              <span>Reset to Blank</span>
            </button>
          ) : (
            <button
              onClick={onLoadBenchmark}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#4f46e5] hover:bg-indigo-600 text-xs font-semibold text-white shrink-0 whitespace-nowrap shadow-md shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
            >
              <Sparkles size={13} />
              <span>Load Demo Data</span>
            </button>
          ))}

        {/* Interactive Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className={`relative p-2 rounded-xl transition-all ${
              notificationsOpen
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60'
            }`}
            aria-label="Campus Notifications"
            title="Notifications & Alerts"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-[#0c101c]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Dropdown */}
          <NotificationsPopover
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            students={students}
            interventions={interventions}
            onNavigate={(view) => {
              onNavigate(view);
              setNotificationsOpen(false);
            }}
            userRole={userRole}
            onNotificationCountChange={(count) => setUnreadCount(count)}
          />
        </div>

        {/* Interactive User Profile Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className={`flex items-center gap-3 pl-2.5 pr-2 py-1.5 rounded-2xl border transition-all ${
              profileOpen
                ? 'bg-slate-800/90 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700'
            }`}
            aria-label="User Account Menu"
          >
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                currentUser?.avatarColor || 'from-indigo-500 to-indigo-700'
              } text-white font-semibold text-xs flex items-center justify-center shadow-md shrink-0 ring-1 ring-white/10`}
            >
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-white leading-tight">
                {currentUser?.name || userRole}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight max-w-[140px] truncate">
                {roleLabel}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${
                profileOpen ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          <ProfileDropdown
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            currentUser={currentUser || null}
            onOpenEditProfile={() => {
              setProfileOpen(false);
              setEditProfileOpen(true);
            }}
            onLogout={onLogout}
          />
        </div>
      </div>

      {/* Edit Profile Modal */}
      {currentUser && (
        <EditProfileModal
          isOpen={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          currentUser={currentUser}
          onSave={(updated) => {
            onUpdateUser(updated);
          }}
        />
      )}
    </header>
  );
}
