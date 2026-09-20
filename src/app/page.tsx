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
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 flex flex-col justify-center">
      
      {/* Richer Background Decor to prevent "plain" look */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Large ambient colored blobs */}
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-blue-200/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob" style={{ animationDelay: '4s' }} />
        
        {/* Very subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.25] mix-blend-overlay"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 flex items-center justify-center h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center w-full">
          
          {/* Left Side: Auth Form */}
          <div className="flex flex-col justify-center max-w-[400px] w-full mx-auto lg:mx-0 lg:pr-4">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 text-[10px] font-bold tracking-[0.2em] text-brand-600 uppercase">
                <Sparkles className="w-3 h-3" /> AI-Powered Prep
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                Welcome Back
              </h1>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Sign in to build your personalized interview prep kits.
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm transition-all font-medium shadow-sm hover:border-slate-300"
                    placeholder="candidate@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm transition-all font-medium shadow-sm hover:border-slate-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-[0_8px_20px_-8px_rgba(15,23,42,0.6)] hover:shadow-[0_12px_25px_-8px_rgba(15,23,42,0.7)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 text-sm relative overflow-hidden group"
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

            <p className="text-[13px] text-slate-500 mt-5 font-medium text-center lg:text-left">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-brand-600 hover:text-brand-700 font-bold hover:underline transition-colors">
                Register here
              </Link>
            </p>
          </div>

          {/* Right Side: Premium Workflow Visualization - Scaled to fit viewport */}
          <div className="relative w-full h-[500px] flex items-center justify-center lg:justify-end hidden md:flex scale-[0.85] xl:scale-95 origin-right">
            
            <div className="relative w-full max-w-[480px] h-full perspective-[1200px]">
              
              {/* Connector SVG Background */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 500 500">
                <path 
                  d="M 130 90 C 130 140, 350 130, 350 190 C 350 250, 130 240, 130 300 C 130 360, 350 350, 350 410 C 350 460, 250 450, 250 490" 
                  fill="none" 
                  stroke="#cbd5e1" 
                  strokeWidth="2" 
                  strokeDasharray="6,6"
                  className="animate-[dash_25s_linear_infinite] opacity-80"
                />
                <circle cx="130" cy="90" r="3.5" fill="#cbd5e1" />
                <circle cx="350" cy="190" r="3.5" fill="#cbd5e1" />
                <circle cx="130" cy="300" r="3.5" fill="#cbd5e1" />
                <circle cx="350" cy="410" r="3.5" fill="#cbd5e1" />
              </svg>

              {/* CARD 1: Job Description */}
              <div className="absolute top-[20px] left-[0px] sm:left-[20px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.25rem] p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] w-[240px] z-10 animate-[float_6s_ease-in-out_infinite] hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-slate-200 transition-colors">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Job Description</span>
                </div>
                <div className="text-xs font-bold text-slate-900 bg-slate-50/80 rounded-lg p-2 border border-slate-100/80">
                  Senior Software Engineer
                </div>
                <div className="mt-1.5 text-[9px] text-slate-400 font-semibold px-1 flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-green-400 rounded-full" />
                  Role requirements extracted
                </div>
              </div>

              {/* CARD 2: Company Research */}
              <div className="absolute top-[110px] right-[0px] sm:right-[10px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.25rem] p-3.5 shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:shadow-[0_25px_50px_rgb(0,0,0,0.12)] w-[240px] z-20 animate-[float_7s_ease-in-out_infinite_1s] hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Company Research</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-700 bg-slate-50/80 rounded-md p-2 border border-slate-100/80 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> Company overview
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 bg-slate-50/80 rounded-md p-2 border border-slate-100/80 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full" /> Hiring process
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 bg-slate-50/80 rounded-md p-2 border border-slate-100/80 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Recent updates
                  </div>
                </div>
              </div>

              {/* CARD 3: Key Requirements */}
              <div className="absolute top-[240px] left-[0px] sm:left-[10px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.25rem] p-3.5 shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:shadow-[0_25px_50px_rgb(0,0,0,0.12)] w-[250px] z-30 animate-[float_6.5s_ease-in-out_infinite_2s] hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-100 transition-colors">
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Key Requirements</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/60 rounded-md text-[10px] font-bold text-slate-700">React</span>
                  <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/60 rounded-md text-[10px] font-bold text-slate-700">Node.js</span>
                  <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/60 rounded-md text-[10px] font-bold text-slate-700">System Design</span>
                  <span className="px-2.5 py-1 bg-brand-50 border border-brand-200/60 rounded-md text-[10px] font-bold text-brand-700">AI/ML</span>
                </div>
              </div>

              {/* CARD 4: Interview Questions */}
              <div className="absolute top-[340px] right-[0px] sm:right-[20px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[1.25rem] p-3.5 shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:shadow-[0_25px_50px_rgb(0,0,0,0.12)] w-[240px] z-40 animate-[float_7.5s_ease-in-out_infinite_0.5s] hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Interview Questions</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-700 bg-slate-50/80 rounded-md p-2 border border-slate-100/80">Technical</div>
                  <div className="text-[11px] font-semibold text-slate-700 bg-slate-50/80 rounded-md p-2 border border-slate-100/80">Behavioural</div>
                  <div className="text-[11px] font-semibold text-slate-700 bg-slate-50/80 rounded-md p-2 border border-slate-100/80">System Design</div>
                </div>
              </div>

              {/* CARD 5: Prep Kit */}
              <div className="absolute bottom-[-10px] left-[50%] -translate-x-[50%] bg-white/98 backdrop-blur-2xl border border-brand-200/80 rounded-[1.25rem] p-4 shadow-[0_20px_50px_rgb(79,70,229,0.15)] hover:shadow-[0_30px_60px_rgb(79,70,229,0.2)] w-[270px] z-50 animate-[float_6s_ease-in-out_infinite_1.5s] hover:-translate-y-1.5 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-brand-900">Prep Kit Ready</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center bg-slate-50/80 rounded-xl p-2 border border-slate-100/80">
                    <div className="text-base font-black text-brand-600">18</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Questions</div>
                  </div>
                  <div className="text-center bg-slate-50/80 rounded-xl p-2 border border-slate-100/80">
                    <div className="text-base font-black text-brand-600">12</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Flashcards</div>
                  </div>
                  <div className="text-center bg-slate-50/80 rounded-xl p-2 border border-slate-100/80">
                    <div className="text-base font-black text-brand-600">5</div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Day Plan</div>
                  </div>
                </div>
              </div>
              
            </div>
            
            {/* Bottom Subtle Taglines & Features - Moved up to fit viewport better */}
            <div className="absolute -bottom-10 w-full flex flex-col items-center justify-center opacity-70">
              <p className="text-[10px] font-bold text-slate-400 tracking-wide mb-2">From job description to interview-ready.</p>
              <div className="flex items-center gap-3 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Search className="w-2.5 h-2.5" /> Research</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="flex items-center gap-1"><BookOpen className="w-2.5 h-2.5" /> Practise</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="flex items-center gap-1"><Target className="w-2.5 h-2.5" /> Prepare</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
