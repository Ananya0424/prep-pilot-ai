'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, ChevronDown, Folder, Target, Layers, ArrowRight,
  MoreHorizontal, Star, BookOpen, TrendingUp, CheckCircle2,
  Circle, Loader2, AlertTriangle, Globe, Calendar, Briefcase,
  Upload, Sparkles, Trash2
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [daysAvailable, setDaysAvailable] = useState(7);
  const [generating, setGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [savedKits, setSavedKits] = useState<any[]>([]);
  const [loadingKits, setLoadingKits] = useState(true);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!jobDescription.trim() || !companyUrl.trim()) {
      setError('Please provide both a Job Description and Company Website URL.');
      return;
    }
    setGenerating(true);
    setProgressStep(0);
    const t1 = setTimeout(() => setProgressStep(1), 3500);
    const t2 = setTimeout(() => setProgressStep(2), 7000);
    const t3 = setTimeout(() => setProgressStep(3), 10500);
    const t4 = setTimeout(() => setProgressStep(4), 14000);
    const t5 = setTimeout(() => setProgressStep(5), 17000);
    try {
      const res = await fetch('/api/kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, companyUrl, daysAvailable }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate kit');
      router.push(`/kit/${data.id}`);
    } catch (err: any) {
      setError(err?.message || 'Generation failed. Please try again.');
      setGenerating(false);
    } finally {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5);
    }
  };

  const handleDeleteKit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (!confirm('Delete this prep kit?')) return;
    try {
      const res = await fetch(`/api/kits/${id}`, { method: 'DELETE' });
      if (res.ok) setSavedKits(prev => prev.filter(k => k._id !== id));
    } catch (err) {}
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkStatus('Reading JSON file...');
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (!Array.isArray(payload)) throw new Error('Must be an array');
      setBulkStatus(`Processing ${payload.length} roles...`);
    } catch {
      setBulkStatus('Error: Invalid JSON format');
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const totalQuestions = savedKits.reduce((a, k) => a + (k.kit?.questions?.length || 0), 0);
  const recentKit = savedKits[0];
  const hasKits = savedKits.length > 0;

  const generationSteps = [
    'Analyzing job description',
    'Researching company context',
    'Finding hiring insights',
    'Generating interview questions',
    'Creating flashcards',
    'Building study schedule',
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 pt-7 pb-24">

        {/* ── TOP HEADER ── */}
        <header className="flex items-center justify-between mb-8 pb-5 border-b border-slate-200/70">
          <div>
            <h1 className="text-[18px] font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">Your personalized interview preparation workspace</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-1.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            </button>
            <button className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-[13px] shadow-sm">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-8">

          {/* ── WELCOME + STATS ── */}
          <section className="relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
            {/* Subtle bg glow */}
            <div className="absolute top-0 right-0 w-80 h-full pointer-events-none">
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-70" />
              <div className="absolute top-8 right-16 w-32 h-32 bg-violet-50 rounded-full blur-2xl opacity-60" />
              {/* Sparkle dots */}
              <svg className="absolute top-4 right-8 w-48 h-48 opacity-20" viewBox="0 0 200 200">
                <circle cx="40" cy="40" r="2" fill="#6366f1"/>
                <circle cx="120" cy="20" r="1.5" fill="#8b5cf6"/>
                <circle cx="80" cy="80" r="3" fill="#6366f1"/>
                <circle cx="160" cy="60" r="2" fill="#a78bfa"/>
                <circle cx="30" cy="120" r="1.5" fill="#6366f1"/>
                <circle cx="140" cy="100" r="2.5" fill="#8b5cf6"/>
                <circle cx="100" cy="150" r="2" fill="#6366f1"/>
                <circle cx="170" cy="140" r="1.5" fill="#a78bfa"/>
              </svg>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-7">
              <div>
                <h2 className="text-[20px] font-bold text-slate-900 tracking-tight mb-1">
                  {getGreeting()}{userName ? `, ${userName}` : ''} 👋
                </h2>
                <p className="text-[14px] text-slate-500 font-medium">
                  Prepare smarter. Walk into your next interview with confidence.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 flex-shrink-0">
                {[
                  { icon: Folder, label: 'Active Prep Kits', value: savedKits.length.toString(), color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { icon: Target, label: 'Interviews Prepared', value: savedKits.length.toString(), color: 'text-violet-600', bg: 'bg-violet-50' },
                  { icon: Layers, label: 'Topics Covered', value: hasKits ? '68%' : '0%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 min-w-[120px]">
                    <div className={`inline-flex items-center gap-1.5 ${stat.color} mb-1.5`}>
                      <stat.icon className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
                    </div>
                    <div className="text-[22px] font-extrabold text-slate-900 leading-none">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CREATE NEW PREP KIT ── */}
          <section>
            <div className="mb-4">
              <h3 className="text-[15px] font-bold text-slate-900">Create a new Prep Kit</h3>
              <p className="text-[13px] text-slate-500 mt-0.5">Turn a job description into a personalized interview preparation plan.</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl relative overflow-hidden shadow-[0_0_0_1px_rgba(99,102,241,0.06),0_4px_24px_-4px_rgba(99,102,241,0.08)] hover:shadow-[0_0_0_1px_rgba(99,102,241,0.15),0_8px_32px_-4px_rgba(99,102,241,0.12)] transition-shadow duration-300">
              {/* Edge glow */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-inset ring-indigo-500/[0.07]" />

              <div className="p-6 sm:p-8">
                {error && (
                  <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700 font-medium">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {generating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="py-8 max-w-sm mx-auto"
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-slate-900">Building your Prep Kit...</p>
                          <p className="text-[12px] text-slate-400 font-medium mt-0.5">Usually takes 15–20 seconds</p>
                        </div>
                      </div>
                      <div className="space-y-3.5">
                        {generationSteps.map((step, i) => {
                          const done = progressStep > i;
                          const active = progressStep === i;
                          return (
                            <div key={i} className="flex items-center gap-3">
                              {done ? (
                                <CheckCircle2 className="w-[18px] h-[18px] text-indigo-500 flex-shrink-0" />
                              ) : active ? (
                                <div className="w-[18px] h-[18px] flex-shrink-0 relative flex items-center justify-center">
                                  <Circle className="w-[18px] h-[18px] text-indigo-200" />
                                  <span className="absolute w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                </div>
                              ) : (
                                <Circle className="w-[18px] h-[18px] text-slate-200 flex-shrink-0" />
                              )}
                              <span className={`text-[13px] font-medium ${done ? 'text-slate-600' : active ? 'text-indigo-700 font-semibold' : 'text-slate-400'}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onSubmit={handleGenerate}
                      className="space-y-5"
                    >
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                          Job Description
                        </label>
                        <textarea
                          required rows={5}
                          value={jobDescription}
                          onChange={e => setJobDescription(e.target.value)}
                          placeholder="Paste the full job description here..."
                          className="w-full px-4 py-3 bg-[#F8F9FF] border border-slate-200 rounded-xl text-[14px] text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                            Company Website URL
                          </label>
                          <input
                            type="url" required
                            value={companyUrl}
                            onChange={e => setCompanyUrl(e.target.value)}
                            placeholder="https://company.com"
                            className="w-full px-4 py-3 bg-[#F8F9FF] border border-slate-200 rounded-xl text-[14px] text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                            Days Until Interview
                          </label>
                          <div className="relative">
                            <input
                              type="number" min={1} max={60} required
                              value={daysAvailable}
                              onChange={e => setDaysAvailable(Number(e.target.value))}
                              className="w-full pl-4 pr-14 py-3 bg-[#F8F9FF] border border-slate-200 rounded-xl text-[14px] text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-slate-400 font-semibold pointer-events-none">days</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-4">
                        <button
                          type="submit"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-[14px] font-semibold rounded-xl transition-all shadow-sm shadow-indigo-600/25 hover:shadow-md hover:shadow-indigo-600/30"
                        >
                          <Sparkles className="w-4 h-4" />
                          Generate Prep Kit
                        </button>
                        <p className="text-[12px] text-slate-400 font-medium max-w-xs leading-relaxed">
                          AI will research the company, analyze requirements, generate questions and create your schedule.
                        </p>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Bulk Upload */}
                {!generating && (
                  <div className="mt-7 pt-6 border-t border-slate-100">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                      <Upload className="w-3 h-3" /> Bulk Upload (Multiple Roles)
                    </p>
                    <input
                      type="file" accept=".json"
                      onChange={handleBulkUpload}
                      className="text-[12px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[12px] file:font-semibold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer transition-colors"
                    />
                    {bulkStatus && <p className="mt-2 text-[12px] text-indigo-600 font-semibold">{bulkStatus}</p>}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── KITS / EMPTY STATE ── */}
          {loadingKits ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : !hasKits ? (
            /* Empty State */
            <section className="bg-white border border-dashed border-slate-300 rounded-2xl p-14 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Folder className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-[17px] font-bold text-slate-900 mb-2">Ready to prepare for your next interview?</h3>
              <p className="text-[13px] text-slate-500 font-medium max-w-sm mb-7 leading-relaxed">
                Paste a job description above and let PrepPilot build your personalized preparation kit.
              </p>
              <button
                onClick={() => router.push('/dashboard/create')}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold rounded-xl transition-all shadow-sm shadow-indigo-600/20"
              >
                <Sparkles className="w-4 h-4" />
                Create Your First Kit
              </button>
            </section>
          ) : (
            /* Kits + Sidebar Panel */
            <div className="flex flex-col xl:flex-row gap-7">

              {/* ── MY PREP KITS ── */}
              <div className="xl:flex-1 space-y-5" id="kits">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold text-slate-900">Your Prep Kits</h3>
                  <button className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {savedKits.map((item, i) => {
                    const initial = (item.company || 'C').charAt(0).toUpperCase();
                    const questions = item.kit?.questions?.length || 0;
                    const days = item.kit?.schedule?.days_available || 5;
                    const sections = item.kit?.schedule?.days?.length || 5;

                    return (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => router.push(`/kit/${item._id}`)}
                        className="group bg-white border border-slate-200 rounded-[16px] p-4.5 cursor-pointer hover:border-indigo-200 hover:shadow-[0_4px_20px_-4px_rgba(99,102,241,0.12)] transition-all flex flex-col justify-between"
                      >
                        {/* Card Top */}
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-[14px] font-bold flex-shrink-0">
                                {initial}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-1">
                                  {item.kit?.role?.title || item.title}
                                </h4>
                                <p className="text-[11px] font-semibold text-slate-400 truncate">{item.company || 'Company'}</p>
                              </div>
                            </div>

                            {/* Three-dot menu */}
                            <div className="relative" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
                                className="p-1 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              {openMenuId === item._id && (
                                <div className="absolute right-0 top-7 z-20 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 text-[13px]">
                                  <button
                                    onClick={(e) => handleDeleteKit(item._id, e)}
                                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Kit
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Metadata chips */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {[`${days} days`, `${sections} sections`, `${questions} questions`].map(tag => (
                              <span key={tag} className="text-[10px] font-semibold bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Progress */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-400">Preparation progress</span>
                              <span className="text-indigo-600">0%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full w-0 bg-indigo-500 rounded-full" />
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom */}
                        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Ready</span>
                          <span className="text-[12px] font-semibold text-slate-400 group-hover:text-indigo-600 flex items-center gap-1 transition-colors">
                            Open Kit <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* ── RIGHT PANEL: Continue + Insights ── */}
              <div className="xl:w-[280px] flex flex-col gap-6 flex-shrink-0">

                {/* Continue Preparing */}
                {recentKit && (
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-3">Continue Preparing</h3>
                    <div className="bg-white border border-slate-200 rounded-[16px] p-5 shadow-sm">
                      <p className="text-[14px] font-bold text-slate-900 line-clamp-1">
                        {recentKit.kit?.role?.title || recentKit.title}
                      </p>
                      <p className="text-[12px] text-slate-400 font-semibold mt-0.5 mb-4">{recentKit.company || 'Company'}</p>

                      <div className="mb-4 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-slate-400">Last practiced 20 min ago</span>
                          <span className="text-indigo-600">72%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full w-[72%] bg-indigo-500 rounded-full" />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/practice/${recentKit._id}`)}
                          className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[12px] font-bold rounded-xl transition-colors"
                        >
                          Continue →
                        </button>
                        <button
                          onClick={() => router.push(`/kit/${recentKit._id}`)}
                          className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[12px] font-bold rounded-xl border border-slate-200 transition-colors"
                        >
                          View Kit
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preparation Insights */}
                <div>
                  <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-3">Your Preparation</h3>
                  <div className="bg-white border border-slate-200 rounded-[16px] p-5 shadow-sm divide-y divide-slate-100">
                    {[
                      { icon: TrendingUp, bg: 'bg-red-50', color: 'text-red-500', label: 'Weakest Area', value: 'System Design' },
                      { icon: Star, bg: 'bg-emerald-50', color: 'text-emerald-500', label: 'Strongest Area', value: 'JavaScript' },
                      { icon: BookOpen, bg: 'bg-indigo-50', color: 'text-indigo-500', label: 'Questions Covered', value: `18 / ${Math.max(totalQuestions, 24)}` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                          </div>
                          <span className="text-[12px] font-semibold text-slate-600">{item.label}</span>
                        </div>
                        <span className="text-[12px] font-bold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
