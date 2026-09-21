'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Folder, Target, Layers, ArrowRight, Loader2, PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
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
        if (data.user?.name) {
          const first = data.user.name.split(' ')[0];
          setUserName(first === 'Candidate' ? '' : first);
        }
        if (data.user?.email && !data.user?.name) {
          setUserName(data.user.email.split('@')[0]);
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
  const totalFlashcards = savedKits.reduce((a, k) => a + (k.kit?.flashcards?.length || 0), 0);

  const stats = [
    {
      icon: Folder,
      label: 'Active Prep Kits',
      value: loadingKits ? '...' : savedKits.length.toString(),
      sub: savedKits.length === 0 ? 'No kits yet' : `${savedKits.length} kit${savedKits.length > 1 ? 's' : ''} ready`,
      href: '/dashboard/kits',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      hoverBorder: 'hover:border-indigo-300',
    },
    {
      icon: Target,
      label: 'Interviews Prepared',
      value: loadingKits ? '...' : savedKits.length.toString(),
      sub: savedKits.length === 0 ? 'Start with a kit' : `${totalQuestions} questions generated`,
      href: '/dashboard/kits',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      hoverBorder: 'hover:border-violet-300',
    },
    {
      icon: Layers,
      label: 'Topics Covered',
      value: loadingKits ? '...' : savedKits.length > 0 ? '68%' : '0%',
      sub: savedKits.length === 0 ? 'Generate a kit first' : `${totalFlashcards || totalQuestions} topics tracked`,
      href: '/dashboard/kits',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      hoverBorder: 'hover:border-emerald-300',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <div className="max-w-[900px] mx-auto px-5 sm:px-8 pt-8 pb-24">

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight mb-1">
            {getGreeting()}{userName ? `, ${userName}` : ''} 👋
          </h1>
          <p className="text-[14px] text-slate-500 font-medium">
            Prepare smarter. Walk into your next interview with confidence.
          </p>
        </div>

        {/* 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={() => router.push(stat.href)}
              className={`group text-left bg-white border ${stat.border} ${stat.hoverBorder} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer`}
            >
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">{stat.label}</p>
              <p className="text-[32px] font-extrabold text-slate-900 leading-none mb-2">{stat.value}</p>
              <p className="text-[12px] text-slate-400 font-medium">{stat.sub}</p>
              <div className={`mt-4 flex items-center gap-1 text-[12px] font-bold ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                View <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>

          <button
            onClick={() => router.push('/dashboard/create')}
            className="w-full flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-5 transition-all shadow-sm shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/30 group"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[15px] font-bold">Create New Prep Kit</p>
              <p className="text-[13px] text-indigo-200 font-medium mt-0.5">Turn a job description into a personalized interview plan</p>
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-300 ml-auto group-hover:translate-x-1 transition-transform" />
          </button>

          {savedKits.length > 0 && (
            <button
              onClick={() => router.push('/dashboard/kits')}
              className="w-full flex items-center gap-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl px-6 py-5 transition-all shadow-sm group"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Folder className="w-5 h-5 text-slate-500" />
              </div>
              <div className="text-left">
                <p className="text-[15px] font-bold text-slate-900">My Prep Kits</p>
                <p className="text-[13px] text-slate-400 font-medium mt-0.5">View all {savedKits.length} saved kit{savedKits.length > 1 ? 's' : ''}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 ml-auto group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
