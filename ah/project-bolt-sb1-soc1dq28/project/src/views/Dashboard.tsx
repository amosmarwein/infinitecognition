import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  BrainCircuit,
  LockKeyhole,
  Mail,
  UserRound,
  ShieldCheck,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  School,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Award,
  ChevronRight,
  Building,
  KeyRound,
  Activity,
} from 'lucide-react';
import {
  type CampusRole,
  type UserAccount,
  DEFAULT_USERS,
  loginUser,
  registerUser,
  resetPassword,
} from '@/lib/auth';

export type { CampusRole, UserAccount };

interface DashboardProps {
  onLogin: (role: CampusRole, user?: UserAccount) => void;
}

export default function Dashboard({ onLogin }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<CampusRole>('Admin');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@college.edu');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [signupDepartment, setSignupDepartment] = useState('Computer Science & Engineering');
  const [signupStudentId, setSignupStudentId] = useState('');
  const [signupSemester, setSignupSemester] = useState<number>(4);
  const [signupDesignation, setSignupDesignation] = useState('Assistant Professor');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot password form state
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState<{ success?: boolean; message?: string } | null>(
    null,
  );

  // Status feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Canvas particle animation ref & lifecycle
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    // Particle nodes configuration
    const count = Math.min(Math.max(Math.floor((width * height) / 22000), 32), 65);
    const colors = ['#818cf8', '#a855f7', '#6366f1', '#38bdf8'];
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.8 + 0.8,
      baseAlpha: Math.random() * 0.45 + 0.25,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render drifting particles and neural connections
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around borders
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;

        // Mouse avoidance/interaction
        const mdx = mouseX - p.x;
        const mdy = mouseY - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 140) {
          const force = (1 - mdist / 140) * 0.8;
          p.x -= (mdx / mdist) * force;
          p.y -= (mdy / mdist) * force;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.baseAlpha;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#6366f1';
            ctx.globalAlpha = (1 - dist / 115) * 0.18;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Password strength check
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Too short', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(signupPassword);

  // Demo account quick switch
  const handleQuickDemo = (role: CampusRole) => {
    setSelectedRole(role);
    const demo = DEFAULT_USERS.find((u) => u.role === role);
    if (demo) {
      setLoginEmail(demo.email);
      setLoginPassword('password123');
      setErrorMessage(null);
      setSuccessMessage(`Loaded ${demo.role} credentials: ${demo.name}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Switch role tab
  const handleRoleChange = (role: CampusRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (activeTab === 'login') {
      const demo = DEFAULT_USERS.find((u) => u.role === role);
      if (demo) {
        setLoginEmail(demo.email);
        setLoginPassword('password123');
      }
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = loginUser(loginEmail, loginPassword, selectedRole);
      setIsLoading(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      } else if (result.user) {
        setSuccessMessage(`Welcome back, ${result.user.name}! Redirecting...`);
        setTimeout(() => {
          onLogin(result.user!.role, result.user);
        }, 500);
      }
    }, 400);
  };

  // Handle Signup Submit
  const handleSignupSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!agreeTerms) {
      setErrorMessage('Please accept the campus data & privacy terms to create an account.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password entries.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    if (selectedRole === 'Student' && !signupStudentId.trim()) {
      setErrorMessage('Student Roll Number or ID is required for verification.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = registerUser({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: selectedRole,
        department: signupDepartment,
        studentId: signupStudentId,
        semester: signupSemester,
        designation: selectedRole === 'Teacher' ? signupDesignation : undefined,
      });

      setIsLoading(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to create account.');
      } else if (result.user) {
        setSuccessMessage(`Account created successfully for ${result.user.name}! Signing you in...`);
        setTimeout(() => {
          onLogin(result.user!.role, result.user);
        }, 700);
      }
    }, 500);
  };

  // Handle Reset Password Submit
  const handleResetSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = resetPassword(resetEmail, resetNewPassword);
    if (result.success) {
      setResetStatus({
        success: true,
        message: 'Password successfully updated! You can now log in with your new password.',
      });
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setResetStatus(null);
        setLoginEmail(resetEmail);
        setLoginPassword(resetNewPassword);
      }, 1500);
    } else {
      setResetStatus({
        success: false,
        message: result.error || 'Could not reset password for this email.',
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#090d16] text-slate-100 flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* GPU-Accelerated Fixed Background: Decoupled from scroll to guarantee smooth scrolling */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Dynamic HTML5 Particle Constellation Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Ambient Soft Glowing Orbs */}
        <div className="absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-indigo-600/12 blur-[100px] transform-gpu pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[100px] transform-gpu pointer-events-none" />

        {/* Geometric Grid Matrix with Radial Vignette */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b14_1px,transparent_1px),linear-gradient(to_bottom,#1e293b14_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_65%,transparent_100%)] pointer-events-none" />
      </div>

      {/* Main Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800/90 bg-[#0d1424]/95 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Hero & Feature Column */}
          <div className="relative flex flex-col justify-between border-b border-slate-800 bg-gradient-to-br from-indigo-950/70 via-[#0e1629] to-[#0c1220] p-8 sm:p-10 lg:col-span-5 lg:border-b-0 lg:border-r">
            <div>
              {/* Brand Logo & Name */}
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-60 blur group-hover:opacity-100 transition duration-300" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/40 bg-slate-900 overflow-hidden shadow-lg shadow-indigo-900/50 transition-transform group-hover:scale-105 p-0.5">
                    <img
                      src="/infinite-cognition-logo.jpg"
                      alt="Infinite Cognition Logo"
                      className="h-full w-full object-cover rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                    INFINITE COGNITION
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  </h1>
                  <p className="text-xs font-semibold tracking-wider text-indigo-400">
                    Student Success &amp; Risk Analytics
                  </p>
                </div>
              </div>

              {/* Tagline & Live Radar Beacon */}
              <div className="mt-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <span>Dual-Risk Early Warning System</span>
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl leading-snug">
                  Empower Academic &amp; Placement Success
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300/90">
                  Unified intelligent portal for higher-education administrators, faculty mentors,
                  and enrolled learners to identify dual-risk flags early and execute interventions.
                </p>
              </div>

              {/* Core Pillars with Interactive Hover Lift */}
              <div className="mt-7 space-y-3">
                <div className="group flex items-start gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3.5 transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-900/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-950/30 cursor-default">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform duration-200">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-indigo-200 transition-colors">
                      Explainable Risk Scoring
                    </h3>
                    <p className="text-xs text-slate-400">
                      Academic, placement, and composite dual-risk indices computed in real time.
                    </p>
                  </div>
                </div>

                <div className="group flex items-start gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3.5 transition-all duration-200 hover:border-violet-500/40 hover:bg-slate-900/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-950/30 cursor-default">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 group-hover:scale-110 transition-transform duration-200">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-violet-200 transition-colors">
                      Cohort Segmentation
                    </h3>
                    <p className="text-xs text-slate-400">
                      Automatic grouping across Scholars, Tech Coders, and Critical Interventions.
                    </p>
                  </div>
                </div>

                <div className="group flex items-start gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3.5 transition-all duration-200 hover:border-emerald-500/40 hover:bg-slate-900/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/30 cursor-default">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform duration-200">
                    <Award size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-emerald-200 transition-colors">
                      Precision Interventions
                    </h3>
                    <p className="text-xs text-slate-400">
                      Track remedial classes, coding bootcamps, and faculty mentorship outcomes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Telemetry Badge */}
              <div className="mt-5 flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-950/30 px-3.5 py-2 text-[11px] text-slate-300 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-emerald-300">AI Risk Engine Online</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-indigo-300/80">
                  <Activity size={12} className="text-indigo-400" />
                  <span>98.4% Precision</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Access Pills */}
            <div className="mt-8 border-t border-slate-800/80 pt-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                1-Click Quick Demo Sign-In:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('Admin')}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
                    selectedRole === 'Admin' && activeTab === 'login'
                      ? 'border-indigo-400 bg-indigo-600/30 text-indigo-200 shadow-md shadow-indigo-900/30'
                      : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <School size={13} />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('Teacher')}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
                    selectedRole === 'Teacher' && activeTab === 'login'
                      ? 'border-indigo-400 bg-indigo-600/30 text-indigo-200 shadow-md shadow-indigo-900/30'
                      : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Briefcase size={13} />
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('Student')}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-150 hover:scale-105 active:scale-95 ${
                    selectedRole === 'Student' && activeTab === 'login'
                      ? 'border-indigo-400 bg-indigo-600/30 text-indigo-200 shadow-md shadow-indigo-900/30'
                      : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <GraduationCap size={13} />
                  Student
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Tabbed Forms */}
          <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-7">
            <div>
              {/* Primary Tabs: Sign In vs Create Account */}
              <div className="flex rounded-2xl bg-slate-950/80 p-1.5 border border-slate-800/80 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition-all duration-150 ${
                    activeTab === 'login'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-950/50 scale-[1.01]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition-all duration-150 ${
                    activeTab === 'signup'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-950/50 scale-[1.01]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Role Selector Cards */}
              <div className="mt-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Select Your Portal Role
                </label>
                <div className="mt-2.5 grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('Admin')}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all duration-150 hover:-translate-y-0.5 active:scale-95 ${
                      selectedRole === 'Admin'
                        ? 'border-indigo-400 bg-indigo-500/15 text-white ring-2 ring-indigo-500/30 shadow-md shadow-indigo-950/40'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/80'
                    }`}
                  >
                    <School
                      size={20}
                      className={selectedRole === 'Admin' ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}
                    />
                    <span className="mt-1.5 text-xs font-bold">Admin</span>
                    <span className="text-[10px] text-slate-500">Administrator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('Teacher')}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all duration-150 hover:-translate-y-0.5 active:scale-95 ${
                      selectedRole === 'Teacher'
                        ? 'border-indigo-400 bg-indigo-500/15 text-white ring-2 ring-indigo-500/30 shadow-md shadow-indigo-950/40'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/80'
                    }`}
                  >
                    <Briefcase
                      size={20}
                      className={selectedRole === 'Teacher' ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}
                    />
                    <span className="mt-1.5 text-xs font-bold">Faculty</span>
                    <span className="text-[10px] text-slate-500">Teacher &amp; Mentor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('Student')}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all duration-150 hover:-translate-y-0.5 active:scale-95 ${
                      selectedRole === 'Student'
                        ? 'border-indigo-400 bg-indigo-500/15 text-white ring-2 ring-indigo-500/30 shadow-md shadow-indigo-950/40'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/80'
                    }`}
                  >
                    <GraduationCap
                      size={20}
                      className={selectedRole === 'Student' ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}
                    />
                    <span className="mt-1.5 text-xs font-bold">Student</span>
                    <span className="text-[10px] text-slate-500">Learner</span>
                  </button>
                </div>
              </div>

              {/* Status Alert Banners */}
              {errorMessage && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 animate-slide-up shadow-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
                  <div className="flex-1">{errorMessage}</div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-rose-400 hover:text-rose-200 text-sm leading-none"
                  >
                    ✕
                  </button>
                </div>
              )}

              {successMessage && (
                <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 animate-slide-up shadow-sm">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form Body: Sign In */}
              {activeTab === 'login' ? (
                <form key="login-form" onSubmit={handleLoginSubmit} className="mt-6 space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-medium text-slate-300">
                      Email Address
                    </label>
                    <div className="relative mt-1.5">
                      <Mail
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        placeholder="name@college.edu"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-150 placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(loginEmail);
                          setIsForgotModalOpen(true);
                        }}
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative mt-1.5">
                      <LockKeyhole
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-3 pl-10 pr-11 text-sm text-white outline-none transition-all duration-150 placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-400">Remember credentials</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Active Portal:{' '}
                      <span className="font-semibold text-indigo-300">{selectedRole}</span>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 transition-all duration-150 hover:shadow-indigo-500/20 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>Sign In to {selectedRole} Portal</span>
                        <ArrowRight size={16} className="ml-1 group-hover:translate-x-1.5 transition-transform duration-150" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-slate-400">
                      Don&apos;t have an institutional account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('signup');
                          setErrorMessage(null);
                        }}
                        className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                      >
                        Create an account
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* Form Body: Create Account */
                <form key="signup-form" onSubmit={handleSignupSubmit} className="mt-6 space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-medium text-slate-300">Full Name</label>
                    <div className="relative mt-1.5">
                      <UserRound
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                        placeholder={
                          selectedRole === 'Teacher'
                            ? 'Prof. Sarah Jenkins'
                            : selectedRole === 'Admin'
                              ? 'Dr. Evelyn Vance'
                              : 'Alex Rivera'
                        }
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-150 placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300">
                      Institutional Email Address
                    </label>
                    <div className="relative mt-1.5">
                      <Mail
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        placeholder="yourname@college.edu"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-150 placeholder:text-slate-600 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
                      />
                    </div>
                  </div>

                  {/* Role-Specific Fields */}
                  {selectedRole === 'Student' && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-300">
                          Student Roll No. / ID
                        </label>
                        <div className="relative mt-1.5">
                          <GraduationCap
                            size={16}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                          />
                          <input
                            type="text"
                            value={signupStudentId}
                            onChange={(e) => setSignupStudentId(e.target.value)}
                            required
                            placeholder="e.g. STU1045"
                            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-all duration-150 placeholder:text-slate-600 focus:border-indigo-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300">
                          Current Semester
                        </label>
                        <select
                          value={signupSemester}
                          onChange={(e) => setSignupSemester(Number(e.target.value))}
                          className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none transition-all duration-150 focus:border-indigo-400"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem}>
                              Semester {sem}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300">
                        Academic Department
                      </label>
                      <div className="relative mt-1.5">
                        <Building
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <select
                          value={signupDepartment}
                          onChange={(e) => setSignupDepartment(e.target.value)}
                          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition-all duration-150 focus:border-indigo-400"
                        >
                          <option value="Computer Science & Engineering">Computer Science (CSE)</option>
                          <option value="Data Science & AI">Data Science &amp; AI</option>
                          <option value="Electronics & Communication">Electronics (ECE)</option>
                          <option value="Information Technology">Information Tech (IT)</option>
                          <option value="Mechanical Engineering">Mechanical Eng</option>
                          <option value="General Studies">General Studies</option>
                        </select>
                      </div>
                    </div>

                    {selectedRole === 'Teacher' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-300">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={signupDesignation}
                          onChange={(e) => setSignupDesignation(e.target.value)}
                          placeholder="Assistant Professor / Mentor"
                          className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-150 placeholder:text-slate-600 focus:border-indigo-400"
                        />
                      </div>
                    )}

                    {selectedRole === 'Admin' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-300">
                          Administrative Scope
                        </label>
                        <select className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-white outline-none transition-all duration-150 focus:border-indigo-400">
                          <option>Campus-Wide Administration</option>
                          <option>Academic Affairs Council</option>
                          <option>Placement &amp; Corporate Relations</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Password & Confirmation */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300">
                        Create Password
                      </label>
                      <div className="relative mt-1.5">
                        <LockKeyhole
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          placeholder="Min 6 chars"
                          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition-all duration-150 placeholder:text-slate-600 focus:border-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showSignupPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300">
                        Confirm Password
                      </label>
                      <div className="relative mt-1.5">
                        <LockKeyhole
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                        <input
                          type={showSignupConfirm ? 'text' : 'password'}
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          required
                          placeholder="Repeat password"
                          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition-all duration-150 placeholder:text-slate-600 focus:border-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupConfirm(!showSignupConfirm)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showSignupConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {signupPassword && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Password strength:</span>
                        <span className="font-semibold text-slate-300">{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${(strength.score / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Terms Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-400 leading-snug">
                        I agree to institutional data governance policy and student privacy
                        protocols (FERPA &amp; Campus Standards).
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 transition-all duration-150 hover:shadow-indigo-500/20 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Sparkles size={18} className="group-hover:rotate-12 transition-transform duration-150" />
                        <span>Create {selectedRole} Account</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-150" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-slate-400">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setErrorMessage(null);
                        }}
                        className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                      >
                        Sign in to existing account
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Footer Note */}
            <div className="mt-8 border-t border-slate-800/80 pt-4 text-center">
              <p className="text-[11px] text-slate-500">
                Protected by 256-bit encryption &amp; institutional role-based access control (RBAC).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0e1628] p-6 shadow-2xl sm:p-8 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <KeyRound size={20} />
                <h3 className="text-base font-bold text-white">Reset Account Password</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setResetStatus(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Enter your registered institutional email address and set your new password.
            </p>

            {resetStatus && (
              <div
                className={`mt-4 rounded-xl border p-3 text-xs animate-slide-up ${
                  resetStatus.success
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}
              >
                {resetStatus.message}
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Registered Email
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="name@college.edu"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-900/40 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
