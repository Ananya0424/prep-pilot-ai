'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Globe, Target, MessageSquare, CheckCircle2, Mail, Lock, Sparkles, Search, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#fafafa] flex flex-col justify-center">
      
      {/* Background Decor & Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.35]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-50/40 rounded-full blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-[100px] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] mix-blend-overlay pointer-events-none"></div>

      {/* Tiny decorative floating dots (background) */}
      <div className="absolute top-[20%] right-[15%] w-2 h-2 bg-brand-300 rounded-full blur-[1px] opacity-50 animate-[float_4s_ease-in-out_infinite]" />
      <div className="absolute bottom-[25%] left-[45%] w-3 h-3 bg-purple-300 rounded-full blur-[1.5px] opacity-40 animate-[float_5s_ease-in-out_infinite_1s]" />
      <div className="absolute top-[35%] left-[10%] w-1.5 h-1.5 bg-blue-300 rounded-full blur-[0.5px] opacity-60 animate-[float_3s_ease-in-out_infinite_2s]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[70vh]">
          
          {/* Left Side: Auth Form */}
          <div className="flex flex-col justify-center max-w-[420px] w-full mx-auto lg:mx-0 lg:pr-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 text-[10px] font-bold tracking-[0.2em] text-brand-600 uppercase">
                <Sparkles className="w-3.5 h-3.5" /> AI-Powered Interview Preparation
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                Welcome to PrepPilot
              </h1>
              <p className="text-base text-slate-500 font-medium leading-relaxed">
                Sign in to build your personalized interview prep kits.
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm transition-all font-medium shadow-sm hover:border-slate-300"
                    placeholder="candidate@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm transition-all font-medium shadow-sm hover:border-slate-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-[0_8px_20px_-8px_rgba(15,23,42,0.6)] hover:shadow-[0_12px_25px_-8px_rgba(15,23,42,0.7)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 text-sm relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </span>
              </button>
            </form>

            <p className="text-sm text-slate-500 mt-6 font-medium text-center lg:text-left">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-brand-600 hover:text-brand-700 font-bold hover:underline transition-colors">
                Register here
              </Link>
            </p>
          </div>

          {/* Right Side: Premium Workflow Visualization */}
          <div className="relative w-full h-[600px] flex items-center justify-center lg:justify-end hidden md:flex">
            
            {/* Soft background glow strictly behind cards */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-200/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute right-32 bottom-20 w-[300px] h-[300px] bg-purple-200/20 rounded-full blur-[70px] pointer-events-none" />

            <div className="relative w-full max-w-[480px] h-full perspective-[1200px]">
              
              {/* Connector SVG Background */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 500 600">
                <path 
                  d="M 130 110 C 130 170, 350 150, 350 220 C 350 290, 130 270, 130 340 C 130 410, 350 390, 350 460 C 350 530, 250 510, 250 560" 
                  fill="none" 
                  stroke="#cbd5e1" 
                  strokeWidth="2" 
                  strokeDasharray="6,6"
                  className="animate-[dash_25s_linear_infinite] opacity-60"
                />
                <circle cx="130" cy="110" r="3.5" fill="#cbd5e1" className="opacity-80" />
                <circle cx="350" cy="220" r="3.5" fill="#cbd5e1" className="opacity-80" />
                <circle cx="130" cy="340" r="3.5" fill="#cbd5e1" className="opacity-80" />
                <circle cx="350" cy="460" r="3.5" fill="#cbd5e1" className="opacity-80" />
              </svg>

              {/* CARD 1: Job Description */}
              <div className="absolute top-[40px] left-[0px] sm:left-[20px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.25rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] w-[240px] z-10 animate-[float_6s_ease-in-out_infinite] hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-600 group-hover:bg-slate-200 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Job Description</span>
                </div>
                <div className="text-[13px] font-bold text-slate-900 bg-slate-50/80 rounded-lg p-2.5 border border-slate-100/80">
                  Senior Software Engineer
                </div>
                <div className="mt-2 text-[10px] text-slate-400 font-semibold px-1 flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-green-400 rounded-full" />
                  Role requirements extracted
                </div>
              </div>

              {/* CARD 2: Company Research */}
              <div className="absolute top-[140px] right-[0px] sm:right-[10px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.25rem] p-4 shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:shadow-[0_25px_50px_rgb(0,0,0,0.12)] w-[250px] z-20 animate-[float_7s_ease-in-out_infinite_1s] hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Company Research</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[12px] font-semibold text-slate-700 bg-slate-50/80 rounded-lg p-2.5 border border-slate-100/80 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> Company overview
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700 bg-slate-50/80 rounded-lg p-2.5 border border-slate-100/80 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full" /> Hiring process
                  </div>
                  <div className="text-[12px] font-semibold text-slate-700 bg-slate-50/80 rounded-lg p-2.5 border border-slate-100/80 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Recent updates
                  </div>
                </div>
              </div>

              {/* CARD 3: Key Requirements */}
              <div className="absolute top-[280px] left-[0px] sm:left-[10px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.25rem] p-4 shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:shadow-[0_25px_50px_rgb(0,0,0,0.12)] w-[270px] z-30 animate-[float_6.5s_ease-in-out_infinite_2s] hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-100 transition-colors">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Key Requirements</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-lg text-[11px] font-bold text-slate-700">React</span>
                  <span className="px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-lg text-[11px] font-bold text-slate-700">Node.js</span>
                  <span className="px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-lg text-[11px] font-bold text-slate-700">System Design</span>
                  <span className="px-3 py-1.5 bg-brand-50 border border-brand-200/60 rounded-lg text-[11px] font-bold text-brand-700">AI/ML</span>
                </div>
              </div>

              {/* CARD 4: Interview Questions */}
              <div className="absolute top-[400px] right-[0px] sm:right-[20px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.25rem] p-4 shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:shadow-[0_25px_50px_rgb(0,0,0,0.12)] w-[260px] z-40 animate-[float_7.5s_ease-in-out_infinite_0.5s] hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Interview Questions</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[12px] font-semibold text-slate-700 bg-slate-50/80 rounded-lg p-2.5 border border-slate-100/80">Technical</div>
                  <div className="text-[12px] font-semibold text-slate-700 bg-slate-50/80 rounded-lg p-2.5 border border-slate-100/80">Behavioural</div>
                  <div className="text-[12px] font-semibold text-slate-700 bg-slate-50/80 rounded-lg p-2.5 border border-slate-100/80">System Design</div>
                </div>
              </div>

              {/* CARD 5: Prep Kit */}
              <div className="absolute bottom-[0px] left-[50%] -translate-x-[50%] bg-white/98 backdrop-blur-2xl border border-brand-200/80 rounded-[1.25rem] p-5 shadow-[0_20px_50px_rgb(79,70,229,0.15)] hover:shadow-[0_30px_60px_rgb(79,70,229,0.2)] w-[290px] z-50 animate-[float_6s_ease-in-out_infinite_1.5s] hover:-translate-y-1.5 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold uppercase tracking-widest text-brand-900">Prep Kit Ready</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/80">
                    <div className="text-lg font-black text-brand-600">18</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">Questions</div>
                  </div>
                  <div className="text-center bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/80">
                    <div className="text-lg font-black text-brand-600">12</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">Flashcards</div>
                  </div>
                  <div className="text-center bg-slate-50/80 rounded-xl p-2.5 border border-slate-100/80">
                    <div className="text-lg font-black text-brand-600">5</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">Day Plan</div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Subtle Taglines & Features */}
              <div className="absolute -bottom-10 w-full flex flex-col items-center justify-center opacity-70">
                <p className="text-[11px] font-bold text-slate-400 tracking-wide mb-3">From job description to interview-ready.</p>
                <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Search className="w-3 h-3" /> Research</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Practise</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Prepare</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
