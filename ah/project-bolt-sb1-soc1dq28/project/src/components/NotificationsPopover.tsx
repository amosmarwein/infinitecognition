import { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  AlertTriangle,
  Sparkles,
  Calendar,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import type { StudentRecord, Intervention, ViewKey } from '@/types';
import type { CampusRole } from '@/lib/auth';

export interface CampusNotification {
  id: string;
  type: 'risk' | 'intervention' | 'ai' | 'lms' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'info';
  actionView?: ViewKey;
  studentId?: string;
  categoryLabel?: string;
}

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentRecord[];
  interventions: Intervention[];
  onNavigate: (view: ViewKey) => void;
  userRole: CampusRole;
  onNotificationCountChange?: (count: number) => void;
}

export default function NotificationsPopover({
  isOpen,
  onClose,
  students,
  interventions,
  onNavigate,
  userRole,
  onNotificationCountChange,
}: NotificationsPopoverProps) {
  // Generate contextual initial notifications based on real student data
  const initialNotifications = useMemo<CampusNotification[]>(() => {
    const list: CampusNotification[] = [];

    // 1. Critical dual-risk students
    const dualRiskStudents = students.filter((s) => s.academicRisk && s.placementRisk);
    if (dualRiskStudents.length > 0) {
      const top = dualRiskStudents[0];
      list.push({
        id: 'notif-dual-risk',
        type: 'risk',
        title: 'Critical Dual-Risk Alert',
        message: `${top.name} (${top.rollNumber || top.id}) has breached both academic attendance (<75%) and placement benchmarks.`,
        time: '10m ago',
        isRead: false,
        priority: 'high',
        categoryLabel: 'Academic & Placement',
        actionView: 'risk-analysis',
        studentId: top.id,
      });
    }

    // 2. Scheduled interventions
    const scheduled = interventions.filter((i) => i.status === 'Scheduled');
    if (scheduled.length > 0) {
      const first = scheduled[0];
      list.push({
        id: 'notif-intervention',
        type: 'intervention',
        title: 'Intervention Session Scheduled',
        message: `${first.type} assigned for ${first.studentName} with ${first.assignedTo} on ${first.date}.`,
        time: '45m ago',
        isRead: false,
        priority: 'medium',
        categoryLabel: 'Mentorship',
        actionView: 'interventions',
      });
    }

    // 3. LMS Disengagement Watchlist
    const lowAttendance = students.filter((s) => s.attendancePercentage < 70);
    if (lowAttendance.length > 0) {
      list.push({
        id: 'notif-lms-watchlist',
        type: 'lms',
        title: 'Attendance Deficit Notice',
        message: `${lowAttendance.length} students have fallen below the 70% institutional attendance threshold.`,
        time: '2h ago',
        isRead: false,
        priority: 'high',
        categoryLabel: 'LMS Engagement',
        actionView: 'students',
      });
    }

    // 4. AI & Groq Engine Notification
    list.push({
      id: 'notif-ai-ready',
      type: 'ai',
      title: 'Groq AI Executive Briefing Ready',
      message: 'Automated synthesis generated for semester student cohort and early warning trends.',
      time: '3h ago',
      isRead: true,
      priority: 'info',
      categoryLabel: 'Cognitive AI',
      actionView: 'llm-insights',
    });

    // 5. System Security & Compliance
    list.push({
      id: 'notif-system-db',
      type: 'system',
      title: 'Database Synchronization Complete',
      message: 'SQLite storage verified with persistent dual-risk records and FERPA privacy compliance.',
      time: '5h ago',
      isRead: true,
      priority: 'info',
      categoryLabel: 'System Health',
      actionView: 'overview',
    });

    return list;
  }, [students, interventions]);

  const [notifications, setNotifications] = useState<CampusNotification[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'high'>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'high') return n.priority === 'high';
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    onNotificationCountChange?.(0);
  };

  const clearAll = () => {
    setNotifications([]);
    onNotificationCountChange?.(0);
  };

  const handleNotificationClick = (n: CampusNotification) => {
    markAsRead(n.id);
    if (n.actionView) {
      onNavigate(n.actionView);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Spacious, Beautiful Popover Card */}
      <div className="absolute right-0 top-full mt-3 z-50 w-[380px] sm:w-[450px] md:w-[480px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0e1628] shadow-2xl shadow-black/95 animate-fade-in text-slate-100 ring-1 ring-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#121c33] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Campus Notifications</h3>
              <p className="text-xs text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                title="Mark all as read"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                <CheckCheck size={14} />
                <span>Mark read</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 bg-slate-900/70 px-5 py-2.5">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('unread')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeFilter === 'unread'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('high')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeFilter === 'high'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            High Priority
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-800/70">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center text-slate-400">
              <CheckCircle2 size={36} className="mb-2.5 text-emerald-400" />
              <p className="text-sm font-semibold text-slate-200">No notifications to display</p>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                You are all caught up on academic alerts, intervention schedules, and system notices.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const iconMap = {
                risk: <AlertTriangle size={17} className="text-rose-400" />,
                intervention: <Calendar size={17} className="text-indigo-400" />,
                ai: <Sparkles size={17} className="text-amber-400" />,
                lms: <Activity size={17} className="text-orange-400" />,
                system: <ShieldCheck size={17} className="text-emerald-400" />,
              };

              const priorityBorder = {
                high: 'border-l-rose-500',
                medium: 'border-l-amber-500',
                info: 'border-l-indigo-500',
              };

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative flex cursor-pointer items-start gap-3.5 border-l-4 p-4 transition-colors hover:bg-slate-800/70 ${
                    priorityBorder[notif.priority]
                  } ${notif.isRead ? 'bg-transparent opacity-80' : 'bg-indigo-950/25'}`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/80 shadow-xs">
                    {iconMap[notif.type]}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <h4 className="text-xs font-bold text-white truncate">
                          {notif.title}
                        </h4>
                        {notif.categoryLabel && (
                          <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            {notif.categoryLabel}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-500 font-medium">
                        {notif.time}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between pt-1">
                      <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Take action</span>
                        <ArrowRight size={13} />
                      </span>

                      {!notif.isRead && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-[#121c33] px-5 py-3">
          <span className="text-xs text-slate-400">
            Current Portal: <span className="font-semibold text-slate-200">{userRole}</span>
          </span>
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-400 transition"
            >
              <Trash2 size={13} />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
