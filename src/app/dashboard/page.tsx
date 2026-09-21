'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, Target, Layers, ArrowRight, Loader2, PlusCircle, CheckCircle2, Circle, BookOpen, PlayCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [savedKits, setSavedKits] = useState<any[]>([]);
  const [loadingKits, setLoadingKits] = useState(true);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    fetchUser();
    fetchKits();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          if (data.user.email) setUserEmail(data.user.email);
          
          if (data.user.name && data.user.name !== 'Candidate') {
            setUserName(data.user.name.split(' ')[0]);
          } else if (data.user.email) {
            const prefix = data.user.email.split('@')[0];
            const clean = prefix.split('.')[0].replace(/[0-9]/g, '');
            const displayName = clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : prefix;
            setUserName(displayName);
          }
        }
      }
    } catch (e) {}
  };

  const fetchKits = async () => {
    try {
      const res = await fetch('/api/kits');
      if (res.status === 401) { router.push('/login'); return; }
      const data = await res.json();
      if (data.kits) setSavedKits(data.kits);
    } catch (err) {
    } finally {
      setLoadingKits(false);
    }
  };

  const totalQuestions = savedKits.reduce((a, k) => a + (k.kit?.questions?.length || 0), 0);
  const totalScheduleDays = savedKits.reduce((a, k) => a + (k.kit?.schedule?.days?.length || 0), 0);
  const totalCompletedDays = savedKits.reduce((a, k) => {
    const doneCount = k.kit?.user_progress?.completed_days?.length || 0;
    return a + doneCount;
  }, 0);
  const topicsCoveredPct = totalScheduleDays > 0 ? Math.round((totalCompletedDays / totalScheduleDays) * 100) : 0;

  const hasKits = savedKits.length > 0;

  const stats = [
    {
      icon: Folder,
      label: 'Active Prep Kits',
      value: loadingKits ? '—' : savedKits.length.toString(),
      sub: hasKits ? `${savedKits.length} kit${savedKits.length > 1 ? 's' : ''} ready` : 'No kits yet',
      href: '/dashboard/kits',
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      valuColor: 'text-indigo-700',
      border: 'border-slate-200 hover:border-indigo-300',
    },
    {
      icon: Target,
      label: 'Interviews Prepared',
      value: loadingKits ? '—' : savedKits.length.toString(),
      sub: hasKits ? `${totalQuestions} questions generated` : 'Start with a kit',
      href: '/dashboard/kits',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      valuColor: 'text-amber-700',
      border: 'border-slate-200 hover:border-amber-300',
    },
    {
      icon: Layers,
      label: 'Topics Covered',
      value: loadingKits ? '—' : `${topicsCoveredPct}%`,
      sub: hasKits ? (totalCompletedDays > 0 ? `${totalCompletedDays} of ${totalScheduleDays} days done` : 'Start day practice') : 'Generate a kit first',
      href: '/dashboard/kits',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      valuColor: 'text-emerald-700',
      border: 'border-slate-200 hover:border-emerald-300',
    },
  ];

  const hasPracticed = savedKits.some(k => {
    if (k.kit?.user_progress?.completed_days && k.kit.user_progress.completed_days.length > 0) return true;
    try {
      const done = localStorage.getItem(`preppilot_kit_schedule_done_${k._id}`);
      if (done && JSON.parse(done).length > 0) return true;
    } catch {}
    return false;
  });

  const gettingStarted = [
    { label: 'Create your first Prep Kit', done: hasKits, href: '/dashboard/create' },
    { label: 'Review your questions & flashcards', done: hasKits, href: '/dashboard/kits' },
    { label: 'Practice in mock interview mode', done: hasPracticed, href: '/dashboard/kits' },
  ];

  const recentKit = savedKits[0];

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <div className="max-w-[860px] mx-auto px-6 sm:px-8 pt-8 pb-24 space-y-6">

        {/* Welcome */}
        <div>
          <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}{userName ? `, ${userName}` : ''} 👋
          </h1>
          <p className="text-[14px] text-slate-400 font-medium mt-1">
            Prepare smarter. Walk into your next interview with confidence.
          </p>
        </div>

        {/* 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={() => router.push(stat.href)}
              className={`group text-left bg-white border ${stat.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer`}
            >
              <div className={`w-9 h-9 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-[18px] h-[18px] ${stat.iconColor}`} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className={`text-[30px] font-extrabold ${stat.valuColor} leading-none mb-1.5`}>{stat.value}</p>
              <p className="text-[12px] text-slate-400 font-medium">{stat.sub}</p>
              <div className={`mt-3 flex items-center gap-1 text-[12px] font-bold ${stat.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                View <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Quick Actions</p>

          <button
            onClick={() => router.push('/dashboard/create')}
            className="w-full flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-2xl px-6 py-4 transition-all shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/30 group"
          >
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <PlusCircle className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[14px] font-bold">Create New Prep Kit</p>
              <p className="text-[12px] text-indigo-200 font-medium mt-0.5">Turn a job description into a personalized interview plan</p>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-300 ml-auto group-hover:translate-x-1 transition-transform" />
          </button>

          {hasKits && recentKit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => router.push(`/dashboard/kits/${recentKit._id}`)}
                className="flex items-center gap-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-2xl px-5 py-4 transition-all shadow-sm group"
              >
                <div className="w-9 h-9 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                  <PlayCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[13px] font-bold text-slate-900">Continue Practice</p>
                  <p className="text-[11px] text-slate-400 font-medium truncate">{recentKit.kit?.role?.title || recentKit.title}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => router.push('/dashboard/kits')}
                className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl px-5 py-4 transition-all shadow-sm group"
              >
                <div className="w-9 h-9 bg-slate-100 group-hover:bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                  <Folder className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[13px] font-bold text-slate-900">My Prep Kits</p>
                  <p className="text-[11px] text-slate-400 font-medium">{savedKits.length} saved kit{savedKits.length !== 1 ? 's' : ''}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          )}
        </div>

        {/* Getting Started / Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[14px] font-extrabold text-slate-900">
                {hasKits ? 'Your Progress' : 'Getting Started'}
              </p>
              <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                {hasKits ? 'Keep going — you\'re on track!' : 'Complete these steps to get interview-ready'}
              </p>
            </div>
            {hasKits && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                {gettingStarted.filter(s => s.done).length}/{gettingStarted.length} Done
              </span>
            )}
          </div>

          <div className="space-y-3">
            {gettingStarted.map((step, i) => (
              <button
                key={i}
                onClick={() => router.push(step.href)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all text-left group
                  ${step.done
                    ? 'bg-emerald-50/60 border-emerald-100 hover:bg-emerald-50'
                    : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-indigo-200 hover:shadow-sm'
                  }`}
              >
                {step.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 group-hover:text-indigo-400 transition-colors" />
                )}
                <span className={`text-[13px] font-bold flex-1 ${step.done ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {step.label}
                </span>
                {!step.done && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
