'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Globe, Calendar, Upload, Loader2, ArrowRight, Trash2, Clock, Briefcase, PlusCircle, Search, Bell, ChevronDown, CheckCircle2, Circle, MoreHorizontal, Activity, Star, BookOpen, Target, Sparkles, TrendingUp, Layers, Folder } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Ananya');
  const [jobDescription, setJobDescription] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [daysAvailable, setDaysAvailable] = useState(7);
  const [generating, setGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [error, setError] = useState<string>('');
  
  const [savedKits, setSavedKits] = useState<any[]>([]);
  const [loadingKits, setLoadingKits] = useState(true);

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
          setUserName(data.user.name.split(' ')[0]);
        }
      }
    } catch (e) {}
  };

  const fetchKits = async () => {
    try {
      const res = await fetch('/api/kits');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.kits) {
        setSavedKits(data.kits);
      }
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

    const timer1 = setTimeout(() => setProgressStep(1), 3000); 
    const timer2 = setTimeout(() => setProgressStep(2), 6000); 
    const timer3 = setTimeout(() => setProgressStep(3), 9000); 
    const timer4 = setTimeout(() => setProgressStep(4), 12000); 
    const timer5 = setTimeout(() => setProgressStep(5), 15000); 

    try {
      const res = await fetch('/api/kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          companyUrl,
          daysAvailable,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate kit');
      }

      router.push(`/kit/${data.id}`);
    } catch (err: any) {
      setError(err?.message || 'Generation failed. Please check your inputs and try again.');
      setGenerating(false);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    }
  };

  const handleDeleteKit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this prep kit?')) return;
    
    try {
      const res = await fetch(`/api/kits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedKits(prev => prev.filter(k => k._id !== id));
      }
    } catch (err) {}
  };

  // Stats calculation
  const totalQuestions = savedKits.reduce((acc, kit) => acc + (kit.kit?.questions?.length || 0), 0);
  const recentKit = savedKits[0];

  const generationSteps = [
    'Analyzing job description',
    'Researching company context',
    'Finding hiring insights',
    'Generating interview questions',
    'Creating flashcards',
    'Building study schedule'
  ];

  return (
    <div className="max-w-[1300px] mx-auto pb-20 px-4 sm:px-6 lg:px-8 pt-8">
      
      {/* Top Header */}
      <header className="flex items-center justify-between mb-8 pb-6 border-b border-indigo-100/50">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight mb-1">Dashboard</h1>
          <p className="text-[13px] text-slate-500 font-medium">Your personalized interview preparation workspace</p>
        </div>
        <div className="flex items-center gap-5">
          <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#F8F9FF]"></span>
          </button>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:shadow-md transition-all">
              {userName.charAt(0).toUpperCase()}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-10">
        
        {/* Welcome Section */}
        <section className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between bg-white rounded-2xl p-8 border border-indigo-50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-2">
            <h2 className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight">
              Good morning, {userName} <span className="inline-block">👋</span>
            </h2>
            <p className="text-slate-500 font-medium text-sm lg:text-base max-w-xl">
              Prepare smarter. Walk into your next interview with confidence.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-4 lg:gap-6 mt-4 lg:mt-0">
            <div className="bg-slate-50 rounded-xl px-5 py-4 border border-slate-100 min-w-[130px]">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Folder className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Kits</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{savedKits.length}</div>
            </div>
            
            <div className="bg-slate-50 rounded-xl px-5 py-4 border border-slate-100 min-w-[130px]">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Interviews</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{savedKits.length}</div>
            </div>

            <div className="bg-slate-50 rounded-xl px-5 py-4 border border-slate-100 min-w-[130px]">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Layers className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Topics</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{savedKits.length > 0 ? '68%' : '0%'}</div>
            </div>
          </div>
        </section>

        {/* Create New Kit */}
        <section id="create">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create a new Prep Kit</h3>
            <p className="text-sm text-slate-500 font-medium">Turn a job description into a personalized interview preparation plan.</p>
          </div>
          
          <div className="bg-white rounded-[20px] p-6 sm:p-8 shadow-sm border border-indigo-100 relative group transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 rounded-[20px] ring-1 ring-inset ring-indigo-500/10 pointer-events-none group-hover:ring-indigo-500/20 transition-all duration-500"></div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm flex items-start space-x-3 text-red-700 font-medium">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {generating ? (
              <div className="py-10 max-w-md mx-auto">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Building your Prep Kit...</h3>
                  </div>
                </div>

                <div className="space-y-4 ml-2">
                  {generationSteps.map((step, index) => {
                    const isCompleted = progressStep > index;
                    const isCurrent = progressStep === index;
                    
                    return (
                      <div key={index} className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                        ) : isCurrent ? (
                          <div className="relative flex items-center justify-center w-5 h-5">
                             <Circle className="w-5 h-5 text-indigo-200" />
                             <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse absolute" />
                          </div>
                        ) : (
                          <Circle className="w-5 h-5 text-slate-200" />
                        )}
                        <span className={`text-[14px] font-medium ${isCompleted ? 'text-slate-700' : isCurrent ? 'text-indigo-700 font-semibold' : 'text-slate-400'}`}>
                          {step}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Job Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full px-4 py-3 bg-[#F8F9FF] border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-[14px] font-medium focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Company Website
                    </label>
                    <input
                      type="url"
                      required
                      value={companyUrl}
                      onChange={(e) => setCompanyUrl(e.target.value)}
                      placeholder="https://company.com"
                      className="w-full px-4 py-3 bg-[#F8F9FF] border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-[14px] font-medium focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Days Until Interview
                    </label>
                    <div className="relative">
                       <input
                        type="number"
                        min={1}
                        max={60}
                        required
                        value={daysAvailable}
                        onChange={(e) => setDaysAvailable(Number(e.target.value))}
                        className="w-full pl-4 pr-16 py-3 bg-[#F8F9FF] border border-slate-200 rounded-xl text-slate-900 text-[14px] font-medium focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-slate-400 font-medium pointer-events-none">days</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-xl transition-all duration-300 text-[14px] shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Generate Prep Kit ✨</span>
                  </button>
                  <p className="text-[12px] text-slate-500 font-medium max-w-sm">
                    AI will research the company, analyze requirements, generate interview questions and create your preparation schedule.
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>

        {loadingKits ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
        ) : savedKits.length === 0 ? (
          <section className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <Folder className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Ready to prepare for your next interview?</h3>
            <p className="text-sm text-slate-500 font-medium max-w-sm mb-6">
              Paste a job description above and let PrepPilot build your personalized preparation kit.
            </p>
          </section>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left: Saved Kits */}
            <div className="lg:w-2/3 space-y-6" id="kits">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-slate-900">Your Prep Kits</h3>
                <button className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {savedKits.map((item) => {
                  const companyInitial = item.company ? item.company.charAt(0).toUpperCase() : 'C';
                  
                  return (
                    <motion.div
                      key={item._id}
                      onClick={() => router.push(`/kit/${item._id}`)}
                      className="bg-white border border-slate-200 p-5 rounded-2xl cursor-pointer hover:shadow-sm hover:border-indigo-200 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#F8F9FF] border border-indigo-50 flex items-center justify-center text-indigo-700 font-bold">
                              {companyInitial}
                            </div>
                            <div>
                              <h4 className="text-[14px] font-bold text-slate-900 line-clamp-1">{item.kit?.role?.title || item.title}</h4>
                              <p className="text-[12px] font-semibold text-slate-500">{item.company || 'Company'}</p>
                            </div>
                          </div>
                          <button onClick={(e) => handleDeleteKit(item._id, e)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex gap-2 mb-5">
                          <span className="text-[11px] font-semibold bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                            {item.kit?.schedule?.days_available || 5} days
                          </span>
                          <span className="text-[11px] font-semibold bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                            5 sections
                          </span>
                          <span className="text-[11px] font-semibold bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                            {item.kit?.questions?.length || 0} questions
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[11px] font-bold">
                            <span className="text-slate-500">Preparation progress</span>
                            <span className="text-indigo-600">72%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full w-[72%] rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Ready</span>
                        <div className="text-[12px] font-bold text-slate-500 group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                          Open Kit <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Right: Recent & Insights */}
            <div className="lg:w-1/3 space-y-8">
              
              {/* Continue Preparing */}
              {recentKit && (
                <section>
                  <h3 className="text-[16px] font-bold text-slate-900 mb-6">Continue Preparing</h3>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <p className="text-[14px] font-bold text-slate-900 line-clamp-1">{recentKit.kit?.role?.title || recentKit.title}</p>
                    <p className="text-[12px] text-slate-500 font-semibold mb-4">{recentKit.company}</p>
                    
                    <div className="space-y-1.5 mb-5">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                         <span className="text-slate-500">Last practiced 20 minutes ago</span>
                         <span className="text-indigo-600">72%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[72%] rounded-full"></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push(`/practice/${recentKit._id}`)}
                        className="flex-1 py-2 bg-indigo-50 text-indigo-700 text-[12px] font-bold rounded-xl hover:bg-indigo-100 transition-colors"
                      >
                        Continue Practice →
                      </button>
                      <button 
                        onClick={() => router.push(`/kit/${recentKit._id}`)}
                        className="flex-1 py-2 bg-white text-slate-700 text-[12px] font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        View Kit
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* Insights */}
              <section>
                <h3 className="text-[16px] font-bold text-slate-900 mb-6">Your Preparation</h3>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-red-50 text-red-500 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
                      <span className="text-[13px] font-semibold text-slate-600">Weakest Area</span>
                    </div>
                    <span className="text-[13px] font-bold text-slate-900">System Design</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg"><Star className="w-4 h-4" /></div>
                      <span className="text-[13px] font-semibold text-slate-600">Strongest Area</span>
                    </div>
                    <span className="text-[13px] font-bold text-slate-900">JavaScript</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg"><BookOpen className="w-4 h-4" /></div>
                      <span className="text-[13px] font-semibold text-slate-600">Questions Covered</span>
                    </div>
                    <span className="text-[13px] font-bold text-slate-900">18 / {totalQuestions > 24 ? totalQuestions : 24}</span>
                  </div>
                </div>
              </section>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
